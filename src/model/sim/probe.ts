/** Sonda punktowa: lokalna chronologia zjawisk dla punktu (układ paleo), posortowana według czasu. */
import type { Certainty, Txt } from '../registry/types';
import { pArrival, sArrival, ejectaArrival, lambArrivals } from './arrivals';
import type { SimContext } from './context';
import { angleDiffDeg, azimuthDeg, gcDistanceKm, type LatLon } from './geo';
import { sampleGrid, type EquirectGrid } from './grid';
import { airblastAt, ejectaThicknessAt, fireballExposureAt, ignitionLevel, irPulse, seismicMeffAt, type IgnitionLevel, type ThermalScenario } from './intensities';
import { groundTemperatureAt } from '../predictive/ground-temperature';
import { darknessAt, dustArrivalS, type FireScenario } from '../predictive/darkness';
import { waterDepthM } from '../predictive/water-depth';
import { formatNumber } from '../registry/format';

export interface ProbeValue { label: Txt; value: number | string | Txt; unit: string }
export interface ProbeEvent {
  kind: 'P' | 'S' | 'R' | 'ejecta' | 'fireball' | 'ir' | 'lamb' | 'tsunami' | 'dust';
  label: Txt; t: number; tEnd?: number; values: ProbeValue[];
  certainty: Certainty; sourceIds: string[]; method: Txt | string; note?: Txt;
}

const IGNITION: Record<IgnitionLevel, Txt> = { brak: { pl: 'brak', en: 'none' }, 'ściółka': { pl: 'ściółka', en: 'litter' }, drewno: { pl: 'drewno', en: 'wood' } };
const SCENARIO: Record<ThermalScenario, string> = { morgan: 'Morgan 2013', goldin: 'Goldin & Melosh 2009', melosh: 'Melosh 1990' };
export interface ProbeGrids { elev?: EquirectGrid; tsunamiTT?: EquirectGrid; tsunamiAmp?: EquirectGrid }
export interface Scenario { thermal: ThermalScenario; fires: FireScenario }
export interface ProbeReport {
  point: LatLon; distanceKm: number; azimuthDeg: number; azRelDownrangeDeg: number;
  elevationM?: number; mapIsOcean?: boolean; waterDepthM?: number; waterDepthPredictive: boolean;
  events: ProbeEvent[];
}

