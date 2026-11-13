import { defineConfig } from 'vite';
import { svelte } from '@sveltejs/vite-plugin-svelte';

export default defineConfig({
  // GitHub Pages serwuje stronę z podkatalogu repozytorium (BASE_PATH ustawia workflow pages.yml)
  base: process.env.BASE_PATH ?? '/',
  plugins: [svelte()],
  server: { port: 5173, host: '127.0.0.1', strictPort: true },
  // Widoki 3D ładują się leniwie (App.svelte); największy kawałek to three.js ze wspólnym kodem widoków 3D (~570 kB).
  // Limit tuż nad nim — ostrzeże, gdy któryś kawałek urośnie albo three.js wróci do pakietu startowego.
  build: { target: 'es2022', chunkSizeWarningLimit: 600 },
});
