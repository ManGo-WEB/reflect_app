
/**
 * Утилита для миграции данных из localStorage в Supabase
 */

import { safeGetItem } from './localStorageUtils';
import { INITIAL_CATEGORIES } from '../constants';
import { Entry, Category, Report } from '../types';
import {
  createEntry,
  createCategory,
  createReport,
  getCategories,
  getEntries,
} from '../services/supabaseService';

const STORAGE_KEYS = {
  entries: 'reflect_entries',
  categories: 'reflect_categories',
  reports: 'reflect_reports',
} as const;

interface MigrationResult {
  entriesMigrated: number;
  categoriesMigrated: number;
  reportsMigrated: number;
  errors: string[];
}

/**
 * Мигрирует данные из localStorage в Supabase
 * Проверяет наличие данных в БД и пропускает миграцию, если данные уже существуют
 */
export const migrateLocalStorageToSupabase = async (
  userId: string
): Promise<MigrationResult> => {
  const result: MigrationResult = {
    entriesMigrated: 0,
    categoriesMigrated: 0,
    reportsMigrated: 0,
    errors: [],
  };

  try {
    // Проверяем, есть ли уже данные в БД
    const existingEntries = await getEntries(userId);
    const existingCategories = await getCategories(userId);

    // Если данные уже есть, пропускаем миграцию
    if (existingEntries.length > 0 || existingCategories.length > 0) {
      console.log('Данные уже существуют в Supabase, миграция не требуется');
      return result;
    }

    // Миграция категорий
    try {
      const localCategories = safeGetItem<Category[]>(STORAGE_KEYS.categories, INITIAL_CATEGORIES);
      
      // Пропускаем начальные категории, если они уже есть в БД
      for (const category of localCategories) {
        try {
          await createCategory(userId, category.name, category.icon, category.color);
          result.categoriesMigrated++;
        } catch (error: any) {
          // Если категория уже существует (уникальное ограничение), пропускаем
          if (error.code !== '23505') {
            result.errors.push(`Ошибка миграции категории "${category.name}": ${error.message}`);
          }
        }
      }
    } catch (error: any) {
      result.errors.push(`Ошибка при миграции категорий: ${error.message}`);
    }

    // Миграция записей
    try {
      const localEntries = safeGetItem<Entry[]>(STORAGE_KEYS.entries, []);
      
      // Нужно получить актуальные категории из БД для маппинга categoryId
      const dbCategories = await getCategories(userId);
      const categoryMap = new Map<string, string>();
      
      // Создаем маппинг старых ID на новые
      const localCategories = safeGetItem<Category[]>(STORAGE_KEYS.categories, INITIAL_CATEGORIES);
      localCategories.forEach((localCat) => {
        const dbCat = dbCategories.find((c) => c.name === localCat.name && c.color === localCat.color);
        if (dbCat) {
          categoryMap.set(localCat.id, dbCat.id);
        }
      });

      for (const entry of localEntries) {
        try {
          const newCategoryId = categoryMap.get(entry.categoryId);
          if (!newCategoryId) {
            result.errors.push(`Категория не найдена для записи ${entry.id}`);
            continue;
          }

          await createEntry(userId, entry.text, newCategoryId, entry.createdAt);
          result.entriesMigrated++;
        } catch (error: any) {
          result.errors.push(`Ошибка миграции записи ${entry.id}: ${error.message}`);
        }
      }
    } catch (error: any) {
      result.errors.push(`Ошибка при миграции записей: ${error.message}`);
    }

    // Миграция отчетов
    try {
      const localReports = safeGetItem<Report[]>(STORAGE_KEYS.reports, []);
      
      for (const report of localReports) {
        try {
          await createReport(userId, report);
          result.reportsMigrated++;
        } catch (error: any) {
          result.errors.push(`Ошибка миграции отчета ${report.id}: ${error.message}`);
        }
      }
    } catch (error: any) {
      result.errors.push(`Ошибка при миграции отчетов: ${error.message}`);
    }

    // После успешной миграции можно очистить localStorage (опционально)
    // Раскомментируйте, если хотите удалить данные после миграции
    /*
    if (result.errors.length === 0) {
      localStorage.removeItem(STORAGE_KEYS.entries);
      localStorage.removeItem(STORAGE_KEYS.categories);
      localStorage.removeItem(STORAGE_KEYS.reports);
    }
    */
  } catch (error: any) {
    result.errors.push(`Критическая ошибка миграции: ${error.message}`);
  }

  return result;
};

/**
 * Проверяет, нужно ли выполнить миграцию
 */
export const shouldMigrate = (userId: string): Promise<boolean> => {
  return new Promise(async (resolve) => {
    try {
      const existingEntries = await getEntries(userId);
      const existingCategories = await getCategories(userId);
      
      // Миграция нужна, если в localStorage есть данные, а в БД их нет
      const hasLocalData =
        safeGetItem<Entry[]>(STORAGE_KEYS.entries, []).length > 0 ||
        safeGetItem<Category[]>(STORAGE_KEYS.categories, INITIAL_CATEGORIES).length >
          INITIAL_CATEGORIES.length ||
        safeGetItem<Report[]>(STORAGE_KEYS.reports, []).length > 0;

      const hasDbData = existingEntries.length > 0 || existingCategories.length > 0;

      resolve(hasLocalData && !hasDbData);
    } catch (error) {
      console.error('Ошибка при проверке необходимости миграции:', error);
      resolve(false);
    }
  });
};
