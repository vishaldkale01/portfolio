import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  base: '/portfolio/', // ✅ Must match your repo name
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'https://portfolio-etg0.onrender.com',
        changeOrigin: true,
      },
    },
    allowedHosts: ['.vercel.app', '.github.io', '.ngrok-free.app'],
  },
});
