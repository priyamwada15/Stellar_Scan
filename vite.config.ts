import { resolve } from 'path';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import { apiDevPlugin } from './dev-api-plugin';

export default defineConfig({
  plugins: [react(), tailwindcss(), apiDevPlugin()],
  server: {
    port: 3000,
    host: '0.0.0.0'
  },
  build: {
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
        designSystem: resolve(__dirname, 'design-system.html'),
      },
    },
  },
});
