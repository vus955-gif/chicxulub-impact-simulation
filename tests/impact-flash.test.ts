import { describe, expect, it } from 'vitest';
import { bolideProgress, flashIntensity, washOpacity } from '../src/app/impact-flash';

const F = { tEntry: 5.77, tMaxRad: 8.46, radDurS: 36.6 * 60 };

describe('impact flash (symbol)', () => {
  it('bolide progresses from 0 at 100 km to 1 at contact, absent otherwise', () => {
    expect(bolideProgress(-F.tEntry, F.tEntry)).toBeCloseTo(0, 6);
    expect(bolideProgress(-F.tEntry / 2, F.tEntry)).toBeCloseTo(0.5, 6);
    expect(bolideProgress(-1e-6, F.tEntry)).toBeCloseTo(1, 4);
    expect(bolideProgress(0, F.tEntry)).toBeNull();
    expect(bolideProgress(-F.tEntry - 1, F.tEntry)).toBeNull();
  });

  it('flash is full at contact, peaks again at the fireball radiation maximum and ends with the radiation', () => {
    expect(flashIntensity(-0.1, F)).toBe(0);
    expect(flashIntensity(0.001, F)).toBe(1);
    expect(flashIntensity(F.tMaxRad, F)).toBeCloseTo(1, 6);
    const mid = flashIntensity(F.tMaxRad + (F.radDurS - F.tMaxRad) / 2, F);
    expect(mid).toBeGreaterThan(0.1);
    expect(mid).toBeLessThan(0.4);
    expect(flashIntensity(F.radDurS + 1, F)).toBe(0);
    for (const t of [0.02, 0.5, 3, 30, 600]) {
      const v = flashIntensity(t, F);
      expect(v).toBeGreaterThan(0);
      expect(v).toBeLessThanOrEqual(1);
    }
  });

  it('decays monotonically after the radiation maximum', () => {
    let prev = flashIntensity(F.tMaxRad, F);
    for (let t = F.tMaxRad + 10; t < F.radDurS; t += 60) {
      const v = flashIntensity(t, F);
      expect(v).toBeLessThan(prev);
      prev = v;
    }
  });

  it('screen wash only around contact, fading by 1 s', () => {
    expect(washOpacity(-0.5)).toBe(0);
    expect(washOpacity(0.005)).toBeCloseTo(0.32, 6);
    expect(washOpacity(0.1)).toBeCloseTo(0.16, 6);
    expect(washOpacity(0.999)).toBeLessThan(0.01);
    expect(washOpacity(1)).toBe(0);
  });
});
