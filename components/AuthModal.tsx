
import React, { useState } from 'react';
import { 
  XMarkIcon as X,
  EnvelopeIcon as Mail,
  LockClosedIcon as Lock,
  UserIcon,
  ExclamationCircleIcon as AlertCircle,
  EyeIcon as Eye,
  EyeSlashIcon as EyeOff
} from '@heroicons/react/24/outline';
import { useAuth } from '../hooks/useAuth';
import { useToast } from '../hooks/useToast';
import { supabase } from '../services/supabaseClient';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose, onSuccess }) => {
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const { signIn, signUp } = useAuth();
  const { showSuccess, showError } = useToast();

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password.trim()) {
      showError('Заполните все поля');
      return;
    }

    if (password.length < 6) {
      showError('Пароль должен содержать минимум 6 символов');
      return;
    }

    setLoading(true);
    setErrorMessage(null); // Очищаем предыдущую ошибку
    
    try {
      if (isSignUp) {
        await signUp(email, password);
        showSuccess('Регистрация успешна! Проверьте email для подтверждения.');
        setIsSignUp(false);
        setEmail('');
        setPassword('');
        setErrorMessage(null);
      } else {
        await signIn(email, password);
        showSuccess('Вход выполнен успешно!');
        setErrorMessage(null);
        onSuccess?.();
        onClose();
        setEmail('');
        setPassword('');
      }
    } catch (error: any) {
      console.error('Auth error details:', error);
      
      // Определяем понятное сообщение об ошибке
      let message = 'Произошла ошибка при аутентификации';
      
      // Обрабатываем разные типы ошибок
      if (error?.message) {
        if (error.message.includes('Invalid login credentials') || 
            error.message.includes('invalid_credentials') ||
            error.code === 'invalid_credentials') {
          message = 'Неверный email или пароль. Проверьте правильность введенных данных.';
        } else if (error.message.includes('Email not confirmed') || 
                   error.message.includes('email_not_confirmed')) {
          message = 'Email не подтвержден. Проверьте почту и подтвердите регистрацию.';
        } else if (error.message.includes('User already registered') ||
                   error.message.includes('already registered')) {
          message = 'Пользователь с таким email уже зарегистрирован. Войдите или восстановите пароль.';
        } else {
          message = error.message;
        }
      } else if (typeof error === 'string') {
        message = error;
      }
      
      // Показываем ошибку и в модальном окне, и через toast
      setErrorMessage(message);
      showError(message);
    } finally {
      setLoading(false);
    }
  };

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div
      className="fixed inset-0 z-[70] flex items-center justify-center bg-[rgba(0,0,0,0.5)] p-4"
      onClick={handleBackdropClick}
      role="dialog"
      aria-modal="true"
      aria-labelledby="auth-modal-title"
    >
      <div className="bg-white w-full max-w-md rounded-lg elevation-16 p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 id="auth-modal-title" className="text-xl font-medium text-[rgba(0,0,0,0.87)]">
            {isSignUp ? 'Регистрация' : 'Вход'}
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-[rgba(0,0,0,0.04)] rounded-full transition-colors ripple"
            aria-label="Закрыть модальное окно"
          >
            <X className="w-5 h-5 text-[rgba(0,0,0,0.6)]" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Отображение ошибки прямо в модальном окне */}
          {errorMessage && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3 flex items-start gap-2">
              <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="text-sm font-medium text-red-800">{errorMessage}</p>
                {errorMessage.includes('Неверный email или пароль') && (
                  <div className="text-xs text-red-600 mt-1 space-y-1">
                    <p>Возможные причины:</p>
                    <ul className="list-disc list-inside space-y-0.5 ml-2">
                      <li>Пароль неверный или был изменен</li>
                      <li>Пользователь был создан без пароля</li>
                      <li>Email требует подтверждения</li>
                    </ul>
                    <p className="mt-1">Попробуйте сбросить пароль или зарегистрируйтесь заново.</p>
                  </div>
                )}
              </div>
              <button
                type="button"
                onClick={() => setErrorMessage(null)}
                className="flex-shrink-0 p-1 hover:bg-red-100 rounded transition-colors"
                aria-label="Закрыть ошибку"
              >
                <X className="w-4 h-4 text-red-600" />
              </button>
            </div>
          )}

          <div>
            <label htmlFor="auth-email" className="block text-xs font-medium text-[rgba(0,0,0,0.6)] mb-2">
              Email
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[rgba(0,0,0,0.38)]" />
              <input
                id="auth-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="your@email.com"
                className="w-full h-12 bg-[rgba(0,0,0,0.04)] border-b-2 border-[rgba(0,0,0,0.42)] focus:border-[#1976D2] rounded-t pl-10 pr-4 text-[rgba(0,0,0,0.87)] font-normal outline-none transition-all"
                required
                autoFocus
                disabled={loading}
              />
            </div>
          </div>

          <div>
            <label htmlFor="auth-password" className="block text-xs font-medium text-[rgba(0,0,0,0.6)] mb-2">
              Пароль
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[rgba(0,0,0,0.38)] pointer-events-none z-10" />
              <input
                id="auth-password"
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Минимум 6 символов"
                className="w-full h-12 bg-[rgba(0,0,0,0.04)] border-b-2 border-[rgba(0,0,0,0.42)] focus:border-[#1976D2] rounded-t pl-10 pr-12 text-[rgba(0,0,0,0.87)] font-normal outline-none transition-all"
                required
                minLength={6}
                disabled={loading}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-1 hover:bg-[rgba(0,0,0,0.04)] rounded transition-colors"
                aria-label={showPassword ? 'Скрыть пароль' : 'Показать пароль'}
                disabled={loading}
              >
                {showPassword ? (
                  <EyeOff className="w-5 h-5 text-[rgba(0,0,0,0.38)] hover:text-[rgba(0,0,0,0.6)]" />
                ) : (
                  <Eye className="w-5 h-5 text-[rgba(0,0,0,0.38)] hover:text-[rgba(0,0,0,0.6)]" />
                )}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading || !email.trim() || !password.trim()}
            className="w-full py-3 bg-[#1976D2] text-white rounded-lg font-medium text-base hover:bg-[#1565C0] elevation-2 disabled:opacity-38 disabled:elevation-0 disabled:cursor-not-allowed transition-all active:scale-[0.98] flex items-center justify-center gap-2 ripple"
          >
            {loading ? (
              <>
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                {isSignUp ? 'Регистрация...' : 'Вход...'}
              </>
            ) : (
              <>
                <UserIcon className="w-5 h-5" />
                {isSignUp ? 'Зарегистрироваться' : 'Войти'}
              </>
            )}
          </button>
        </form>

        <div className="mt-6 space-y-3">
          <div className="text-center">
            <button
              onClick={() => {
                setIsSignUp(!isSignUp);
                setEmail('');
                setPassword('');
                setErrorMessage(null); // Очищаем ошибку при переключении режима
              }}
              className="text-sm text-[#1976D2] hover:underline"
              disabled={loading}
            >
              {isSignUp ? 'Уже есть аккаунт? Войти' : 'Нет аккаунта? Зарегистрироваться'}
            </button>
          </div>
          
          {!isSignUp && (
            <div className="text-center">
              <button
                type="button"
                onClick={async () => {
                  if (!email.trim()) {
                    setErrorMessage('Введите email для восстановления пароля');
                    return;
                  }
                  try {
                    const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), {
                      redirectTo: `${window.location.origin}/reset-password`,
                    });
                    if (error) {
                      setErrorMessage(`Ошибка: ${error.message}`);
                    } else {
                      showSuccess('Письмо для сброса пароля отправлено на ваш email');
                    }
                  } catch (err: any) {
                    setErrorMessage(`Ошибка: ${err.message}`);
                  }
                }}
                className="text-xs text-[rgba(0,0,0,0.6)] hover:text-[#1976D2] hover:underline"
                disabled={loading}
              >
                Забыли пароль?
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
