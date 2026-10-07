import { describe, it, expect } from 'vitest';
import { existsSync, readFileSync } from 'node:fs';
import { loadRegistry } from '../src/model/registry/load';
import { RegistryIndex } from '../src/model/sim/registry-client';
import { createSimContext } from '../src/model/sim/context';
import { bodyWave, surfaceWaveArrivals, lambArrivals, ejectaArrival } from '../src/model/sim/arrivals';
import { ANTIPODE_KM, CIRCUMFERENCE_KM } from '../src/model/sim/geo';
import * as eiep from '../src/model/eiep';

const ready = existsSync('research/parameters.json') && existsSync('data/derived/ak135-first-arrivals.json');

describe('surface and Lamb wave orbits', () => {
  it('R1 and R2 coincide at the antipode', () => {
    const a = surfaceWaveArrivals(ANTIPODE_KM, 3.65, 86400);
    expect(a[0]!.t).toBeCloseTo(a[1]!.t, 6);
  });
  it('15 Rayleigh passages in 24 h at 3000 km for U = 3.65 km/s', () => {
    const a = surfaceWaveArrivals(3000, 3.65, 86400);
    expect(a.length).toBe(15);
    expect(a.map((x) => x.order)).toEqual([...Array(15).keys()].map((k) => k + 1));
  });
  it('orbit period equals circumference / U', () => {
    const a = surfaceWaveArrivals(3000, 3.65, 86400);
    expect(a[2]!.t - a[0]!.t).toBeCloseTo(CIRCUMFERENCE_KM / 3.65, 6);
  });
  it('Lamb wave reaches the antipode after ~17.6 h at 315 m/s', () => {
    expect(lambArrivals(ANTIPODE_KM, 315, 86400)[0]!.t).toBeCloseTo((ANTIPODE_KM * 1000) / 315, 3);
  });
});

describe.runIf(ready)('arrivals from the registry', () => {
  const ctx = ready
    ? createSimContext(new RegistryIndex(loadRegistry('research')), JSON.parse(readFileSync('data/derived/ak135-first-arrivals.json', 'utf8')))
    : (null as never);
  it('P arrival is monotonic in distance up to 100°', () => {
    let prev = -1;
    for (let d = 0; d <= 11000; d += 500) {
      const t = bodyWave(ctx.ak135.P, d);
      expect(t).toBeGreaterThanOrEqual(prev);
      prev = t;
    }
  });
  it('P at 90° matches the ak135 table', () => {
    expect(bodyWave(ctx.ak135.P, (90 * Math.PI * 6371) / 180)).toBeCloseTo(ctx.ak135.P[90]!, 6);
  });
  it('near-field ejecta use EIEP ballistics', () => {
    const e = ejectaArrival(ctx, 800);
    expect(e.method).toBe('eiep');
    expect(e.t).toBeCloseTo(eiep.ejectaArrivalTime(800e3), 6);
  });
  it('far-field ejecta interpolate literature first-arrival times and are monotonic', () => {
    let prev = 0;
    for (let d = 200; d <= ANTIPODE_KM; d += 200) {
      const e = ejectaArrival(ctx, d);
      expect(e.t).toBeGreaterThan(prev);
      prev = e.t;
    }
    expect(ejectaArrival(ctx, ANTIPODE_KM).t).toBeCloseTo(ctx.reg.num('ejecta.t_arrival_antipode'), 6);
    expect(ejectaArrival(ctx, 5000).method).toBe('literature-interp');
  });
});
