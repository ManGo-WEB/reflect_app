import path from 'path';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
    // Загружаем переменные без префикса для сервера
    const env = loadEnv(mode, '.', '');
    // Загружаем переменные с префиксом VITE_ для клиента
    const viteEnv = loadEnv(mode, '.', 'VITE_');
    
    return {
      server: {
        port: 3000,
        host: '0.0.0.0',
        proxy: {
          // Прокси для Gemini API через Vite dev server
          '/api/gemini': {
            target: 'http://localhost:3001',
            changeOrigin: true,
            secure: false,
          },
          // Прокси для health check
          '/api/health': {
            target: 'http://localhost:3001',
            changeOrigin: true,
            secure: false,
          },
        },
      },
      plugins: [
        react(),
      ],
      define: {
        'process.env.API_KEY': JSON.stringify(env.GEMINI_API_KEY || viteEnv.VITE_GEMINI_API_KEY || ''),
        'process.env.GEMINI_API_KEY': JSON.stringify(env.GEMINI_API_KEY || viteEnv.VITE_GEMINI_API_KEY || ''),
        'import.meta.env.GEMINI_API_KEY': JSON.stringify(env.GEMINI_API_KEY || viteEnv.VITE_GEMINI_API_KEY || ''),
        'import.meta.env.VITE_GEMINI_API_KEY': JSON.stringify(viteEnv.VITE_GEMINI_API_KEY || env.GEMINI_API_KEY || ''),
      },
      envPrefix: ['VITE_'],
      resolve: {
        alias: {
          '@': path.resolve(__dirname, '.'),
        },
      },
      optimizeDeps: {
        include: ['react', 'react-dom', 'react/jsx-runtime'],
        force: false,
      },
    };
});
