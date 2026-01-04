
import { useState, useEffect } from 'react';
import { Entry, Category, Report } from '../types';
import { INITIAL_CATEGORIES } from '../constants';

export const useJournal = () => {
  const [entries, setEntries] = useState<Entry[]>(() => {
    const saved = localStorage.getItem('reflect_entries');
    return saved ? JSON.parse(saved) : [];
  });

  const [categories, setCategories] = useState<Category[]>(() => {
    const saved = localStorage.getItem('reflect_categories');
    return saved ? JSON.parse(saved) : INITIAL_CATEGORIES;
  });

  const [reports, setReports] = useState<Report[]>(() => {
    const saved = localStorage.getItem('reflect_reports');
    return saved ? JSON.parse(saved) : [];
  });

  useEffect(() => {
    localStorage.setItem('reflect_entries', JSON.stringify(entries));
  }, [entries]);

  useEffect(() => {
    localStorage.setItem('reflect_categories', JSON.stringify(categories));
  }, [categories]);

  useEffect(() => {
    localStorage.setItem('reflect_reports', JSON.stringify(reports));
  }, [reports]);

  const addEntry = (text: string, categoryId: string, customDate?: string) => {
    const tags = text.match(/#[\w\u0400-\u04FF]+/g) || [];
    
    let finalDate = new Date();
    
    if (customDate) {
      const [year, month, day] = customDate.split('-').map(Number);
      // Устанавливаем время на полдень (12:00:00) локального времени. 
      // Это гарантирует, что дата не "уплывет" при сохранении в ISOString
      finalDate = new Date(year, month - 1, day, 12, 0, 0);
    }

    const newEntry: Entry = {
      id: crypto.randomUUID(),
      text,
      categoryId,
      tags,
      createdAt: finalDate.toISOString(),
    };
    
    setEntries(prev => [newEntry, ...prev].sort((a, b) => 
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    ));
  };

  const updateEntry = (id: string, text: string, categoryId: string, customDate?: string) => {
    const tags = text.match(/#[\w\u0400-\u04FF]+/g) || [];
    
    let finalDate = new Date();
    
    if (customDate) {
      const [year, month, day] = customDate.split('-').map(Number);
      finalDate = new Date(year, month - 1, day, 12, 0, 0);
    }

    setEntries(prev => prev.map(e => 
      e.id === id 
        ? { ...e, text, categoryId, tags, createdAt: finalDate.toISOString() }
        : e
    ).sort((a, b) => 
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    ));
  };

  const deleteEntry = (id: string) => {
    setEntries(prev => prev.filter(e => e.id !== id));
  };

  const addCategory = (name: string, icon: string, color: string) => {
    const newCat: Category = { id: crypto.randomUUID(), name, icon, color };
    setCategories(prev => [...prev, newCat]);
  };

  const updateCategory = (id: string, name: string, icon: string, color: string) => {
    setCategories(prev => prev.map(c => c.id === id ? { ...c, name, icon, color } : c));
  };

  const deleteCategory = (id: string) => {
    setEntries(prev => prev.filter(e => e.categoryId !== id));
    setCategories(prev => prev.filter(c => c.id !== id));
  };

  const addReport = (report: Report) => {
    setReports(prev => [report, ...prev]);
  };

  const clearHistory = () => {
    if (confirm('Вы уверены, что хотите удалить все записи?')) {
      setEntries([]);
    }
  };

  return {
    entries,
    categories,
    reports,
    addEntry,
    updateEntry,
    deleteEntry,
    addCategory,
    updateCategory,
    deleteCategory,
    addReport,
    clearHistory
  };
};
