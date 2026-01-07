
import { useState, useEffect } from 'react';
import { Entry, Category, Report } from '../types';
import { INITIAL_CATEGORIES } from '../constants';
import { safeGetItem, safeSetItem } from '../utils/localStorageUtils';
import { parseDateString } from '../utils/dateUtils';

const STORAGE_KEYS = {
  entries: 'reflect_entries',
  categories: 'reflect_categories',
  reports: 'reflect_reports',
} as const;

export const useJournal = () => {
  const [entries, setEntries] = useState<Entry[]>(() => {
    return safeGetItem<Entry[]>(STORAGE_KEYS.entries, []);
  });

  const [categories, setCategories] = useState<Category[]>(() => {
    return safeGetItem<Category[]>(STORAGE_KEYS.categories, INITIAL_CATEGORIES);
  });

  const [reports, setReports] = useState<Report[]>(() => {
    return safeGetItem<Report[]>(STORAGE_KEYS.reports, []);
  });

  useEffect(() => {
    const success = safeSetItem(STORAGE_KEYS.entries, entries);
    if (!success) {
      console.warn('Failed to save entries to localStorage');
    }
  }, [entries]);

  useEffect(() => {
    const success = safeSetItem(STORAGE_KEYS.categories, categories);
    if (!success) {
      console.warn('Failed to save categories to localStorage');
    }
  }, [categories]);

  useEffect(() => {
    const success = safeSetItem(STORAGE_KEYS.reports, reports);
    if (!success) {
      console.warn('Failed to save reports to localStorage');
    }
  }, [reports]);

  const addEntry = (text: string, categoryId: string, customDate?: string) => {
    const tags = text.match(/#[\w\u0400-\u04FF]+/g) || [];
    
    const finalDate = customDate ? parseDateString(customDate) : new Date();

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
    
    const finalDate = customDate ? parseDateString(customDate) : new Date();

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
