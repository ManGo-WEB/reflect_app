/**
 * Утилиты для безопасной работы с localStorage
 * Обрабатывает ошибки при чтении/записи данных
 */

/**
 * Безопасное получение данных из localStorage
 */
export const safeGetItem = <T>(key: string, defaultValue: T): T => {
  try {
    const item = localStorage.getItem(key);
    if (!item) {
      return defaultValue;
    }
    return JSON.parse(item) as T;
  } catch (error) {
    console.error(`Error reading from localStorage key "${key}":`, error);
    // Очищаем поврежденные данные
    try {
      localStorage.removeItem(key);
    } catch (removeError) {
      console.error(`Error removing corrupted localStorage key "${key}":`, removeError);
    }
    return defaultValue;
  }
};

/**
 * Безопасное сохранение данных в localStorage
 */
export const safeSetItem = <T>(key: string, value: T): boolean => {
  try {
    const serialized = JSON.stringify(value);
    localStorage.setItem(key, serialized);
    return true;
  } catch (error) {
    console.error(`Error writing to localStorage key "${key}":`, error);
    
    // Проверяем, не переполнен ли localStorage
    if (error instanceof DOMException && error.code === 22) {
      console.warn('localStorage is full. Consider clearing old data.');
    }
    
    return false;
  }
};
