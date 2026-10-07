/** Fronty zjawisk w chwili t: promień kątowy (po powierzchni) wokół krateru. */
import type { Certainty } from '../registry/types';
import { ANTIPODE_KM, CIRCUMFERENCE_KM } from './geo';
import { ejectaArrival, pArrival, sArrival } from './arrivals';
import type { SimContext } from './context';
import { irPulse, type ThermalScenario } from './intensities';

export type FrontKind = 'P' | 'S' | 'R' | 'G' | 'lamb' | 'ejecta' | 'fireball';
export interface Front { kind: FrontKind; radiusKm: number; order: number; certainty: Certainty; sourceIds: string[] }

/** Położenie fali okrążającej glob po przebyciu drogi s [km]: promień od krateru i numer przejścia. */
export function orbitPosition(sKm: number): { radiusKm: number; order: number } {
  const order = Math.floor(sKm / ANTIPODE_KM) + 1;
  const m = sKm % CIRCUMFERENCE_KM;
  return { radiusKm: m <= ANTIPODE_KM ? m : CIRCUMFERENCE_KM - m, order };
}

/** Odwrotność monotonicznej funkcji czasu dotarcia (bisekcja na [0, πR]); undefined, gdy front minął antypody. */
function invert(arrival: (d: number) => number, t: number): number | undefined {
  if (t <= arrival(0)) return t > 0 ? 0 : undefined;
  if (t > arrival(ANTIPODE_KM)) return undefined;
  let lo = 0, hi = ANTIPODE_KM;
  for (let i = 0; i < 60; i++) {
    const mid = (lo + hi) / 2;
    if (arrival(mid) < t) lo = mid; else hi = mid;
  }
  return (lo + hi) / 2;
}

/**
 * Strefa trwającego impulsu podczerwieni w chwili t: od promienia, za którym impuls już wygasł
 * (ejectaArrival(d) + czas trwania(d) = t, bisekcja), do frontu ejecta. Promienie po powierzchni [km].
 */
export function irZoneAt(ctx: SimContext, t: number, scenario: ThermalScenario): { innerKm: number; outerKm: number } {
  if (t <= 0) return { innerKm: 0, outerKm: 0 };
  const rE = invert((d) => ejectaArrival(ctx, d).t, t);
  const outerKm = rE ?? (t > ejectaArrival(ctx, ANTIPODE_KM).t ? ANTIPODE_KM : 0);
  const f = (d: number) => ejectaArrival(ctx, d).t + irPulse(ctx, d, 0, scenario).durationS;
  let innerKm: number;
  if (t <= f(1)) innerKm = 0;
  else if (t >= f(ANTIPODE_KM)) innerKm = ANTIPODE_KM;
  else {
    let lo = 1, hi = ANTIPODE_KM;
    for (let i = 0; i < 40; i++) { const m = (lo + hi) / 2; if (f(m) < t) lo = m; else hi = m; }
    innerKm = lo;
  }
  return { innerKm, outerKm };
}

export function frontsAt(ctx: SimContext, t: number): Front[] {
  if (t <= 0) return [];
  const { reg } = ctx;
  const src = (id: string) => reg.param(id).sources;
  const out: Front[] = [];
  const ak = ['kennett1995'];

  const rP = invert((d) => pArrival(ctx, d).t, t);
  if (rP !== undefined) out.push({ kind: 'P', radiusKm: rP, order: 1, certainty: 'extrapolation', sourceIds: ak });
  const rS = invert((d) => sArrival(ctx, d).t, t);
  if (rS !== undefined) out.push({ kind: 'S', radiusKm: rS, order: 1, certainty: 'extrapolation', sourceIds: ak });

  const UR = reg.num('seismic.rayleigh_group_velocity'), UL = reg.num('seismic.love_group_velocity');
  out.push({ kind: 'R', ...orbitPosition(UR * t), certainty: 'extrapolation', sourceIds: src('seismic.rayleigh_group_velocity') });
  out.push({ kind: 'G', ...orbitPosition(UL * t), certainty: 'extrapolation', sourceIds: src('seismic.love_group_velocity') });

  const cL = reg.num('airblast.lamb_speed') / 1000;
  out.push({ kind: 'lamb', ...orbitPosition(cL * t), certainty: 'extrapolation', sourceIds: src('airblast.lamb_speed') });

  const rE = invert((d) => ejectaArrival(ctx, d).t, t);
  if (rE !== undefined) out.push({ kind: 'ejecta', radiusKm: rE, order: 1, certainty: 'extrapolation', sourceIds: [...new Set([...src('ejecta.t_arrival_2000km'), ...src('ejecta.t_arrival_antipode')])] });

  const tMax = reg.num('fireball.t_max_radiation_eiep'), dur = reg.num('fireball.radiation_duration_eiep') * 60;
  if (t <= dur) out.push({ kind: 'fireball', radiusKm: reg.num('fireball.radius_eiep') * Math.min(1, t / tMax), order: 1, certainty: 'extrapolation', sourceIds: src('fireball.radius_eiep') });
  return out;
}
