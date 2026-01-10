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
 * Создаёт Date на основе строки yyyy-MM-dd, но с временем из `timeSource` (локальное время).
 * Важно: использует UTC методы для создания даты, чтобы гарантировать, что при конвертации в ISO
 * дата не сместится на день назад/вперёд из-за часового пояса.
 * 
 * Пример: если пользователь выбрал 8 января и создал запись в 05:00 (UTC+8),
 * то в UTC это будет 21:00 7 января. Но мы хотим сохранить дату как 8 января.
 * Поэтому создаём Date в UTC с выбранной датой и реальным временем.
 */
export const combineDateStringWithTime = (dateString: string, timeSource: Date = new Date()): Date => {
  const [year, month, day] = dateString.split('-').map(Number);
  if (isNaN(year) || isNaN(month) || isNaN(day)) {
    throw new Error(`Invalid date string format: ${dateString}. Expected yyyy-MM-dd`);
  }

  // Используем UTC методы для создания даты, чтобы дата в UTC соответствовала выбранной
  // Время берём из timeSource (локальное время пользователя)
  const utcDate = new Date(Date.UTC(
    year,
    month - 1,
    day,
    timeSource.getHours(),
    timeSource.getMinutes(),
    timeSource.getSeconds(),
    timeSource.getMilliseconds()
  ));

  // Но это создаст дату в UTC, а нам нужно в локальном времени
  // Поэтому создаём в локальном времени, но проверяем, что дата не сместилась
  const localDate = new Date(
    year,
    month - 1,
    day,
    timeSource.getHours(),
    timeSource.getMinutes(),
    timeSource.getSeconds(),
    timeSource.getMilliseconds()
  );

  // Проверяем: если при конвертации в UTC дата сместилась, корректируем
  const utcYear = localDate.getUTCFullYear();
  const utcMonth = localDate.getUTCMonth() + 1;
  const utcDay = localDate.getUTCDate();

  // Если дата в UTC не совпадает с выбранной, корректируем
  if (utcYear !== year || utcMonth !== month || utcDay !== day) {
    // Смещение произошло - используем UTC дату с выбранной датой
    // но время оставляем реальное
    return new Date(Date.UTC(
      year,
      month - 1,
      day,
      timeSource.getHours(),
      timeSource.getMinutes(),
      timeSource.getSeconds(),
      timeSource.getMilliseconds()
    ));
  }

  return localDate;
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

