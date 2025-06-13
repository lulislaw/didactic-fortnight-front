import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'


export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,    // порт dev-сервера Vite
    open: true,    // автоматически открыть браузер
  },
  resolve: {
    alias: {
      '@': '/src', // если захотите использовать '@/components/…'
    },
  },
});