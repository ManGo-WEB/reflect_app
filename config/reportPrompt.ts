import { Entry, Category } from "../types";

/**
 * Переводы периодов для промпта
 */
const PERIOD_TRANSLATION: Record<string, string> = {
  'Day': 'дневной',
  'Week': 'еженедельный',
  'Month': 'ежемесячный'
};

/**
 * Форматирует записи для включения в промпт
 */
const formatEntries = (entries: Entry[], categories: Category[]): string => {
  return entries.map(e => {
    const cat = categories.find(c => c.id === e.categoryId);
    return `[${new Date(e.createdAt).toLocaleTimeString('ru-RU')}][Категория: ${cat?.name || 'Неизвестно'}] ${e.text}`;
  }).join('\n');
};

/**
 * Формирует промпт для генерации AI отчета
 * 
 * @param entries - Записи дневника для анализа
 * @param categories - Категории для контекста
 * @param period - Период отчета ('Day', 'Week', 'Month')
 * @returns Сформированный промпт для отправки в AI
 */
export const buildReportPrompt = (
  entries: Entry[],
  categories: Category[],
  period: string
): string => {
  const entriesFormatted = formatEntries(entries, categories);
  const periodLabel = PERIOD_TRANSLATION[period] || 'аналитический';

  return `
    Проанализируй следующие записи дневника и составь ${periodLabel} отчет.
    Ответ должен быть на русском языке в формате Markdown со следующими разделами:
    1. **Краткий обзор**: Краткое резюме ключевых событий и действий.
    2. **Эмоциональный фон**: Проанализируй эмоциональный тон и ментальное состояние, отраженные в записях.
    3. **Паттерны и инсайты**: Выяви повторяющиеся формы поведения, привычки или связи между действиями и эмоциями.
    4. **Рекомендации**: 2-3 совета для повышения осознанности или улучшения благополучия на основе наблюдений.

    Записи дневника:
    ${entriesFormatted}
  `.trim();
};
