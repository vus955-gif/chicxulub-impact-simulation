/**
 * Strefy skutków dla biosfery w 1. dobie: progi EIEP (wiatr dla drzew, ekspozycja cieplna kuli ognia) nałożone na pola
 * zjawisk z modelu, plus zasięgi z obserwacji/analogii (osuwiska podmorskie, upłynnienie gruntu).
 * Każda strefa rośnie razem z frontem zjawiska, które ją wywołuje (fala ciśnienia, fale powierzchniowe, promieniowanie).
 */
import * as eiep from '../eiep';
import type { Certainty, Txt } from '../registry/types';
import type { SimContext } from './context';
import { airblastAt, fireballExposureAt } from './intensities';

export type BioZoneKey = 'sterile' | 'thermal' | 'trees90' | 'trees30' | 'liquefaction' | 'slopes';

export interface BioZone {
  key: BioZoneKey;
  label: Txt;
  /** zasięg pełny (górna granica, gdy model daje pasmo) [km] */
  radiusKm: number;
  /** dolna granica zasięgu, jeśli model daje pasmo [km] */
  radiusLowKm?: number;
  /** przyczyna — prędkość frontu lub chwila wystąpienia */
  cause: 'fireball' | 'radiation' | 'airblast' | 'surface-waves';
  certainty: Certainty;
  sourceIds: string[];
  paramIds: string[];
  method: Txt;
  note?: Txt;
}

const MJ_PER_MT_SCALE = (ctx: SimContext) => (ctx.energyJ / 4.184e15) ** (1 / 6); // eq. 39: próg × E_Mt^(1/6)

/** Największa odległość, w której f(d) ≥ thr (f malejąca z odległością); bisekcja na [1, dMax]. */
function reach(f: (d: number) => number, thr: number, dMax = 20000): number {
  if (f(1) < thr) return 0;
  if (f(dMax) >= thr) return dMax;
  let lo = 1, hi = dMax;
  for (let i = 0; i < 60; i++) { const m = (lo + hi) / 2; if (f(m) >= thr) lo = m; else hi = m; }
  return lo;
}

