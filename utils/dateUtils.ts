/**
 * Утилиты для работы с датами
 * Централизованная логика форматирования и преобразования дат
 */

import { format, parseISO } from 'date-fns';

/**
 * Преобразует строку формата yyyy-MM-dd в Date объект
 * Устанавливает время на полдень (12:00:00) для избежания проблем с часовыми поясами
 */
export const parseDateString = (dateString: string): Date => {
  const [year, month, day] = dateString.split('-').map(Number);
  if (isNaN(year) || isNaN(month) || isNaN(day)) {
    throw new Error(`Invalid date string format: ${dateString}. Expected yyyy-MM-dd`);
  }
  // Устанавливаем время на полдень (12:00:00) локального времени
  // Это гарантирует, что дата не "уплывет" при сохранении в ISOString
  return new Date(year, month - 1, day, 12, 0, 0);
};

/**
 * Форматирует Date в строку формата yyyy-MM-dd для input[type="date"]
 */
export const formatDateForInput = (date: Date): string => {
  return format(date, 'yyyy-MM-dd');
};

/**
 * Форматирует ISO строку в формат yyyy-MM-dd для input[type="date"]
 */
export const formatISOStringForInput = (isoString: string): string => {
  return format(parseISO(isoString), 'yyyy-MM-dd');
};

/**
 * Форматирует Date в строку формата dd.MM.yyyy для отображения
 */
export const formatDateForDisplay = (date: Date): string => {
  return format(date, 'dd.MM.yyyy');
};

/**
 * Форматирует ISO строку в формат dd.MM.yyyy для отображения
 */
export const formatISOStringForDisplay = (isoString: string): string => {
  return format(parseISO(isoString), 'dd.MM.yyyy');
};

/**
 * Получает текущую дату в формате yyyy-MM-dd
 */
export const getTodayDateString = (): string => {
  return formatDateForInput(new Date());
};

/**
 * Создает Date из ISO строки с безопасной обработкой ошибок
 */
export const safeParseISO = (isoString: string): Date => {
  try {
    return parseISO(isoString);
  } catch (error) {
    console.error(`Error parsing ISO string: ${isoString}`, error);
    return new Date(); // Возвращаем текущую дату как fallback
  }
};
