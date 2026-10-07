import { describe, it, expect } from 'vitest';
import { existsSync, readFileSync } from 'node:fs';
import * as eiep from '../src/model/eiep';

interface OracleCase {
  name: string;
  input: { L_m: number; rhoI: number; v_ms: number; thetaDeg: number; rhoT: number; distance_m: number };
  expected: Partial<Record<
    'energy_J' | 'transientDiameter_m' | 'transientDepth_m' | 'finalDiameter_m' | 'finalDepth_m' |
    'meltVolume_m3' | 'fireballRadius_m' | 'thermalExposure_Jm2' | 'magnitude' | 'effectiveMagnitude' |
    'ejectaThickness_m' | 'ejectaArrival_s' | 'overpressure_Pa' | 'wind_ms', number>>;
}

const ORACLE = 'research/threads/07-eiep-oracle.json';
const oracle = existsSync(ORACLE)
  ? (JSON.parse(readFileSync(ORACLE, 'utf8')) as { oracleKind: string; cases: OracleCase[] })
  : { oracleKind: 'missing', cases: [] as OracleCase[] };

const rel = (a: number, b: number) => Math.abs(a - b) / Math.max(Math.abs(b), 1e-30);
const TOL = 0.03; // 3 % — kalkulator online zaokrągla wyniki do 2–3 cyfr znaczących

it('oracle file exists', () => {
  expect(oracle.oracleKind).not.toBe('missing');
});

describe.each(oracle.cases)(`EIEP vs oracle (${oracle.oracleKind}) — case $name`, (c) => {
  const i: eiep.ImpactInput = { L: c.input.L_m, rhoI: c.input.rhoI, v: c.input.v_ms, thetaDeg: c.input.thetaDeg, rhoT: c.input.rhoT };
  const r = c.input.distance_m;
  const E = eiep.kineticEnergy(i);
  const Dtc = eiep.transientCraterDiameter(i);
  const Dfr = eiep.finalCraterDiameter(Dtc);
  const M = eiep.seismicMagnitude(E);
  const p = eiep.airblastOverpressure(E, r);
  const computed: Record<string, number> = {
    energy_J: E,
    transientDiameter_m: Dtc,
    transientDepth_m: eiep.transientCraterDepth(Dtc),
    finalDiameter_m: Dfr,
    finalDepth_m: eiep.finalCraterDepth(Dfr),
    meltVolume_m3: eiep.meltVolume(E, i.thetaDeg),
    fireballRadius_m: eiep.fireballRadius(E),
    thermalExposure_Jm2: eiep.thermalExposure(E, r, i.v),
    magnitude: M,
    effectiveMagnitude: eiep.effectiveMagnitude(M, r / 1e3),
    ejectaThickness_m: eiep.ejectaThickness(Dtc, r),
    ejectaArrival_s: eiep.ejectaArrivalTime(r),
    overpressure_Pa: p,
    wind_ms: eiep.peakWind(p),
  };
  for (const [key, expected] of Object.entries(c.expected)) {
    it(`${key}`, () => {
      const got = computed[key]!;
      if (key === 'magnitude' || key === 'effectiveMagnitude') expect(Math.abs(got - expected)).toBeLessThan(0.05);
      else expect(rel(got, expected)).toBeLessThan(TOL);
    });
  }
});

describe('EIEP sanity', () => {
  it('energy scales with v²', () => {
    const a = eiep.kineticEnergy({ L: 1000, rhoI: 3000, v: 10000, thetaDeg: 45, rhoT: 2500 });
    const b = eiep.kineticEnergy({ L: 1000, rhoI: 3000, v: 20000, thetaDeg: 45, rhoT: 2500 });
    expect(b / a).toBeCloseTo(4, 10);
  });
  it('ejecta arrival is 0 at zero range (degenerate Kepler case)', () => {
    expect(eiep.ejectaArrivalTime(0)).toBe(0);
  });
  it('ejecta arrival grows with distance', () => {
    expect(eiep.ejectaArrivalTime(2e6)).toBeGreaterThan(eiep.ejectaArrivalTime(1e6));
  });
  it('short-range ballistic flight matches flat-Earth limit (1 km → ~14.3 s)', () => {
    const flat = (2 * Math.sqrt(eiep.G_EARTH * 1000) * Math.SQRT1_2) / eiep.G_EARTH;
    expect(rel(eiep.ejectaArrivalTime(1000), flat)).toBeLessThan(0.01);
  });
  it('impactorDiameterForCrater inverts transient+final crater scaling (round trip)', () => {
    const base = { rhoI: 2630, v: 20000, thetaDeg: 60, rhoT: 2630 };
    const L = eiep.impactorDiameterForCrater(180e3, base);
    const Dfr = eiep.finalCraterDiameter(eiep.transientCraterDiameter({ ...base, L }));
    expect(rel(Dfr, 180e3)).toBeLessThan(1e-9);
  });
  it('no NaN over distance sweep', () => {
    const E = 1e23;
    for (let r = 1e3; r < 1.9e7; r *= 1.5) {
      for (const v of [eiep.airblastOverpressure(E, r), eiep.ejectaArrivalTime(r), eiep.thermalExposure(E, r, 20000)]) {
        expect(Number.isFinite(v)).toBe(true);
      }
    }
  });
});