export function bioZones(ctx: SimContext): BioZone[] {
  const r = ctx.reg, src = (id: string) => r.param(id).sources;
  const over = r.param('airblast.overestimate_factor_large').range?.[1] ?? r.num('airblast.overestimate_factor_large');
  const windHigh = (d: number) => airblastAt(ctx, d).windMS;
  const windLow = (d: number) => eiep.peakWind(airblastAt(ctx, d).overpressurePa / over);
  const exposure = (d: number) => fireballExposureAt(ctx, d).value;
  const s = MJ_PER_MT_SCALE(ctx);
  const burn = reach(exposure, r.num('biosphere.burn3_exposure_1mt') * s);
  const grass = reach(exposure, r.num('biosphere.grass_ignition_exposure_1mt') * s);
  const w90 = r.num('biosphere.tree_blowdown_total_wind'), w30 = r.num('biosphere.tree_blowdown_partial_wind');
  return [
    { key: 'sterile', label: { pl: 'całkowite zniszczenie (wnętrze kuli ognia)', en: 'total destruction (inside the fireball)' }, radiusKm: r.num('fireball.radius_eiep'), cause: 'fireball',
      certainty: 'extrapolation', sourceIds: src('fireball.radius_eiep'), paramIds: ['fireball.radius_eiep'], method: { pl: 'eiep: promień kuli ognia w maksimum promieniowania', en: 'eiep: fireball radius at maximum radiation' } },
    { key: 'thermal', label: { pl: 'zapłon roślinności i oparzenia III st. u odsłoniętych zwierząt (kula ognia)', en: 'vegetation ignition and third-degree burns of exposed animals (fireball)' }, radiusKm: Math.min(burn, grass), cause: 'radiation',
      certainty: 'extrapolation', sourceIds: [...new Set([...src('biosphere.burn3_exposure_1mt'), ...src('fireball.radius_eiep')])],
      paramIds: ['biosphere.burn3_exposure_1mt', 'biosphere.grass_ignition_exposure_1mt', 'fires.ignition_radius_fireball'],
      method: { pl: 'eiep: ekspozycja kuli ognia (eq. 34–37) ≥ progi z tab. 1 × E^(1/6)', en: 'eiep: fireball exposure (eq. 34–37) ≥ Table 1 thresholds × E^(1/6)' },
      note: { pl: `Kontrola krzyżowa: zasięg zapłonu z literatury (fires.ignition_radius_fireball) ${r.num('fires.ignition_radius_fireball')} km — inna metoda, zgodność w granicach ~10%.`, en: `Cross-check: ignition range from the literature (fires.ignition_radius_fireball) ${r.num('fires.ignition_radius_fireball')} km — a different method, agreement within ~10%.` } },
    { key: 'trees90', label: { pl: 'do 90% drzew powalonych', en: 'up to 90% of trees blown down' }, radiusKm: reach(windHigh, w90), radiusLowKm: reach(windLow, w90), cause: 'airblast',
      certainty: 'extrapolation', sourceIds: [...new Set([...src('biosphere.tree_blowdown_total_wind'), ...src('airblast.overestimate_factor_large')])],
      paramIds: ['biosphere.tree_blowdown_total_wind', 'airblast.overestimate_factor_large'], method: { pl: 'eiep: wiatr za frontem fali (eq. 59) ≥ próg; pasmo: nadciśnienie EIEP / czynnik zawyżenia', en: 'eiep: wind behind the wave front (eq. 59) ≥ threshold; band: EIEP overpressure / overestimate factor' },
      note: { pl: 'Pasmo między dolną a górną granicą zasięgu; EIEP zawyża ciśnienie dla tak dużych energii.', en: 'Band between the lower and upper bound of the range; EIEP overestimates pressure at such large energies.' } },
    { key: 'trees30', label: { pl: 'ok. 30% drzew powalonych', en: 'about 30% of trees blown down' }, radiusKm: reach(windHigh, w30), radiusLowKm: reach(windLow, w30), cause: 'airblast',
      certainty: 'extrapolation', sourceIds: [...new Set([...src('biosphere.tree_blowdown_partial_wind'), ...src('airblast.overestimate_factor_large')])],
      paramIds: ['biosphere.tree_blowdown_partial_wind', 'airblast.overestimate_factor_large'], method: { pl: 'eiep: wiatr za frontem fali (eq. 59) ≥ próg; pasmo jak wyżej', en: 'eiep: wind behind the wave front (eq. 59) ≥ threshold; band as above' } },
    { key: 'liquefaction', label: { pl: 'upłynnienie gruntu (analogia z największych trzęsień)', en: 'soil liquefaction (analogue of the largest earthquakes)' }, radiusKm: r.num('seismic.liquefaction_max_distance_tectonic'), cause: 'surface-waves',
      certainty: 'extrapolation', sourceIds: src('seismic.liquefaction_max_distance_tectonic'), paramIds: ['seismic.liquefaction_max_distance_tectonic'],
      method: { pl: 'analogia: maks. zasięg upłynnienia dla największych trzęsień tektonicznych', en: 'analogue: max. liquefaction range of the largest tectonic earthquakes' }, note: { pl: 'Dolna granica — uderzenie było silniejsze niż analog.', en: 'Lower bound — the impact was stronger than the analogue.' } },
    { key: 'slopes', label: { pl: 'osuwiska podmorskie na stokach (zaobserwowane)', en: 'submarine slope failures (observed)' }, radiusKm: r.num('seismic.margin_failure_distance_blake_nose'), cause: 'surface-waves',
      certainty: 'fact', sourceIds: src('seismic.margin_failure_distance_blake_nose'), paramIds: ['seismic.margin_failure_distance_blake_nose'],
      method: { pl: 'obserwacja: osad K-Pg z osuwisk na Blake Nose', en: 'observation: K-Pg slump deposit at Blake Nose' }, note: { pl: 'Zasięg co najmniej do tej odległości (najdalsze zaobserwowane stanowisko).', en: 'Reaches at least this far (the most distant observed site).' } },
  ];
}

/** Chwila, w której skutek strefy dociera na odległość d (lub undefined, gdy d poza strefą). */
export function bioArrivalS(ctx: SimContext, z: BioZone, dKm: number): number | undefined {
  if (dKm > z.radiusKm) return undefined;
  const r = ctx.reg;
  switch (z.cause) {
    case 'fireball': return r.num('fireball.t_max_radiation_eiep') * Math.min(1, dKm / z.radiusKm);
    case 'radiation': return r.num('fireball.t_max_radiation_eiep');
    case 'airblast': return (dKm * 1000) / r.num('airblast.lamb_speed');
    case 'surface-waves': return dKm / r.num('seismic.rayleigh_group_velocity');
  }
}

/** Bieżący zasięg strefy w chwili t (strefa rośnie z frontem przyczyny). */
export function bioReachAt(ctx: SimContext, z: BioZone, t: number): { outerKm: number; lowKm?: number } {
  if (t <= 0) return { outerKm: 0 };
  const r = ctx.reg;
  let front: number;
  switch (z.cause) {
    case 'fireball': front = z.radiusKm * Math.min(1, t / r.num('fireball.t_max_radiation_eiep')); break;
    case 'radiation': front = t >= r.num('fireball.t_max_radiation_eiep') ? z.radiusKm : 0; break;
    case 'airblast': front = (r.num('airblast.lamb_speed') / 1000) * t; break;
    case 'surface-waves': front = r.num('seismic.rayleigh_group_velocity') * t; break;
  }
  return { outerKm: Math.min(z.radiusKm, front), lowKm: z.radiusLowKm !== undefined ? Math.min(z.radiusLowKm, front) : undefined };
}
