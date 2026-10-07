import { R_EARTH, SIGMA_SB } from './constants';

const ETA = 3e-3; // sprawność świetlna η (s. 826; niepewna o ~2 rzędy wielkości)

/** Promień kuli ognia: R_f = 0.002 E^(1/3)  [m]  (eq. 32) */
export const fireballRadius = (E: number): number => 0.002 * Math.cbrt(E);

/** Czas maksimum promieniowania: T_t = R_f / v  [s]  (eq. 33) */
export const timeOfMaxRadiation = (E: number, v: number): number => fireballRadius(E) / v;

/** Czas trwania promieniowania: τ = η E / (2π R_f² σ T*⁴), T* = 3000 K  [s]  (eq. 35) */
export const radiationDuration = (E: number): number =>
  (ETA * E) / (2 * Math.PI * fireballRadius(E) ** 2 * SIGMA_SB * 3000 ** 4);

/** Ekspozycja cieplna Φ = f η E / (2π r²) [J/m²] (eq. 34, 36, 37); 0, gdy kula ognia pod horyzontem lub v < 15 km/s. */
export function thermalExposure(E: number, r: number, v: number): number {
  if (v < 15000) return 0;
  const Rf = fireballRadius(E);
  const h = (1 - Math.cos(r / R_EARTH)) * R_EARTH;
  if (h >= Rf) return 0;
  const delta = Math.acos(h / Rf);
  const f = (2 / Math.PI) * (delta - (h / Rf) * Math.sin(delta));
  return (f * ETA * E) / (2 * Math.PI * r * r);
}
