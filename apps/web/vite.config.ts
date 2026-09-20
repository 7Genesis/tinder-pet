import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';

// A base vem da variável VITE_BASE para funcionar no GitHub Pages (subcaminho do repositório).
export default defineConfig({
  base: process.env.VITE_BASE ?? '/',
  plugins: [react()],
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: './src/test/setup.ts',
  },
});
