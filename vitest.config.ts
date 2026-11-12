import { defineConfig } from 'vitest/config';
import { svelte } from '@sveltejs/vite-plugin-svelte';

export default defineConfig({
  // wtyczka Svelte: testy komponentów renderowanych po stronie serwera (svelte/server) i modułów *.svelte.ts
  plugins: [svelte()],
  test: { include: ['tests/**/*.test.ts'], environment: 'node' },
});
