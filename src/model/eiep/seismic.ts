import { R_EARTH } from './constants';

/** M = 0.67 log10 E − 5.87  (Collins i in. 2005, eq. 40; sprawność sejsmiczna 1e-4) */
export const seismicMagnitude = (E: number): number => 0.67 * Math.log10(E) - 5.87;

/**
 * Efektywna magnituda w odległości rKm (Collins i in. 2005, eq. 41a–c).
 * 41a/41b: r w kilometrach; 41c: Δ = r/R_E w RADIANACH. Na 700 km wzory mają skok ≈ −0,28 (cecha pracy).
 */
export function effectiveMagnitude(M: number, rKm: number): number {
  if (rKm < 60) return M - 0.0238 * rKm;
  if (rKm < 700) return M - 0.0048 * rKm - 1.1644;
  const deltaRad = (rKm * 1e3) / R_EARTH;
  return M - 1.66 * Math.log10(deltaRad) - 6.399;
}
