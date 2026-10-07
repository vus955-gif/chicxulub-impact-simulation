import { defineConfig } from 'vite';
import { svelte } from '@sveltejs/vite-plugin-svelte';

export default defineConfig({
  plugins: [svelte()],
  server: { port: 5173, host: '127.0.0.1', strictPort: true },
  build: { target: 'es2022', chunkSizeWarningLimit: 1500 },
});
