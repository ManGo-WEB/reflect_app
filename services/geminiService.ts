
import { GoogleGenAI } from "@google/genai";
import { Entry, Category } from "../types";

export const generateAIReport = async (
  entries: Entry[],
  categories: Category[],
  period: string
): Promise<string> => {
  if (!entries.length) {
    return "Записей за этот период не найдено.";
  }

  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  const entriesFormatted = entries.map(e => {
    const cat = categories.find(c => c.id === e.categoryId);
    return `[${new Date(e.createdAt).toLocaleTimeString('ru-RU')}][Категория: ${cat?.name || 'Неизвестно'}] ${e.text}`;
  }).join('\n');

  const periodTranslation: Record<string, string> = {
    'Day': 'дневной',
    'Week': 'еженедельный',
    'Month': 'ежемесячный'
  };

  const prompt = `
    Проанализируй следующие записи дневника и составь ${periodTranslation[period] || 'аналитический'} отчет.
    Ответ должен быть на русском языке в формате Markdown со следующими разделами:
    1. **Краткий обзор**: Краткое резюме ключевых событий и действий.
    2. **Эмоциональный фон**: Проанализируй эмоциональный тон и ментальное состояние, отраженные в записях.
    3. **Паттерны и инсайты**: Выяви повторяющиеся формы поведения, привычки или связи между действиями и эмоциями.
    4. **Рекомендации**: 2-3 совета для повышения осознанности или улучшения благополучия на основе наблюдений.

    Записи дневника:
    ${entriesFormatted}
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
      config: {
        temperature: 0.7,
        topP: 0.95,
      },
    });

    return response.text || "Не удалось сгенерировать отчет AI.";
  } catch (error) {
    console.error("AI Report Error:", error);
    throw new Error("Ошибка при генерации отчета. Проверьте настройки API или попробуйте позже.");
  }
};
