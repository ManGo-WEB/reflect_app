
/**
 * Типы для базы данных Supabase
 * Генерируются автоматически из схемы БД
 */

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      entries: {
        Row: {
          id: string
          user_id: string
          category_id: string
          text: string
          tags: string[]
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          category_id: string
          text: string
          tags?: string[]
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          category_id?: string
          text?: string
          tags?: string[]
          created_at?: string
        }
      }
      categories: {
        Row: {
          id: string
          user_id: string
          name: string
          icon: string
          color: string
          created_at?: string
        }
        Insert: {
          id?: string
          user_id: string
          name: string
          icon: string
          color: string
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          name?: string
          icon?: string
          color?: string
          created_at?: string
        }
      }
      reports: {
        Row: {
          id: string
          user_id: string
          period: string
          start_date: string
          end_date: string
          content: string
          generated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          period: string
          start_date: string
          end_date: string
          content: string
          generated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          period?: string
          start_date?: string
          end_date?: string
          content?: string
          generated_at?: string
        }
      }
    }
  }
}
