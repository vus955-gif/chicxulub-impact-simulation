/** Natężenia zjawisk w funkcji odległości d [km] (i azymutu względem kierunku lotu impaktora). */
import * as eiep from '../eiep';
import type { Certainty } from '../registry/types';
import { ejectaArrival } from './arrivals';
import type { SimContext } from './context';

export interface Valued { value: number; unit: string; certainty: Certainty; sourceIds: string[]; method: string }

export function seismicMeffAt(ctx: SimContext, dKm: number): Valued {
  const M = eiep.seismicMagnitude(ctx.energyJ);
  return { value: eiep.effectiveMagnitude(M, dKm), unit: '', certainty: 'contested', sourceIds: ctx.reg.param('seismic.magnitude_eiep').sources, method: 'eiep:eq40-41 (sprawność 1e-4)' };
}

export interface Airblast { overpressurePa: number; overpressureLowPa: number; windMS: number; splDb: number; isShock: boolean; insideFireball: boolean; certainty: Certainty; sourceIds: string[] }

/** Fala uderzeniowa wg EIEP; pasmo dolne = EIEP / maks. czynnik zawyżenia (airblast.overestimate_factor_large). */
export function airblastAt(ctx: SimContext, dKm: number): Airblast {
  const p = eiep.airblastOverpressure(ctx.energyJ, dKm * 1e3);
  const over = ctx.reg.param('airblast.overestimate_factor_large').range?.[1] ?? ctx.reg.num('airblast.overestimate_factor_large');
  const spl = 20 * Math.log10(p / 20e-6);
  return {
    overpressurePa: p, overpressureLowPa: p / over, windMS: eiep.peakWind(p), splDb: spl, isShock: spl > 194,
    insideFireball: dKm < ctx.reg.num('fireball.radius_eiep'),
    certainty: 'extrapolation', sourceIds: ctx.reg.param('airblast.scaling_validity_limit').sources,
  };
}

export function fireballExposureAt(ctx: SimContext, dKm: number): Valued {
  return { value: eiep.thermalExposure(ctx.energyJ, dKm * 1e3, ctx.impact.v) / 1e6, unit: 'MJ/m²', certainty: 'extrapolation', sourceIds: ctx.reg.param('fireball.radius_eiep').sources, method: 'eiep:eq34-37' };
}

/** Grubość ejecta: EIEP (D_tc z obserwacji); dalej niż 4000 km nie mniej niż zmierzona warstwa globalna. */
export function ejectaThicknessAt(ctx: SimContext, dKm: number): Valued {
  const eiepM = eiep.ejectaThickness(ctx.transientDiameterM, dKm * 1e3);
  const floorM = ctx.reg.num('ejecta.distal_layer_thickness') / 1000;
  if (dKm >= 4000 && floorM > eiepM) {
    return { value: floorM, unit: 'm', certainty: 'fact', sourceIds: ctx.reg.param('ejecta.distal_layer_thickness').sources, method: 'measured: warstwa dystalna' };
  }
  return { value: eiepM, unit: 'm', certainty: 'extrapolation', sourceIds: ctx.reg.param('ejecta.thickness_eiep_1000km').sources, method: 'eiep:eq47' };
}

export type ThermalScenario = 'morgan' | 'goldin' | 'melosh';
export interface IrPulse {
  peakLow: number; peakHigh: number; durationS: number; startS: number; scenario: ThermalScenario; certainty: Certainty; sourceIds: string[];
  /** kształt impulsu: szczyt przez strongS, potem wykładniczy spadek do floorKW w chwili durationS (brak = impuls prostokątny) */
  shape?: { strongS: number; floorKW: number };
}

/** Strumień impulsu [kW/m²] w chwili tau od jego początku, dla podanej wartości szczytowej. */
export function irFluxAt(p: IrPulse, peak: number, tau: number): number {
  if (tau < 0 || tau > p.durationS) return 0;
  if (!p.shape || tau <= p.shape.strongS) return peak;
  const f = (tau - p.shape.strongS) / Math.max(1e-6, p.durationS - p.shape.strongS);
  return peak * (Math.min(p.shape.floorKW, peak) / peak) ** f;
}

