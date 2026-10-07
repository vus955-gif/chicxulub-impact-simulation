import { G_EARTH, R_EARTH } from './constants';

/** Grubość ejecta: t = D_tc^4 / (112 r^3)  [m]  (eq. 47) */
export const ejectaThickness = (Dtc: number, r: number): number => Dtc ** 4 / (112 * r ** 3);

/**
 * Czas lotu balistycznego (kąt wyrzutu 45°, kula nierotująca, μ = g R²) dla zasięgu r po powierzchni.
 * ν = v²/(gR) z równania zasięgu: tan(Δ/2) = ν sinφ cosφ / (1 − ν cos²φ); dla φ = 45°: ν = 2t/(1+t).
 * Czas z równania Keplera dla symetrycznego łuku — fizycznie równoważne eq. 49–52 (zgodność z wyrocznią).
 * EIEP stosuje to tylko dla v_e²/(g R_E) ≤ 1 (r ≲ 10 000 km); dalej liczyć z modeli dystalnych ejecta.
 */
export function ejectaArrivalTime(r: number): number {
  if (r < 1) return 0; // przypadek zdegenerowany (e → 1, θ → π): granica czasu lotu dla r → 0 wynosi 0
  const Delta = Math.min(r / R_EARTH, Math.PI - 1e-6);
  const t = Math.tan(Delta / 2);
  const nu = (2 * t) / (1 + t);
  const mu = G_EARTH * R_EARTH ** 2;
  const a = R_EARTH / (2 - nu);
  const cos2phi = 0.5;
  const e = Math.sqrt(1 - nu * (2 - nu) * cos2phi);
  const thetaL = Math.PI - Delta / 2; // anomalia prawdziwa punktu wyrzutu (apocentrum w π)
  const EL = 2 * Math.atan(Math.sqrt((1 - e) / (1 + e)) * Math.tan(thetaL / 2));
  const half = Math.sqrt(a ** 3 / mu) * (Math.PI - (EL - e * Math.sin(EL)));
  return 2 * half;
}
