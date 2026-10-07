/**
 * MODEL PREDYKCYJNY PROJEKTU (luka: żadna praca nie podaje momentu zapadnięcia ciemności).
 * τ_pył(t, d) = skala · F(t), od chwili dotarcia chmury pyłu (rozpad kurtyny + d / prędkość chmury);
 * F(t) — skumulowany ułamek ejecta wracających do atmosfery (Kring & Durda 2002: 2/8/72 h), interpolacja w log t.
 * Scenariusz „globalne pożary” (sporny): sadza od atmosphere.soot_injection_start do 36 h (założenie modelu Bardeena i in. 2017).
 * Ułamek światła S = exp(−τ).
 */
import type { SimContext } from '../sim/context';
import { ANTIPODE_KM } from '../sim/geo';

export const FIRE_SCENARIOS = ['regional', 'global'] as const;
export type FireScenario = (typeof FIRE_SCENARIOS)[number];

export function dustArrivalS(ctx: SimContext, dKm: number): number {
  return ctx.reg.num('ejecta.t_curtain_breakup') + dKm / ctx.reg.num('ejecta.dust_cloud_speed');
}

/** Skumulowany ułamek ponownego opadu ejecta (0…0,85) w chwili t. */
export function reaccretedFraction(ctx: SimContext, t: number): number {
  const r = ctx.reg;
  const knots: Array<[number, number]> = [
    [r.num('ejecta.t_curtain_breakup'), 0],
    [7200, r.num('atmosphere.ejecta_reaccretion_2h') / 100],
    [28800, r.num('atmosphere.ejecta_reaccretion_8h') / 100],
    [259200, r.num('atmosphere.ejecta_reaccretion_72h') / 100],
  ];
  if (t <= knots[0]![0]) return 0;
  for (let i = 1; i < knots.length; i++) {
    const [t0, f0] = knots[i - 1]!, [t1, f1] = knots[i]!;
    if (t <= t1) return f0 + ((Math.log(t) - Math.log(t0)) / (Math.log(t1) - Math.log(t0))) * (f1 - f0);
  }
  return knots[knots.length - 1]![1];
}

export const LIGHT_PROFILE_N = 129;

/**
 * Ułamek światła w LIGHT_PROFILE_N punktach od krateru do antypodów (d = i/(N−1) · antypody) — tablica, którą widoki
 * odczytują zamiast liczyć model w każdym pikselu.
 */
export function lightProfile(ctx: SimContext, t: number, fires: FireScenario): Float32Array {
  const n = LIGHT_PROFILE_N, out = new Float32Array(n);
  for (let i = 0; i < n; i++) out[i] = darknessAt(ctx, t, (i / (n - 1)) * ANTIPODE_KM, fires).lightFraction;
  return out;
}

export interface Darkness { tauDust: number; tauSoot: number; lightFraction: number }

export function darknessAt(ctx: SimContext, t: number, dKm: number, fires: FireScenario): Darkness {
  const tauDust = t < dustArrivalS(ctx, dKm) ? 0 : ctx.reg.num('atmosphere.dust_tau_scale_pred') * reaccretedFraction(ctx, t);
  let tauSoot = 0;
  if (fires === 'global') {
    const t0 = ctx.reg.seconds('atmosphere.soot_injection_start'), t1 = 36 * 3600;
    tauSoot = ctx.reg.num('atmosphere.soot_optical_depth_initial') * Math.min(1, Math.max(0, (t - t0) / (t1 - t0)));
  }
  return { tauDust, tauSoot, lightFraction: Math.exp(-(tauDust + tauSoot)) };
}