const interpLogD = (d: number, knots: Array<[number, number]>) => {
  if (d <= knots[0]![0]) return knots[0]![1];
  for (let i = 1; i < knots.length; i++) {
    const [d0, v0] = knots[i - 1]!, [d1, v1] = knots[i]!;
    if (d <= d1) return v0 + ((Math.log(d) - Math.log(d0)) / (Math.log(d1) - Math.log(d0))) * (v1 - v0);
  }
  return knots[knots.length - 1]![1];
};

/** Impuls podczerwieni od ejecta wracających do atmosfery — trzy scenariusze z literatury (spór). */
export function irPulse(ctx: SimContext, dKm: number, azRelDeg: number, scenario: ThermalScenario): IrPulse {
  const r = ctx.reg;
  const startS = ejectaArrival(ctx, dKm).t;
  if (scenario === 'melosh') {
    const v = r.num('thermal.ir_flux_global_melosh');
    return { peakLow: v, peakHigh: v, durationS: r.num('thermal.ir_duration_melosh'), startS, scenario, certainty: 'contested', sourceIds: r.param('thermal.ir_flux_global_melosh').sources };
  }
  if (scenario === 'goldin') {
    const [lo, hi] = r.param('thermal.ir_flux_peak_goldin').range!;
    // „> 5 kW/m² przez kilka minut, powyżej słonecznego ~30 min” — kształt: model predykcyjny projektu (△)
    return { peakLow: lo, peakHigh: hi, durationS: r.num('thermal.ir_duration') * 60, startS, scenario, certainty: 'contested', sourceIds: r.param('thermal.ir_flux_peak_goldin').sources,
      shape: { strongS: r.num('thermal.ir_goldin_strong_phase_pred') * 60, floorKW: r.num('thermal.solar_constant') } };
  }
  // Morgan i in. 2013: klasy odległości 2000–2500 / 4000–5000 / 7000–8000 km × sektory azymutu 0–30 / 30–60 / 60–90°; ≥ 120° pomijalne.
  const D = [2250, 4500, 7500];
  const val = (cls: string, az: number) => {
    const id = az <= 30 ? `thermal.ir_flux_peak_${cls}_downrange` : az <= 60 ? `thermal.ir_flux_peak_${cls}_az45` : `thermal.ir_flux_peak_${cls}_az75`;
    return r.num(id);
  };
  const a = Math.abs(azRelDeg);
  const upr = r.num('thermal.ir_flux_uprange_far');
  const atAz = (cls: string) => (a <= 90 ? val(cls, a) : a >= 120 ? upr : val(cls, 75) + ((a - 90) / 30) * (upr - val(cls, 75)));
  const peak = interpLogD(dKm, [[D[0]!, atAz('proximal')], [D[1]!, atAz('intermediate')], [D[2]!, atAz('distal')]]);
  const dur = interpLogD(dKm, [[D[0]!, r.num('thermal.ir_pulse_duration_proximal')], [D[1]!, r.num('thermal.ir_pulse_duration_intermediate')], [D[2]!, r.num('thermal.ir_pulse_duration_distal')]]);
  const uprange = a >= 120;
  return {
    peakLow: uprange ? r.param('thermal.ir_flux_uprange_far').range![0] : peak * 0.9,
    peakHigh: uprange ? r.param('thermal.ir_flux_uprange_far').range![1] : peak * 1.1, // ±10 % — dokładność odczytu z rysunku
    durationS: uprange ? 0 : dur, startS, scenario, certainty: 'extrapolation', sourceIds: r.param('thermal.ir_flux_peak_proximal_downrange').sources,
  };
}

export type IgnitionLevel = 'brak' | 'ściółka' | 'drewno';
/** Zapłon wg progów z rejestru: samozapłon drewna (≥ 2 min), ściółka i liście (≥ 1 min). Górna granica strumienia = „możliwy”. */
export function ignitionLevel(ctx: SimContext, p: { peakLow: number; peakHigh: number; durationS: number; shape?: { strongS: number } }): IgnitionLevel {
  const atPeak = p.shape ? Math.min(p.shape.strongS, p.durationS) : p.durationS; // jak długo strumień utrzymuje się na szczycie
  if (p.peakHigh >= ctx.reg.num('thermal.ignition_wood_spontaneous') && atPeak >= 120) return 'drewno';
  if (p.peakHigh >= ctx.reg.num('thermal.ignition_litter') && atPeak >= 60) return 'ściółka';
  return 'brak';
}
