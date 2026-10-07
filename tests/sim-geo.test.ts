import { describe, it, expect } from 'vitest';
import { gcDistanceKm, azimuthDeg, destination, angleDiffDeg, R_KM } from '../src/model/sim/geo';
import { RegistryIndex } from '../src/model/sim/registry-client';

describe('geo', () => {
  it('quarter circumference between pole and equator', () =>
    expect(gcDistanceKm({ lat: 90, lon: 0 }, { lat: 0, lon: 0 })).toBeCloseTo((Math.PI / 2) * R_KM, 6));
  it('antipode distance = π R', () =>
    expect(gcDistanceKm({ lat: 25, lon: -71 }, { lat: -25, lon: 109 })).toBeCloseTo(Math.PI * R_KM, 6));
  it('azimuth east along equator is 90°', () =>
    expect(azimuthDeg({ lat: 0, lon: 0 }, { lat: 0, lon: 10 })).toBeCloseTo(90, 6));
  it('destination round-trips distance and azimuth', () => {
    const a = { lat: 25.11, lon: -71.58 };
    const b = destination(a, 225, 3000);
    expect(gcDistanceKm(a, b)).toBeCloseTo(3000, 6);
    expect(azimuthDeg(a, b)).toBeCloseTo(225, 6);
  });
  it('angleDiffDeg is the smallest absolute difference', () => {
    expect(angleDiffDeg(350, 10)).toBeCloseTo(20, 9);
    expect(angleDiffDeg(225, 45)).toBeCloseTo(180, 9);
  });
});

describe('RegistryIndex', () => {
  const idx = new RegistryIndex({
    sources: [{ id: 's', type: 'dataset', authors: 'A', year: 2000, title: 'T', url: 'https://x', peerReviewed: false, verified: false }],
    parameters: [
      { id: 'a.n', group: 'a', label: 'N', value: 2, unit: 'km', certainty: 'fact', method: 'measured', sources: ['s'] },
      { id: 'a.s', group: 'a', label: 'S', value: 'tekst', unit: '', certainty: 'fact', method: 'measured', sources: ['s'] },
    ],
  });
  it('returns numbers and parameters', () => {
    expect(idx.num('a.n')).toBe(2);
    expect(idx.param('a.s').value).toBe('tekst');
    expect(idx.source('s').title).toBe('T');
  });
  it('throws with the id for missing or non-numeric parameters', () => {
    expect(() => idx.num('a.missing')).toThrow('a.missing');
    expect(() => idx.num('a.s')).toThrow('a.s');
    expect(idx.opt('a.missing')).toBeUndefined();
  });
});
