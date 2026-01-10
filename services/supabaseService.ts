
import { supabase } from './supabaseClient';
import { Entry, Category, Report } from '../types';
import { Database } from './database.types';

// Функция для обработки ошибок аутентификации
const handleAuthError = (error: any) => {
  if (error?.message?.includes('invalid session') || 
      error?.message?.includes('token') ||
      error?.message?.includes('JWT') ||
      error?.code === 'PGRST301' ||
      error?.status === 401) {
    // Очищаем сессию при ошибке токена
    if (typeof window !== 'undefined') {
      // Очищаем сессию Supabase из localStorage
      const supabaseKeys = Object.keys(localStorage).filter(key => 
        key.startsWith('sb-') || key.includes('supabase')
      );
      supabaseKeys.forEach(key => localStorage.removeItem(key));
    }
    supabase.auth.signOut().catch(() => {});
  }
  throw error;
};

type EntriesRow = Database['public']['Tables']['entries']['Row'];
type EntriesInsert = Database['public']['Tables']['entries']['Insert'];
type EntriesUpdate = Database['public']['Tables']['entries']['Update'];
type CategoriesRow = Database['public']['Tables']['categories']['Row'];
type CategoriesInsert = Database['public']['Tables']['categories']['Insert'];
type CategoriesUpdate = Database['public']['Tables']['categories']['Update'];
type ReportsRow = Database['public']['Tables']['reports']['Row'];
type ReportsInsert = Database['public']['Tables']['reports']['Insert'];

/**
 * Сервис для работы с данными через Supabase
 */

// ========== ENTRIES ==========

export const getEntries = async (userId: string): Promise<Entry[]> => {
  const { data, error } = await supabase
    .from('entries')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (error) {
    handleAuthError(error);
    return [];
  }
  if (!data) return [];

  return (data as EntriesRow[]).map((row) => ({
    id: row.id,
    categoryId: row.category_id,
    text: row.text,
    tags: row.tags || [],
    createdAt: row.created_at,
  }));
};

export const createEntry = async (
  userId: string,
  text: string,
  categoryId: string,
  createdAt: string
): Promise<Entry> => {
  const tags = text.match(/#[\w\u0400-\u04FF]+/g) || [];

  const insertData: EntriesInsert = {
    user_id: userId,
    category_id: categoryId,
    text,
    tags,
    created_at: createdAt,
  };

  const { data, error } = await supabase
    .from('entries')
    // @ts-expect-error - Supabase types inference issue
    .insert(insertData)
    .select()
    .single();

  if (error) {
    handleAuthError(error);
    throw error;
  }
  if (!data) throw new Error('Failed to create entry');

  const row = data as EntriesRow;
  return {
    id: row.id,
    categoryId: row.category_id,
    text: row.text,
    tags: row.tags || [],
    createdAt: row.created_at,
  };
};

export const updateEntry = async (
  userId: string,
  entryId: string,
  text: string,
  categoryId: string,
  createdAt: string
): Promise<Entry> => {
  const tags = text.match(/#[\w\u0400-\u04FF]+/g) || [];

  const updateData: EntriesUpdate = {
    category_id: categoryId,
    text,
    tags,
    created_at: createdAt,
  };

  const { data, error } = await supabase
    .from('entries')
    // @ts-expect-error - Supabase types inference issue
    .update(updateData)
    .eq('id', entryId)
    .eq('user_id', userId)
    .select()
    .single();

  if (error) throw error;
  if (!data) throw new Error('Failed to update entry');

  const row = data as EntriesRow;
  return {
    id: row.id,
    categoryId: row.category_id,
    text: row.text,
    tags: row.tags || [],
    createdAt: row.created_at,
  };
};

export const deleteEntry = async (userId: string, entryId: string): Promise<void> => {
  const { error } = await supabase
    .from('entries')
    .delete()
    .eq('id', entryId)
    .eq('user_id', userId);

  if (error) {
    handleAuthError(error);
    throw error;
  }
};

// ========== CATEGORIES ==========

export const getCategories = async (userId: string): Promise<Category[]> => {
  const { data, error } = await supabase
    .from('categories')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: true });

  if (error) {
    handleAuthError(error);
    return [];
  }
  if (!data) return [];

  return (data as CategoriesRow[]).map((row) => ({
    id: row.id,
    name: row.name,
    icon: row.icon,
    color: row.color,
  }));
};

