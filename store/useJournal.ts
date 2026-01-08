
import { useState, useEffect, useCallback } from 'react';
import { Entry, Category, Report } from '../types';
import { INITIAL_CATEGORIES } from '../constants';
import { combineDateStringWithTime } from '../utils/dateUtils';
import { useAuth } from '../hooks/useAuth';
import {
  getEntries,
  getCategories,
  getReports,
  createEntry as createEntryService,
  updateEntry as updateEntryService,
  deleteEntry as deleteEntryService,
  createCategory as createCategoryService,
  updateCategory as updateCategoryService,
  deleteCategory as deleteCategoryService,
  createReport as createReportService,
} from '../services/supabaseService';
import { migrateLocalStorageToSupabase, shouldMigrate } from '../utils/migrateLocalStorage';
import { useToast } from '../hooks/useToast';

export const useJournal = () => {
  const { user, loading: authLoading } = useAuth();
  const { showError, showSuccess } = useToast();
  
  const [entries, setEntries] = useState<Entry[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);
  const [migrationChecked, setMigrationChecked] = useState(false);

  // Загрузка данных из Supabase
  const loadData = useCallback(async () => {
    if (!user) {
      setEntries([]);
      setCategories([]);
      setReports([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      
      // Загружаем данные параллельно
      const [entriesData, categoriesData, reportsData] = await Promise.all([
        getEntries(user.id),
        getCategories(user.id),
        getReports(user.id),
      ]);

      setEntries(entriesData);
      
      // Если категорий нет, используем начальные
      if (categoriesData.length === 0) {
        // Создаем начальные категории
        const initialCats = await Promise.all(
          INITIAL_CATEGORIES.map((cat) =>
            createCategoryService(user.id, cat.name, cat.icon, cat.color).catch(() => cat)
          )
        );
        setCategories(initialCats.filter((c): c is Category => 'id' in c && typeof c.id === 'string'));
      } else {
        setCategories(categoriesData);
      }
      
      setReports(reportsData);

      // Проверяем и выполняем миграцию, если нужно
      if (!migrationChecked) {
        const needsMigration = await shouldMigrate(user.id);
        if (needsMigration) {
          try {
            const migrationResult = await migrateLocalStorageToSupabase(user.id);
            if (migrationResult.entriesMigrated > 0 || migrationResult.categoriesMigrated > 0) {
              showSuccess(`Мигрировано: ${migrationResult.entriesMigrated} записей, ${migrationResult.categoriesMigrated} категорий`);
              // Перезагружаем данные после миграции
              await loadData();
            }
            if (migrationResult.errors.length > 0) {
              console.error('Ошибки при миграции:', migrationResult.errors);
            }
          } catch (error: any) {
            console.error('Ошибка миграции:', error);
            showError('Ошибка при миграции данных из localStorage');
          }
        }
        setMigrationChecked(true);
      }
    } catch (error: any) {
      console.error('Ошибка загрузки данных:', error);
      showError('Ошибка при загрузке данных');
    } finally {
      setLoading(false);
    }
  }, [user, migrationChecked, showError, showSuccess]);

  // Загружаем данные при изменении пользователя
  useEffect(() => {
    if (!authLoading) {
      loadData();
    }
  }, [user, authLoading, loadData]);

  // Подписка на изменения в реальном времени (опционально)
  useEffect(() => {
    if (!user) return;

    // Можно добавить realtime подписки здесь для синхронизации данных
    // const channel = supabase.channel('journal-changes')
    //   .on('postgres_changes', { event: '*', schema: 'public', table: 'entries' }, () => {
    //     loadData();
    //   })
    //   .subscribe();
    // return () => { supabase.removeChannel(channel); };
  }, [user, loadData]);

  const addEntry = async (text: string, categoryId: string, customDate?: string) => {
    if (!user) {
      showError('Необходима авторизация');
      return;
    }

    try {
      // Важно: если пользователь выбирает дату, сохраняем ЕЁ, но время берём реальное (сейчас),
      // чтобы created_at отражал фактический момент создания, а не фиксированные 12:00.
      const now = new Date();
      const finalDate = customDate ? combineDateStringWithTime(customDate, now) : now;
      const newEntry = await createEntryService(user.id, text, categoryId, finalDate.toISOString());
      
      setEntries((prev) => [newEntry, ...prev].sort((a, b) => 
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      ));
    } catch (error: any) {
      console.error('Ошибка создания записи:', error);
      showError('Ошибка при создании записи');
      throw error;
    }
  };

  const updateEntry = async (id: string, text: string, categoryId: string, customDate?: string) => {
    if (!user) {
      showError('Необходима авторизация');
      return;
    }

    try {
      // При изменении даты сохраняем время исходной записи (если нашли её локально),
      // чтобы не "сбрасывать" часы/минуты на фиксированное значение.
      const existing = entries.find((e) => e.id === id);
      const timeSource = existing ? new Date(existing.createdAt) : new Date();
      const finalDate = customDate ? combineDateStringWithTime(customDate, timeSource) : new Date();
      const updatedEntry = await updateEntryService(user.id, id, text, categoryId, finalDate.toISOString());
      
      setEntries((prev) => prev.map((e) => 
        e.id === id ? updatedEntry : e
      ).sort((a, b) => 
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      ));
    } catch (error: any) {
      console.error('Ошибка обновления записи:', error);
      showError('Ошибка при обновлении записи');
      throw error;
    }
  };

  const deleteEntry = async (id: string) => {
    if (!user) {
      showError('Необходима авторизация');
      return;
    }

    try {
      await deleteEntryService(user.id, id);
      setEntries((prev) => prev.filter((e) => e.id !== id));
    } catch (error: any) {
      console.error('Ошибка удаления записи:', error);
      showError('Ошибка при удалении записи');
      throw error;
    }
  };

  const addCategory = async (name: string, icon: string, color: string) => {
    if (!user) {
      showError('Необходима авторизация');
      return;
    }

    try {
      const newCat = await createCategoryService(user.id, name, icon, color);
      setCategories((prev) => [...prev, newCat]);
    } catch (error: any) {
      console.error('Ошибка создания категории:', error);
      showError('Ошибка при создании категории');
      throw error;
    }
  };

  const updateCategory = async (id: string, name: string, icon: string, color: string) => {
    if (!user) {
      showError('Необходима авторизация');
      return;
    }

    try {
      const updatedCat = await updateCategoryService(user.id, id, name, icon, color);
      setCategories((prev) => prev.map((c) => c.id === id ? updatedCat : c));
    } catch (error: any) {
      console.error('Ошибка обновления категории:', error);
      showError('Ошибка при обновлении категории');
      throw error;
    }
  };

  const deleteCategory = async (id: string) => {
    if (!user) {
      showError('Необходима авторизация');
      return;
    }

    try {
      await deleteCategoryService(user.id, id);
      setEntries((prev) => prev.filter((e) => e.categoryId !== id));
      setCategories((prev) => prev.filter((c) => c.id !== id));
    } catch (error: any) {
      console.error('Ошибка удаления категории:', error);
      showError('Ошибка при удалении категории');
      throw error;
    }
  };

  const addReport = async (report: Report) => {
    if (!user) {
      showError('Необходима авторизация');
      return;
    }

    try {
      const newReport = await createReportService(user.id, report);
      setReports((prev) => [newReport, ...prev]);
    } catch (error: any) {
      console.error('Ошибка создания отчета:', error);
      showError('Ошибка при создании отчета');
      throw error;
    }
  };

  const clearHistory = async () => {
    if (!user) {
      showError('Необходима авторизация');
      return;
    }

    try {
      // Удаляем все записи
      await Promise.all(entries.map((entry) => deleteEntryService(user.id, entry.id)));
      setEntries([]);
      showSuccess('Все записи удалены');
    } catch (error: any) {
      console.error('Ошибка очистки истории:', error);
      showError('Ошибка при очистке истории');
    }
  };

  return {
    entries,
    categories,
    reports,
    loading: loading || authLoading,
    addEntry,
    updateEntry,
    deleteEntry,
    addCategory,
    updateCategory,
    deleteCategory,
    addReport,
    clearHistory,
    refresh: loadData,
  };
};
