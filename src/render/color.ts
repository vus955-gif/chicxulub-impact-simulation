/** Wspólne narzędzia barw dla widoków. */

/** Przybliżona barwa ciała doskonale czarnego dla temperatury [K] (aproksymacja Hellanda, 1000–40 000 K) → [r,g,b] 0…255. */
export function kelvinToRgb(K: number): [number, number, number] {
  const t = Math.min(40000, Math.max(1000, K)) / 100;
  const r = t <= 66 ? 255 : 329.698727446 * (t - 60) ** -0.1332047592;
  const g = t <= 66 ? 99.4708025861 * Math.log(t) - 161.1195681661 : 288.1221695283 * (t - 60) ** -0.0755148492;
  const b = t >= 66 ? 255 : t <= 19 ? 0 : 138.5177312231 * Math.log(t - 10) - 305.0447927307;
  const c = (v: number) => Math.round(Math.min(255, Math.max(0, v)));
  return [c(r), c(g), c(b)];
}

/**
 * Temperatura pióropusza par [K] w chwili t: prawo potęgowe przez dwie kotwice z rejestru —
 * temperatura początkowa (fireball.plume_initial_temperature, t = 0,01 s) i temperatura przezroczystości
 * (fireball.transparency_temperature) w chwili maksimum promieniowania (EIEP). Kształt pomiędzy: symbol/△.
 */
export function plumeTemperatureK(t: number, T0: number, Ttr: number, tMaxRad: number): number {
  if (t <= 0.01) return T0;
  const alpha = Math.log(T0 / Ttr) / Math.log(tMaxRad / 0.01);
  return T0 * (t / 0.01) ** -alpha;
}
