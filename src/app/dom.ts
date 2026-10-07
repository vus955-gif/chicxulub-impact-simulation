/** Drobne pomocniki przeglądarki wspólne dla widoków. */

/** Kolor z motywu: zmienna CSS ('--c-seismic') rozwiązana na wartość, kolor podany wprost — bez zmian. */
export function cssColor(c: string, fallback = '#ffffff'): string {
  if (!c.startsWith('--')) return c;
  return getComputedStyle(document.documentElement).getPropertyValue(c).trim() || fallback;
}

/** '#rrggbb' → [r, g, b] 0…255 (do mieszania kolorów w pętli pikseli). */
export function hexRgb(hex: string): [number, number, number] {
  const n = parseInt(hex.replace('#', ''), 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}

/** Ustawienie systemu „ogranicz ruch”: wyłącza rozbłysk całego ekranu. */
export const prefersReducedMotion = (): boolean => typeof matchMedia === 'function' && matchMedia('(prefers-reduced-motion: reduce)').matches;
