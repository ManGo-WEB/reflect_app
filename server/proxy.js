import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { HttpsProxyAgent } from 'https-proxy-agent';

// Динамический импорт node-fetch для ES модулей
const { default: fetch } = await import('node-fetch');

dotenv.config({ path: '.env.local' });

const app = express();
const PORT = process.env.PROXY_SERVER_PORT || 3001;

// CORS настройки
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Парсинг JSON
app.use(express.json());

// Настройка прокси из переменных окружения или дефолтных значений
const PROXY_HOST = process.env.PROXY_HOST || '139.177.145.55';
const PROXY_PORT = process.env.PROXY_PORT || '1402';
const PROXY_USER = process.env.PROXY_USER || 'user287404';
const PROXY_PASS = process.env.PROXY_PASS || '4sxapj';

// Создаем прокси агент для HTTP/HTTPS запросов
const proxyUrl = `http://${PROXY_USER}:${PROXY_PASS}@${PROXY_HOST}:${PROXY_PORT}`;
const proxyAgent = new HttpsProxyAgent(proxyUrl);

console.log(`Прокси настроен: ${PROXY_HOST}:${PROXY_PORT}`);
console.log(`Прокси пользователь: ${PROXY_USER}`);

// Прокси эндпоинт для Gemini API
app.post('/api/gemini/generate', async (req, res) => {
  try {
    const { prompt, model = 'gemini-3-flash-preview', temperature = 0.7, topP = 0.95 } = req.body;

    if (!prompt) {
      return res.status(400).json({ error: 'Prompt is required' });
    }

    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
      return res.status(500).json({ error: 'GEMINI_API_KEY is not configured' });
    }

    // Используем прокси для запросов к Gemini API для обхода геолокации
    const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;

    console.log('Отправка запроса через прокси к Gemini API...');

    const response = await fetch(geminiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      agent: proxyAgent, // Используем прокси агент
      body: JSON.stringify({
        contents: [{
          parts: [{
            text: prompt
          }]
        }],
        generationConfig: {
          temperature,
          topP,
        },
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('Gemini API Error:', errorData);
      return res.status(response.status).json({ 
        error: errorData.error || 'API request failed',
        details: errorData
      });
    }

    const data = await response.json();

    // Извлекаем текст из ответа
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text || '';

    if (!text) {
      console.error('Empty response from Gemini API:', JSON.stringify(data, null, 2));
      return res.status(500).json({ error: 'Empty response from Gemini API' });
    }

    console.log('Отчет успешно сгенерирован, длина:', text.length);
    res.json({ text });
  } catch (error) {
    console.error('Proxy Error:', error);
    res.status(500).json({ 
      error: error.message || 'Internal server error',
      details: error.toString()
    });
  }
});

// Health check - должен быть ДО всех middleware
app.get('/api/health', (req, res) => {
  res.setHeader('Content-Type', 'application/json');
  res.json({ 
    status: 'ok',
    proxy: {
      host: PROXY_HOST,
      port: PROXY_PORT,
      user: PROXY_USER
    },
    timestamp: new Date().toISOString()
  });
});

app.listen(PORT, () => {
  console.log(`\n====================================`);
  console.log(`Gemini Proxy Server running on port ${PORT}`);
  console.log(`API Key configured: ${process.env.GEMINI_API_KEY ? 'Yes' : 'No'}`);
  console.log(`Прокси настроен: ${PROXY_HOST}:${PROXY_PORT}`);
  console.log(`====================================\n`);
});