export const createCategory = async (
  userId: string,
  name: string,
  icon: string,
  color: string
): Promise<Category> => {
  const insertData: CategoriesInsert = {
    user_id: userId,
    name,
    icon,
    color,
  };

  const { data, error } = await supabase
    .from('categories')
    // @ts-expect-error - Supabase types inference issue
    .insert(insertData)
    .select()
    .single();

  if (error) throw error;
  if (!data) throw new Error('Failed to create category');

  const row = data as CategoriesRow;
  return {
    id: row.id,
    name: row.name,
    icon: row.icon,
    color: row.color,
  };
};

export const updateCategory = async (
  userId: string,
  categoryId: string,
  name: string,
  icon: string,
  color: string
): Promise<Category> => {
  const updateData: CategoriesUpdate = {
    name,
    icon,
    color,
  };

  const { data, error } = await supabase
    .from('categories')
    // @ts-expect-error - Supabase types inference issue
    .update(updateData)
    .eq('id', categoryId)
    .eq('user_id', userId)
    .select()
    .single();

  if (error) throw error;
  if (!data) throw new Error('Failed to update category');

  const row = data as CategoriesRow;
  return {
    id: row.id,
    name: row.name,
    icon: row.icon,
    color: row.color,
  };
};

export const deleteCategory = async (userId: string, categoryId: string): Promise<void> => {
  // Удаляем сначала все записи с этой категорией, затем саму категорию
  const { error: entriesError } = await supabase.from('entries').delete().eq('category_id', categoryId).eq('user_id', userId);
  if (entriesError) {
    handleAuthError(entriesError);
  }

  const { error } = await supabase
    .from('categories')
    .delete()
    .eq('id', categoryId)
    .eq('user_id', userId);

  if (error) {
    handleAuthError(error);
    throw error;
  }
};

// ========== REPORTS ==========

export const getReports = async (userId: string): Promise<Report[]> => {
  const { data, error } = await supabase
    .from('reports')
    .select('*')
    .eq('user_id', userId)
    .order('generated_at', { ascending: false });

  if (error) {
    handleAuthError(error);
    return [];
  }
  if (!data) return [];

  return (data as ReportsRow[]).map((row) => ({
    id: row.id,
    period: row.period,
    startDate: row.start_date,
    endDate: row.end_date,
    content: row.content,
    generatedAt: row.generated_at,
  }));
};

export const createReport = async (userId: string, report: Omit<Report, 'id'>): Promise<Report> => {
  const insertData: ReportsInsert = {
    user_id: userId,
    period: report.period,
    start_date: report.startDate,
    end_date: report.endDate,
    content: report.content,
    generated_at: report.generatedAt,
  };

  const { data, error } = await supabase
    .from('reports')
    // @ts-expect-error - Supabase types inference issue
    .insert(insertData)
    .select()
    .single();

  if (error) throw error;
  if (!data) throw new Error('Failed to create report');

  const row = data as ReportsRow;
  return {
    id: row.id,
    period: row.period,
    startDate: row.start_date,
    endDate: row.end_date,
    content: row.content,
    generatedAt: row.generated_at,
  };
};

export const deleteReport = async (userId: string, reportId: string): Promise<void> => {
  const { error } = await supabase
    .from('reports')
    .delete()
    .eq('id', reportId)
    .eq('user_id', userId);

  if (error) {
    handleAuthError(error);
    throw error;
  }
};
