/** Czasy dotarcia zjawisk [s od T=0] w funkcji odległości po powierzchni d [km]. */
import * as eiep from '../eiep';
import { ANTIPODE_KM, CIRCUMFERENCE_KM, R_KM } from './geo';
import type { SimContext } from './context';
import { interpKnots } from './interp';

/** Środki klas odległości Morgan i in. 2013 (2000–2500 / 4000–5000 / 7000–8000 km) — węzły interpolacji. */
export const MORGAN_CLASS_KM = { proximal: 2250, intermediate: 4500, distal: 7500 } as const;

export type ArrivalMethod = 'ak135' | 'orbit' | 'eiep' | 'literature-interp';
export interface Arrival { t: number; method: ArrivalMethod }
export interface OrbitArrival { order: number; t: number }

/** Interpolacja liniowa tablicy pierwszych wejść (krok w stopniach) dla odległości d [km]. */
export function bodyWave(table: Array<number | null>, dKm: number, stepDeg = 1): number {
  const deg = Math.min(180, Math.max(0, (dKm / R_KM) * (180 / Math.PI)));
  const i = Math.min(Math.floor(deg / stepDeg), table.length - 2);
  const a = table[i] ?? 0, b = table[i + 1] ?? a;
  return a + (b - a) * (deg / stepDeg - i);
}

/**
 * Kolejne przejścia fali okrążającej glob (fale powierzchniowe, fala Lamba) przez punkt w odległości d:
 * rząd nieparzysty — łuk krótszy + k·C, parzysty — łuk dłuższy + (k−1)·C. Prędkość w km/s.
 */
export function orbitArrivals(dKm: number, speedKmS: number, tMax: number): OrbitArrival[] {
  const out: OrbitArrival[] = [];
  for (let order = 1; ; order++) {
    const path = order % 2 === 1 ? ((order - 1) / 2) * CIRCUMFERENCE_KM + dKm : (order / 2) * CIRCUMFERENCE_KM - dKm;
    const t = path / speedKmS;
    if (t > tMax) break;
    out.push({ order, t });
  }
  return out;
}

export const lambArrivals = (dKm: number, speedMS: number, tMax: number) => orbitArrivals(dKm, speedMS / 1000, tMax);

/**
 * Pierwsze dotarcie ejecta nad dane miejsce: balistyka EIEP (45°) do 1000 km; dalej interpolacja log–log
 * po wartościach z modeli 3D i trajektorii (Morgan i in. 2013: ~2000–2500 km i 7000–8000 km; Kring & Durda 2002: antypody),
 * które uwzględniają szybki materiał z obłoku par, czego prosta balistyka nie robi.
 */
export function ejectaArrival(ctx: SimContext, dKm: number): Arrival {
  const NEAR = 1000;
  if (dKm <= NEAR) return { t: eiep.ejectaArrivalTime(dKm * 1e3), method: 'eiep' };
  // interpolacja log–log: log t liniowo w log d
  const knots: Array<[number, number]> = [
    [NEAR, Math.log(eiep.ejectaArrivalTime(NEAR * 1e3))],
    [MORGAN_CLASS_KM.proximal, Math.log(ctx.reg.num('ejecta.t_arrival_2000km'))],
    [MORGAN_CLASS_KM.distal, Math.log(ctx.reg.num('ejecta.t_arrival_7500km'))],
    [ANTIPODE_KM, Math.log(ctx.reg.num('ejecta.t_arrival_antipode'))],
  ];
  return { t: Math.exp(interpKnots(Math.min(dKm, ANTIPODE_KM), knots, 'log')), method: 'literature-interp' };
}

/** Fala P i S (pierwsze wejścia ak135). */
export const pArrival = (ctx: SimContext, dKm: number): Arrival => ({ t: bodyWave(ctx.ak135.P, dKm, ctx.ak135.stepDeg), method: 'ak135' });
export const sArrival = (ctx: SimContext, dKm: number): Arrival => ({ t: bodyWave(ctx.ak135.S, dKm, ctx.ak135.stepDeg), method: 'ak135' });
