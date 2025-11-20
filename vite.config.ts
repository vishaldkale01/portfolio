import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');

  return {
    plugins: [react()],
    base: '', // keep this for GitHub pages

    server: {
      port: 5173,
      proxy: {
        '/api': {
          target: env.VITE_API_URL, // reads from .env files
          changeOrigin: true,
        },
      },
    },
  };
});