export function probe(ctx: SimContext, grids: ProbeGrids, point: LatLon, scenario: Scenario, tMax = 86400): ProbeReport {
  const { reg } = ctx;
  const d = gcDistanceKm(ctx.crater, point);
  const az = azimuthDeg(ctx.crater, point);
  const azRel = angleDiffDeg(az, ctx.downrangeAzDeg);
  const src = (id: string) => reg.param(id).sources;
  const ev: ProbeEvent[] = [];

  ev.push({ kind: 'P', label: { pl: 'Fala P', en: 'P wave' }, t: pArrival(ctx, d).t, values: [{ label: { pl: 'efektywna magnituda wstrząsów', en: 'effective shaking magnitude' }, value: seismicMeffAt(ctx, d).value, unit: '' }],
    certainty: 'extrapolation', sourceIds: ['kennett1995', ...src('seismic.magnitude_eiep')], method: 'ak135 + EIEP eq. 41' });
  ev.push({ kind: 'S', label: { pl: 'Fala S', en: 'S wave' }, t: sArrival(ctx, d).t, values: [], certainty: 'extrapolation', sourceIds: ['kennett1995'], method: 'ak135' });
  const UR = reg.num('seismic.rayleigh_group_velocity');
  ev.push({ kind: 'R', label: { pl: 'Fale powierzchniowe Rayleigha (R1)', en: 'Rayleigh surface waves (R1)' }, t: d / UR, values: [], certainty: 'extrapolation', sourceIds: src('seismic.rayleigh_group_velocity'),
    method: { pl: 'droga / prędkość grupowa (PREM)', en: 'distance / group velocity (PREM)' },
    note: { pl: 'Najsilniejsze, powolne falowanie gruntu; kolejne przejścia co okrążenie Ziemi.', en: 'The strongest, slow rolling of the ground; further passes with each circuit of the Earth.' } });

  const fb = fireballExposureAt(ctx, d);
  if (fb.value > 0) ev.push({ kind: 'fireball', label: { pl: 'Promieniowanie kuli ognia', en: 'Fireball radiation' }, t: reg.num('fireball.t_max_radiation_eiep'), tEnd: reg.seconds('fireball.radiation_duration_eiep'),
    values: [{ label: { pl: 'ekspozycja cieplna', en: 'thermal exposure' }, value: fb.value, unit: 'MJ/m²' }], certainty: 'extrapolation', sourceIds: fb.sourceIds, method: fb.method,
    note: { pl: 'Ekstrapolacja daleko poza kalibrację z prób jądrowych.', en: 'Extrapolated far beyond the calibration from nuclear tests.' } });

  const ej = ejectaArrival(ctx, d), th = ejectaThicknessAt(ctx, d);
  ev.push({ kind: 'ejecta', label: { pl: 'Pierwsze ejecta nad miejscem', en: 'First ejecta overhead' }, t: ej.t, values: [{ label: { pl: 'końcowa grubość warstwy', en: 'final layer thickness' }, value: th.value, unit: 'm' }],
    certainty: 'extrapolation', sourceIds: [...new Set([...th.sourceIds, ...src('ejecta.t_arrival_antipode')])], method: `${ej.method}; ${th.method}` });

  const ir = irPulse(ctx, d, azRel, scenario.thermal);
  if (ir.durationS > 0) {
    const gt = groundTemperatureAt(ctx, ir, ir.startS + ir.durationS + 1);
    ev.push({ kind: 'ir', label: { pl: `Impuls podczerwieni od ejecta (scenariusz: ${SCENARIO[scenario.thermal]})`, en: `Infrared pulse from ejecta (scenario: ${SCENARIO[scenario.thermal]})` }, t: ir.startS, tEnd: ir.startS + ir.durationS,
      values: [
        { label: { pl: 'szczytowy strumień', en: 'peak flux' }, value: `${ir.peakLow.toFixed(0)}–${ir.peakHigh.toFixed(0)}`, unit: 'kW/m²' },
        { label: { pl: 'możliwy zapłon', en: 'possible ignition' }, value: IGNITION[ignitionLevel(ctx, ir)], unit: '' },
        { label: { pl: 'szczyt temperatury powierzchni gruntu △', en: 'peak ground-surface temperature △' }, value: `${(gt.peakLowK - 273.15).toFixed(0)}–${(gt.peakHighK - 273.15).toFixed(0)}`, unit: '°C' },
      ],
      certainty: ir.certainty, sourceIds: ir.sourceIds, method: { pl: `scenariusz ${SCENARIO[scenario.thermal]}; temperatura gruntu: model predykcyjny projektu`, en: `scenario ${SCENARIO[scenario.thermal]}; ground temperature: project predictive model` } });
  }

  const ab = airblastAt(ctx, d);
  const cL = reg.num('airblast.lamb_speed');
  const lamb = lambArrivals(d, cL, tMax);
  if (lamb.length) ev.push({ kind: 'lamb', label: { pl: 'Fala ciśnienia (front fali Lamba)', en: 'Pressure wave (Lamb-wave front)' }, t: lamb[0]!.t,
    values: ab.insideFireball ? [] : [
      { label: { pl: 'nadciśnienie (EIEP, górna granica)', en: 'overpressure (EIEP, upper bound)' }, value: `${formatNumber(ab.overpressureLowPa / 1000, 3)}–${formatNumber(ab.overpressurePa / 1000, 3)}`, unit: 'kPa' },
      { label: { pl: 'wiatr za frontem (górna granica)', en: 'wind behind the front (upper bound)' }, value: ab.windMS, unit: 'm/s' },
      { label: { pl: 'poziom ciśnienia akustycznego', en: 'sound pressure level' }, value: ab.splDb, unit: 'dB' },
    ],
    certainty: 'extrapolation', sourceIds: [...new Set([...ab.sourceIds, ...src('airblast.lamb_speed')])], method: { pl: 'EIEP eq. 54–59 + prędkość fali Lamba (Hunga Tonga 2022)', en: 'EIEP eq. 54–59 + Lamb-wave speed (Hunga Tonga 2022)' },
    note: ab.insideFireball ? { pl: 'Wewnątrz kuli ognia i kurtyny ejecta — „fala powietrzna” nie ma tu osobnego sensu.', en: 'Inside the fireball and ejecta curtain — a separate “air wave” is meaningless here.' }
      : ab.isShock ? { pl: 'Powyżej ~194 dB: fala uderzeniowa, nie dźwięk.', en: 'Above ~194 dB: a shock wave, not sound.' } : undefined });

  const tDust = dustArrivalS(ctx, d);
  const dark24 = darknessAt(ctx, tMax, d, scenario.fires);
  ev.push({ kind: 'dust', label: { pl: 'Chmura pyłu — początek zaciemnienia △', en: 'Dust cloud — onset of darkness △' }, t: tDust,
    values: [{ label: { pl: `światło po ${(tMax / 3600).toFixed(0)} h (ułamek normalnego)`, en: `light after ${(tMax / 3600).toFixed(0)} h (fraction of normal)` }, value: dark24.lightFraction, unit: '' }],
    certainty: 'predictive', sourceIds: src('atmosphere.dust_tau_scale_pred'), method: 'predictive:darkness' });

  let elevationM: number | undefined, mapIsOcean: boolean | undefined;
  if (grids.elev) { elevationM = sampleGrid(grids.elev, point.lat, point.lon); mapIsOcean = elevationM < -10; }
  const ramp = waterDepthM(ctx, d, az);
  if (grids.tsunamiTT) {
    const tt = sampleGrid(grids.tsunamiTT, point.lat, point.lon);
    if (Number.isFinite(tt) && tt <= tMax) {
      const amp = grids.tsunamiAmp ? sampleGrid(grids.tsunamiAmp, point.lat, point.lon) : NaN;
      ev.push({ kind: 'tsunami', label: mapIsOcean ? { pl: 'Tsunami', en: 'Tsunami' } : { pl: 'Tsunami (najbliższa komórka oceaniczna)', en: 'Tsunami (nearest ocean cell)' }, t: tt,
        values: Number.isFinite(amp) ? [{ label: { pl: 'maks. amplituda na otwartej wodzie (górna granica)', en: 'max. open-water amplitude (upper bound)' }, value: amp, unit: 'm' }] : [],
        certainty: 'extrapolation', sourceIds: src('tsunami.front_radius_1h'), method: { pl: 'czas: √(g·h) na paleobatymetrii PaleoDEM; amplituda: model MOST (Range i in. 2022)', en: 'time: √(g·h) on PaleoDEM palaeobathymetry; amplitude: MOST model (Range et al. 2022)' } });
    }
  }
  ev.sort((a, b) => a.t - b.t);
  return { point, distanceKm: d, azimuthDeg: az, azRelDownrangeDeg: azRel, elevationM, mapIsOcean,
    waterDepthM: ramp, waterDepthPredictive: ramp !== undefined, events: ev.filter((e) => e.t <= tMax) };
}
