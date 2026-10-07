import { J_PER_KT } from './constants';

const P0 = 1e5, C0 = 330, PX = 75000, RX = 290;

/**
 * Nadciśnienie [Pa], skalowanie wybuchu powierzchniowego 1 kt: r1 = r / E_kt^(1/3)  (eq. 54, 57).
 * Uwaga (Collins i in. 2005, s. 831): dla E > 10⁴ Mt model prawdopodobnie zawyża nadciśnienie 2–5×.
 */
export function airblastOverpressure(E: number, r: number): number {
  const r1 = r / Math.cbrt(E / J_PER_KT);
  return ((PX * RX) / (4 * r1)) * (1 + 3 * (RX / r1) ** 1.3);
}

/** Maksymalna prędkość wiatru za frontem [m/s]  (eq. 59) */
export const peakWind = (p: number): number => (((5 * p) / (7 * P0)) * C0) / Math.sqrt(1 + (6 * p) / (7 * P0));
