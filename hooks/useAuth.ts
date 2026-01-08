
import { useState, useEffect } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '../services/supabaseClient';

interface AuthState {
  user: User | null;
  session: Session | null;
  loading: boolean;
}

export const useAuth = () => {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    session: null,
    loading: true,
  });

  useEffect(() => {
    // Получаем текущую сессию
    supabase.auth.getSession().then(({ data: { session }, error }) => {
      if (error) {
        // Если ошибка с сессией (например, invalid token), очищаем сессию
        if (error.message?.includes('invalid session') || error.message?.includes('token')) {
          supabase.auth.signOut().catch(() => {});
        }
        setAuthState({
          user: null,
          session: null,
          loading: false,
        });
        return;
      }
      setAuthState({
        user: session?.user ?? null,
        session,
        loading: false,
      });
    });

    // Подписываемся на изменения состояния аутентификации
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      // Обрабатываем ошибки обновления токена
      if (event === 'TOKEN_REFRESHED' || event === 'SIGNED_IN') {
        setAuthState({
          user: session?.user ?? null,
          session,
          loading: false,
        });
      } else if (event === 'SIGNED_OUT' || event === 'USER_UPDATED') {
        setAuthState({
          user: session?.user ?? null,
          session,
          loading: false,
        });
      } else {
        setAuthState({
          user: session?.user ?? null,
          session,
          loading: false,
        });
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const signUp = async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signUp({
      email: email.trim(),
      password,
    });

    if (error) {
      console.error('Sign up error:', error);
      // Более детальные сообщения об ошибках
      if (error.message?.includes('already registered') || error.message?.includes('already exists')) {
        throw new Error('Пользователь с таким email уже зарегистрирован');
      } else if (error.message?.includes('Password')) {
        throw new Error('Пароль не соответствует требованиям');
      } else if (error.status === 400) {
        throw new Error(`Ошибка регистрации: ${error.message || 'Проверьте правильность данных'}`);
      }
      throw error;
    }
    return data;
  };

  const signIn = async (email: string, password: string) => {
    try {
      const trimmedEmail = email.trim().toLowerCase();
      
      console.log('Attempting sign in with:', {
        email: trimmedEmail,
        passwordLength: password.length,
        timestamp: new Date().toISOString()
      });

      const { data, error } = await supabase.auth.signInWithPassword({
        email: trimmedEmail,
        password,
      });

      if (error) {
        console.error('Sign in error details:', {
          message: error.message,
          status: error.status,
          name: error.name,
          code: error.code,
          fullError: JSON.stringify(error, null, 2),
          emailUsed: trimmedEmail
        });
        
        // Более детальные сообщения об ошибках
        if (error.code === 'invalid_credentials' || 
            error.message?.includes('Invalid login credentials') || 
            error.message?.includes('invalid')) {
          // Возможные причины:
          // 1. Пользователь не существует
          // 2. Пароль неверный
          // 3. Email не подтвержден (даже если отключено, старые пользователи могут требовать подтверждения)
          throw new Error('Неверный email или пароль. Попробуйте сбросить пароль или зарегистрируйтесь заново.');
        } else if (error.message?.includes('Email not confirmed') || 
                   error.message?.includes('email_not_confirmed')) {
          throw new Error('Email не подтвержден. Проверьте почту и подтвердите регистрацию.');
        } else if (error.status === 400) {
          // Детальная информация об ошибке 400 для диагностики
          const errorDetails = error.message || error.code || 'Неизвестная ошибка';
          console.error('HTTP 400 error details:', errorDetails);
          throw new Error(`Ошибка авторизации (400): ${errorDetails}. Проверьте настройки Supabase проекта.`);
        }
        throw error;
      }
      
      console.log('Sign in successful:', {
        userId: data.user?.id,
        email: data.user?.email,
        sessionExists: !!data.session
      });
      
      return data;
    } catch (err: any) {
      // Логируем полную ошибку для диагностики
      console.error('Sign in exception:', err);
      throw err;
    }
  };

  const signOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  };

  return {
    ...authState,
    signUp,
    signIn,
    signOut,
  };
};
