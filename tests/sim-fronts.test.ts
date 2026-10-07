import { describe, it, expect } from 'vitest';
import { existsSync, readFileSync } from 'node:fs';
import { loadRegistry } from '../src/model/registry/load';
import { RegistryIndex } from '../src/model/sim/registry-client';
import { createSimContext } from '../src/model/sim/context';
import { frontsAt, orbitPosition } from '../src/model/sim/fronts';
import { pArrival, ejectaArrival } from '../src/model/sim/arrivals';
import { ANTIPODE_KM, CIRCUMFERENCE_KM } from '../src/model/sim/geo';

describe('orbitPosition', () => {
  it('outbound before the antipode, returning after', () => {
    expect(orbitPosition(1000)).toEqual({ radiusKm: 1000, order: 1 });
    const back = orbitPosition(ANTIPODE_KM + 1000);
    expect(back.order).toBe(2);
    expect(back.radiusKm).toBeCloseTo(ANTIPODE_KM - 1000, 6);
    expect(orbitPosition(CIRCUMFERENCE_KM + 500).order).toBe(3);
  });
});

const ready = existsSync('research/parameters.json') && existsSync('data/derived/ak135-first-arrivals.json');
describe.runIf(ready)('frontsAt', () => {
  const ctx = ready
    ? createSimContext(new RegistryIndex(loadRegistry('research')), JSON.parse(readFileSync('data/derived/ak135-first-arrivals.json', 'utf8')))
    : (null as never);
  const get = (t: number, kind: string) => frontsAt(ctx, t).find((f) => f.kind === kind);
  it('no fronts at or before T=0', () => {
    expect(frontsAt(ctx, 0)).toEqual([]);
    expect(frontsAt(ctx, -3)).toEqual([]);
  });
  it('P front radius inverts the P arrival time', () => {
    expect(get(pArrival(ctx, 3000).t, 'P')!.radiusKm).toBeCloseTo(3000, 0);
  });
  it('ejecta front inverts the ejecta arrival time', () => {
    expect(get(ejectaArrival(ctx, 5000).t, 'ejecta')!.radiusKm).toBeCloseTo(5000, 0);
  });
  it('Lamb front reaches the antipode at d/c', () => {
    const c = ctx.reg.num('airblast.lamb_speed');
    expect(get((ANTIPODE_KM * 1000) / c, 'lamb')!.radiusKm).toBeCloseTo(ANTIPODE_KM, 3);
  });
  it('P front disappears after reaching the antipode', () => {
    expect(get(pArrival(ctx, ANTIPODE_KM).t + 10, 'P')).toBeUndefined();
  });
  it('every front cites at least one registry source', () => {
    for (const f of frontsAt(ctx, 600)) {
      expect(f.sourceIds.length, f.kind).toBeGreaterThan(0);
      for (const s of f.sourceIds) expect(() => ctx.reg.source(s)).not.toThrow();
    }
  });
});

describe.runIf(ready)('irZoneAt', () => {
  const ctx = ready
    ? createSimContext(new RegistryIndex(loadRegistry('research')), JSON.parse(readFileSync('data/derived/ak135-first-arrivals.json', 'utf8')))
    : (null as never);
  it('is empty before contact and an annulus inside the ejecta front afterwards', async () => {
    const { irZoneAt } = await import('../src/model/sim/fronts');
    expect(irZoneAt(ctx, -1, 'morgan')).toEqual({ innerKm: 0, outerKm: 0 });
    for (const t of [600, 1800, 3600, 7200]) {
      const z = irZoneAt(ctx, t, 'morgan');
      expect(z.innerKm).toBeLessThanOrEqual(z.outerKm);
      const rE = frontsAt(ctx, t).find((f) => f.kind === 'ejecta')?.radiusKm;
      if (rE !== undefined) expect(z.outerKm).toBeCloseTo(rE, 3);
    }
  });
});
