import { describe, it, expect } from 'vitest';
import { existsSync, readFileSync } from 'node:fs';
import { loadRegistry } from '../src/model/registry/load';
import { RegistryIndex } from '../src/model/sim/registry-client';
import { createSimContext } from '../src/model/sim/context';
import { irPulse } from '../src/model/sim/intensities';
import { surfaceTempRise, surfaceTemperature, groundTemperatureAt } from '../src/model/predictive/ground-temperature';
import { darknessAt, reaccretedFraction } from '../src/model/predictive/darkness';
import { waterDepthM } from '../src/model/predictive/water-depth';

describe('surface temperature: numerical scheme', () => {
  const soil = { k: 0.3, rhoC: 1.3e6, a: 0.9, T0: 290 };
  it('matches the analytic half-space solution when radiation is off (≤ 2 %)', () => {
    const num = surfaceTemperature(1000, 600, 600, { ...soil, radiative: false }).atK - soil.T0;
    const ana = surfaceTempRise(soil.a * 1000, 600, 600, soil.k, soil.rhoC);
    expect(Math.abs(num - ana) / ana).toBeLessThan(0.02);
  });
  it('never exceeds radiative-equilibrium temperature of the absorbed flux', () => {
    const q = 55e3, sigma = 5.670374419e-8;
    const tEq = Math.pow(q / sigma + soil.T0 ** 4, 0.25);
    expect(surfaceTemperature(q, 150, 150, soil).peakK).toBeLessThanOrEqual(tEq);
    expect(surfaceTemperature(10e3, 3600, 3600, soil).peakK).toBeLessThanOrEqual(Math.pow(10e3 / sigma + soil.T0 ** 4, 0.25));
  });
});

describe('surfaceTempRise (analytic half-space)', () => {
  it('grows as √t during the pulse and cools afterwards', () => {
    const a = surfaceTempRise(10e3, 100, 600, 0.3, 1.3e6), b = surfaceTempRise(10e3, 400, 600, 0.3, 1.3e6);
    expect(b / a).toBeCloseTo(2, 9);
    const peak = surfaceTempRise(10e3, 600, 600, 0.3, 1.3e6), later = surfaceTempRise(10e3, 1200, 600, 0.3, 1.3e6);
    expect(later).toBeLessThan(peak);
    expect(surfaceTempRise(10e3, 0, 600, 0.3, 1.3e6)).toBe(0);
  });
});

const ready = existsSync('research/parameters.json') && existsSync('data/derived/ak135-first-arrivals.json');
describe.runIf(ready)('predictive models with registry', () => {
  const reg = ready ? new RegistryIndex(loadRegistry('research')) : (null as never);
  const ctx = ready ? createSimContext(reg, JSON.parse(readFileSync('data/derived/ak135-first-arrivals.json', 'utf8'))) : (null as never);

  it('ground temperature: high bound ≥ low bound, initial temperature before the pulse', () => {
    const p = irPulse(ctx, 4500, 0, 'morgan');
    const g = groundTemperatureAt(ctx, p, p.startS + p.durationS);
    expect(g.peakHighK).toBeGreaterThanOrEqual(g.peakLowK);
    expect(groundTemperatureAt(ctx, p, p.startS - 1).highK).toBe(reg.num('temperature.initial_surface_pred'));
  });
  it('darkness: full light at T=0, monotonic dimming, below photosynthesis threshold by 72 h', () => {
    expect(darknessAt(ctx, 0, 3000, 'regional').lightFraction).toBe(1);
    let prev = 1;
    for (const t of [1800, 7200, 28800, 86400, 259200]) {
      const s = darknessAt(ctx, t, 3000, 'regional').lightFraction;
      expect(s).toBeLessThanOrEqual(prev);
      prev = s;
    }
    expect(darknessAt(ctx, 259200, 3000, 'regional').lightFraction).toBeLessThanOrEqual(0.0101);
    expect(reaccretedFraction(ctx, 7200)).toBeCloseTo(reg.num('atmosphere.ejecta_reaccretion_2h') / 100, 9);
  });
  it('global-fire scenario darkens faster after soot injection starts', () => {
    const t = 30 * 3600;
    expect(darknessAt(ctx, t, 3000, 'global').lightFraction).toBeLessThan(darknessAt(ctx, t, 3000, 'regional').lightFraction);
  });
  it('water-depth ramp: deep to the NNE, shallow to the SW, undefined beyond the ramp', () => {
    expect(waterDepthM(ctx, 150, 22.5)).toBeCloseTo(reg.num('tsunami.depth_150km'), 6);
    expect(waterDepthM(ctx, 100, 202.5)).toBeCloseTo(reg.num('target.water_depth_south'), 6);
    expect(waterDepthM(ctx, 0, 0)).toBeCloseTo(reg.num('tsunami.depth_impact_point'), 6);
    expect(waterDepthM(ctx, 400, 0)).toBeUndefined();
  });
});
