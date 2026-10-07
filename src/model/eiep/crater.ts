import { D_C_EARTH, DEG, G_EARTH } from './constants';
import type { ImpactInput } from './types';

/** Krater przejściowy, cel skalny: D_tc = 1.161 (ρi/ρt)^(1/3) L^0.78 v^0.44 g^-0.22 sin^(1/3)θ  [m]  (eq. 21) */
export function transientCraterDiameter(i: ImpactInput): number {
  const g = i.g ?? G_EARTH;
  return 1.161 * Math.cbrt(i.rhoI / i.rhoT) * i.L ** 0.78 * i.v ** 0.44 * g ** -0.22 * Math.cbrt(Math.sin(i.thetaDeg * DEG));
}

/** d_tc = D_tc / (2√2)  (s. 823, kształt paraboloidy) */
export const transientCraterDepth = (Dtc: number): number => Dtc / (2 * Math.SQRT2);

/** Krater końcowy: prosty 1.25·D_tc (eq. 22); złożony 1.17 D_tc^1.13 / D_c^0.13 (eq. 27)  [m] */
export function finalCraterDiameter(Dtc: number): number {
  const simple = 1.25 * Dtc;
  return simple < D_C_EARTH ? simple : (1.17 * Dtc ** 1.13) / D_C_EARTH ** 0.13;
}

/** Odwrotność eq. 27 dla krateru złożonego: D_tc z D_fr  [m] */
export function transientFromFinalDiameter(Dfr: number): number {
  return ((Dfr * D_C_EARTH ** 0.13) / 1.17) ** (1 / 1.13);
}

/**
 * Średnica impaktora, która przy danych v, θ, ρi, ρt daje krater końcowy Dfr — odwrotność eq. 21 + 27.
 * Pozwala zakotwiczyć scenariusz w zmierzonym kraterze zamiast w szacowanej średnicy impaktora.
 */
export function impactorDiameterForCrater(Dfr: number, i: Omit<ImpactInput, 'L'>): number {
  const g = i.g ?? G_EARTH;
  const Dtc = transientFromFinalDiameter(Dfr);
  const k = 1.161 * Math.cbrt(i.rhoI / i.rhoT) * i.v ** 0.44 * g ** -0.22 * Math.cbrt(Math.sin(i.thetaDeg * DEG));
  return (Dtc / k) ** (1 / 0.78);
}

/** Głębokość krateru złożonego: d = 0.294 D^0.301, D i d w km (errata Collins & Melosh 2013, eq. 9; zastępuje eq. 28) */
export const finalCraterDepth = (Dfr: number): number => 1e3 * 0.294 * (Dfr / 1e3) ** 0.301;

/** Objętość stopu: V = 8.9e-12 E sinθ  [m³]  (eq. 30) */
export const meltVolume = (E: number, thetaDeg: number): number => 8.9e-12 * E * Math.sin(thetaDeg * DEG);
