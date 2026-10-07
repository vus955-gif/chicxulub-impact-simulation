import { describe, expect, it } from 'vitest';
import { existsSync, readFileSync } from 'node:fs';
import { loadRegistry } from '../src/model/registry/load';
import { RegistryIndex } from '../src/model/sim/registry-client';
import { createSimContext } from '../src/model/sim/context';
import { bioArrivalS, bioReachAt, bioZones } from '../src/model/sim/biosphere';
import { airblastAt, fireballExposureAt } from '../src/model/sim/intensities';

const ready = existsSync('research/parameters.json') && existsSync('data/derived/ak135-first-arrivals.json');
describe.runIf(ready)('biosphere zones', () => {
  const reg = ready ? new RegistryIndex(loadRegistry('research')) : (null as never);
  const ctx = ready ? createSimContext(reg, JSON.parse(readFileSync('data/derived/ak135-first-arrivals.json', 'utf8'))) : (null as never);
  const zones = ready ? bioZones(ctx) : [];
  const z = (k: string) => zones.find((x) => x.key === k)!;

  it('wind zones sit exactly at the EIEP thresholds, with the lower bound inside the upper', () => {
    for (const [k, id] of [['trees90', 'biosphere.tree_blowdown_total_wind'], ['trees30', 'biosphere.tree_blowdown_partial_wind']] as const) {
      const zone = z(k), thr = reg.num(id);
      expect(airblastAt(ctx, zone.radiusKm * 0.99).windMS).toBeGreaterThanOrEqual(thr);
      expect(airblastAt(ctx, zone.radiusKm * 1.01).windMS).toBeLessThan(thr);
      expect(zone.radiusLowKm!).toBeLessThan(zone.radiusKm);
    }
    expect(z('trees30').radiusKm).toBeGreaterThan(z('trees90').radiusKm);
  });

  it('fireball thermal zone matches the scaled EIEP threshold and agrees with the literature ignition radius within 15%', () => {
    const s = (ctx.energyJ / 4.184e15) ** (1 / 6);
    const r = z('thermal').radiusKm;
    expect(fireballExposureAt(ctx, r * 0.99).value).toBeGreaterThanOrEqual(reg.num('biosphere.burn3_exposure_1mt') * s * 0.999);
    expect(Math.abs(r - reg.num('fires.ignition_radius_fireball')) / reg.num('fires.ignition_radius_fireball')).toBeLessThan(0.15);
  });

  it('zones grow with the causing front and stop at their radius', () => {
    const tr = z('trees90');
    expect(bioReachAt(ctx, tr, -1).outerKm).toBe(0);
    expect(bioReachAt(ctx, tr, 600).outerKm).toBeCloseTo(0.6 * reg.num('airblast.lamb_speed'), 3);
    expect(bioReachAt(ctx, tr, 86400).outerKm).toBe(tr.radiusKm);
    const sl = z('slopes');
    expect(bioArrivalS(ctx, sl, 1000)).toBeCloseTo(1000 / reg.num('seismic.rayleigh_group_velocity'), 6);
    expect(bioArrivalS(ctx, sl, sl.radiusKm + 1)).toBeUndefined();
  });

  it('every zone cites sources and registry parameters', () => {
    for (const zone of zones) {
      expect(zone.sourceIds.length).toBeGreaterThan(0);
      for (const id of zone.paramIds) expect(reg.opt(id)).toBeDefined();
      expect(Number.isFinite(zone.radiusKm) && zone.radiusKm > 0).toBe(true);
    }
  });
});
