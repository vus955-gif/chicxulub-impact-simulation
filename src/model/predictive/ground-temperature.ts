/**
 * MODEL PREDYKCYJNY PROJEKTU (luka w literaturze: brak symulacji temperatury przy gruncie w pierwszych godzinach).
 * Jednowymiarowe przewodzenie ciepła w gruncie (półprzestrzeń, stałe własności) z bilansem energii na powierzchni:
 *   −k ∂T/∂z|₀ = a·q(t) − ε σ (T⁴ − T₀⁴),  ε = a (Kirchhoff),  q(t) — przebieg impulsu scenariusza
 *   (prostokątny na poziomie szczytu albo — dla Goldina & Melosha — szczyt przez kilka minut i spadek do poziomu słonecznego).
 * Bez parowania wody i spalania; dla danego przebiegu daje górną granicę nagrzania.
 * Rozwiązanie analityczne bez strat radiacyjnych (surfaceTempRise) służy do kontroli schematu numerycznego.
 */
import type { SimContext } from '../sim/context';
import { SIGMA_SB } from '../eiep/constants';
import { irFluxAt, type IrPulse } from '../sim/intensities';


/** Rozwiązanie analityczne (bez promieniowania): ΔT_s = 2q/√(πkρc)·(√t − √(t−τ)·[t>τ]). */
export function surfaceTempRise(qAbsorbedWm2: number, tS: number, tauS: number, k: number, rhoC: number): number {
  if (tS <= 0 || qAbsorbedWm2 <= 0) return 0;
  const A = (2 * qAbsorbedWm2) / Math.sqrt(Math.PI * k * rhoC);
  return A * (Math.sqrt(tS) - (tS > tauS ? Math.sqrt(tS - tauS) : 0));
}

export interface SurfaceHistory { peakK: number; peakAtS: number; atK: number }

/**
 * Temperatura powierzchni [K] pod impulsem q [W/m²] trwającym tauS, wyznaczona w chwili tS od początku impulsu
 * (schemat jawny, krok dobrany do stabilności; siatka 1 mm do głębokości ≥ 6 długości dyfuzji).
 */
export function surfaceTemperature(qWm2: number, tauS: number, tS: number, p: { k: number; rhoC: number; a: number; T0: number; radiative?: boolean }): SurfaceHistory {
  return surfaceTemperatureProfile((t) => (t < tauS ? qWm2 : 0), tS, p);
}

/** Jak surfaceTemperature, ale dla dowolnego przebiegu strumienia q(t) [W/m²] (t od początku impulsu). */
export function surfaceTemperatureProfile(q: (t: number) => number, tS: number, p: { k: number; rhoC: number; a: number; T0: number; radiative?: boolean }): SurfaceHistory {
  if (tS <= 0) return { peakK: p.T0, peakAtS: 0, atK: p.T0 };
  const alpha = p.k / p.rhoC, dz = 1e-3;
  const depth = Math.max(0.05, 6 * Math.sqrt(alpha * tS));
  const n = Math.ceil(depth / dz) + 1;
  const dt = Math.min(1, (0.4 * dz * dz) / alpha);
  const T = new Float64Array(n).fill(p.T0), Tn = new Float64Array(n);
  let peak = p.T0, peakAt = 0, t = 0;
  while (t < tS - 1e-9) {
    const h = Math.min(dt, tS - t);
    const qa = p.a * q(t);
    const loss = p.radiative === false ? 0 : p.a * SIGMA_SB * (T[0]! ** 4 - p.T0 ** 4);
    // komórka powierzchniowa (połówkowa objętość dz/2): strumień netto + przewodzenie do komórki 1
    Tn[0] = T[0]! + (h / (p.rhoC * dz / 2)) * (qa - loss - (p.k * (T[0]! - T[1]!)) / dz);
    for (let i = 1; i < n - 1; i++) Tn[i] = T[i]! + ((alpha * h) / (dz * dz)) * (T[i + 1]! - 2 * T[i]! + T[i - 1]!);
    Tn[n - 1] = p.T0;
    T.set(Tn);
    t += h;
    if (T[0]! > peak) { peak = T[0]!; peakAt = t; }
  }
  return { peakK: peak, peakAtS: peakAt, atK: T[0]! };
}

export interface GroundTemp { lowK: number; highK: number; peakLowK: number; peakHighK: number; T0: number }

/** Temperatura powierzchni gruntu w chwili t (s od T=0) i jej maksimum — dla dolnej i górnej granicy strumienia scenariusza. */
export function groundTemperatureAt(ctx: SimContext, pulse: IrPulse, t: number): GroundTemp {
  const p = {
    k: ctx.reg.num('temperature.soil_conductivity_pred'),
    rhoC: ctx.reg.num('temperature.soil_heat_capacity_pred'),
    a: ctx.reg.num('temperature.surface_absorptivity_pred'),
    T0: ctx.reg.num('temperature.initial_surface_pred'),
  };
  const ts = t - pulse.startS;
  const lo = surfaceTemperatureProfile((tau) => irFluxAt(pulse, pulse.peakLow, tau) * 1e3, ts, p);
  const hi = surfaceTemperatureProfile((tau) => irFluxAt(pulse, pulse.peakHigh, tau) * 1e3, ts, p);
  return { lowK: lo.atK, highK: hi.atK, peakLowK: lo.peakK, peakHighK: hi.peakK, T0: p.T0 };
}
