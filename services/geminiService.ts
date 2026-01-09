
import { Entry, Category } from "../types";
import { getSystemPrompt } from "../config/systemPrompt";
import { buildReportPrompt } from "../config/reportPrompt";

// URL прокси-сервера (используем переменную окружения или дефолтное значение)
// В dev режиме используем относительный путь для проксирования через Vite
const PROXY_URL = import.meta.env.VITE_PROXY_URL || '';

export const generateAIReport = async (
  entries: Entry[],
  categories: Category[],
  period: string
): Promise<string> => {
  if (!entries.length) {
    return "Записей за этот период не найдено.";
  }

  // Формируем промпт для отчета
  const prompt = buildReportPrompt(entries, categories, period);

  try {
    console.log('Начинаю генерацию отчета AI через прокси...', { 
      entriesCount: entries.length, 
      period,
      model: 'gemini-3-flash-preview',
      proxyUrl: PROXY_URL
    });

    // Используем относительный путь для проксирования через Vite в dev режиме
    // Или полный URL если указан VITE_PROXY_URL
    const endpoint = PROXY_URL 
      ? `${PROXY_URL}/api/gemini/generate` 
      : '/api/gemini/generate';
    
    console.log('Отправка запроса к:', endpoint);
    
    // Получаем системный промпт
    const systemPrompt = getSystemPrompt();
    
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        prompt,
        systemInstruction: systemPrompt,
        model: 'gemini-3-flash-preview',
        temperature: 0.7,
        topP: 0.95,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
      console.error('Proxy Error Response:', errorData);
      throw new Error(errorData.error?.message || errorData.error || `HTTP ${response.status}: ${response.statusText}`);
    }

    const data = await response.json();
    
    if (!data.text || data.text.trim().length === 0) {
      console.error('Пустой ответ от прокси:', data);
      throw new Error('AI вернул пустой ответ');
    }

    const result = data.text.trim();
    console.log('Отчет успешно сгенерирован, длина:', result.length);
    return result;
  } catch (error: any) {
    console.error("AI Report Error:", error);
    
    // Более детальное сообщение об ошибке
    let errorMessage = "Ошибка при генерации отчета.";
    
    if (error?.message) {
      errorMessage += ` ${error.message}`;
    } else if (typeof error === 'string') {
      errorMessage += ` ${error}`;
    }
    
    // Специальные сообщения для частых ошибок
    if (error?.message?.includes('Failed to fetch') || error?.message?.includes('NetworkError')) {
      errorMessage = `Прокси-сервер недоступен. Убедитесь, что он запущен на ${PROXY_URL}. Запустите: npm run dev:proxy`;
    } else if (error?.message?.includes('API key') || error?.message?.includes('authentication')) {
      errorMessage = "Неверный API ключ Gemini. Проверьте переменную окружения GEMINI_API_KEY в прокси-сервере.";
    } else if (error?.message?.includes('quota') || error?.message?.includes('limit')) {
      errorMessage = "Превышен лимит запросов к Gemini API. Попробуйте позже.";
    } else if (error?.message?.includes('location') || error?.message?.includes('not supported')) {
      errorMessage = "Геолокация не поддерживается. Используйте прокси-сервер с VPN или прокси.";
    }
    
    throw new Error(errorMessage);
  }
};
