import { describe, expect, it } from 'vitest';
import { loadRegistry } from '../src/model/registry/load';
import { RegistryIndex } from '../src/model/sim/registry-client';
import { craterAt, craterKeyframes, craterWaterAt } from '../src/model/predictive/crater-kinematics';

const reg = new RegistryIndex(loadRegistry('research'));
const k = craterKeyframes(reg);

describe('crater kinematics (predictive, anchored to registry keyframes)', () => {
  it('reads the keyframes from the registry', () => {
    expect(k.Rt).toBe(50);
    expect(k.Dt).toBe(28);
    expect(k.tD).toBe(20);
    expect(k.Hu).toBe(15);
    expect(k.Rf).toBe(100);
  });

  it('transient cavity: depth at the depth-maximum time and radius at the transient-maximum time', () => {
    expect(craterAt(k, k.tD).surface(0)).toBeCloseTo(-k.Dt, 1);
    expect(craterAt(k, k.tTr).cavityRadius).toBeCloseTo(k.Rt, 6);
    // jama rośnie monotonicznie podczas wykopu
    let prev = 0;
    for (let t = 1; t <= k.tTr; t += 1) { const R = craterAt(k, t).cavityRadius; expect(R).toBeGreaterThan(prev); prev = R; }
  });

  it('central uplift reaches its published maximum height', () => {
    expect(craterAt(k, k.tU).surface(0)).toBeCloseTo(k.Hu, 1);
  });

  it('final crater: floor depth, peak ring above floor, flat outside the rim', () => {
    const f = craterAt(k, k.tF + 1);
    expect(f.phase).toBe('final');
    expect(f.surface(0)).toBeCloseTo(-k.Df, 2);
    expect(f.surface(k.Rpr) - f.surface(0)).toBeCloseTo(k.hPR, 2);
    expect(Math.abs(f.surface(k.Rf))).toBeLessThan(1e-9);
    expect(f.surface(150)).toBe(0);
  });

  it('structural uplift anchors: rocks from ~10 km reach the floor at the centre, Moho uplifted by 1.5 km', () => {
    const f = craterAt(k, 86400);
    expect(f.horizon(k.SU, 0)).toBeGreaterThanOrEqual(f.surface(0) - 0.3);
    expect(f.horizon(k.Hc, 0)).toBeCloseTo(-k.Hc + k.MU, 0);
    expect(f.horizon(k.Hc, 250)).toBeCloseTo(-k.Hc, 3);
  });

  it('profile is continuous across phase boundaries', () => {
    for (const tb of [k.tU, k.tPR, k.tF]) {
      for (const r of [0, 20, k.Rpr, 60, 90, 120]) {
        expect(craterAt(k, tb - 1e-6).surface(r)).toBeCloseTo(craterAt(k, tb + 1e-6).surface(r), 3);
      }
    }
  });

  it('sediments are removed inside the excavation zone and survive outside the inner rim at the end', () => {
    expect(craterAt(k, 10).sedimentPresent(5)).toBe(false);
    expect(craterAt(k, 10).sedimentPresent(150)).toBe(true);
    expect(craterAt(k, 86400).sedimentPresent(k.Rin - 1)).toBe(false);
    expect(craterAt(k, 86400).sedimentPresent(k.Rin + 1)).toBe(true);
  });

  it('melt sheet ends as a lens of the published thickness in the central basin', () => {
    const f = craterAt(k, 86400);
    expect(f.melt(0)).toBeCloseTo(k.Tm, 6);
    expect(f.melt(k.Rm + 1)).toBe(0);
  });

  it('water: expelled during crater formation, returns with the registry timing', () => {
    expect(craterWaterAt(k, 100, 0.95).basinLevel).toBeNull();
    expect(craterWaterAt(k, (k.tF + k.tSea) / 2, 0.95).inflowRadius).toBeLessThan(k.Rf);
    expect(craterWaterAt(k, k.tSea, 0.95).basinLevel).toBeCloseTo(-0.95, 6);
    expect(craterWaterAt(k, k.tSettle, 0.95).basinLevel).toBeCloseTo(0, 6);
  });

  it('never produces NaN', () => {
    for (const t of [-6, 0, 0.01, 1, 10, 20, 25, 30, 100, 180, 250, 300, 450, 600, 3600, 86400]) {
      const s = craterAt(k, t);
      for (const r of [0, 1, 10, 42.5, 50, 77.5, 100, 200, 300]) {
        for (const v of [s.surface(r), s.horizon(3, r), s.horizon(10, r), s.horizon(33, r), s.melt(r), s.cavityRadius]) expect(Number.isFinite(v)).toBe(true);
      }
    }
  });
});
