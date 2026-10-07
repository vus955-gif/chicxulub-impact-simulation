import { describe, expect, it } from 'vitest';
import { existsSync, readFileSync } from 'node:fs';
import { loadRegistry } from '../src/model/registry/load';
import { RegistryIndex } from '../src/model/sim/registry-client';
import { createSimContext } from '../src/model/sim/context';
import { activeItems, hasRing, placeLabels } from '../src/app/legend';
import { PHENOMENA } from '../src/app/url-state';

const all = Object.fromEntries(PHENOMENA.map((k) => [k, true])) as Record<(typeof PHENOMENA)[number], boolean>;
const ready = existsSync('research/parameters.json') && existsSync('data/derived/ak135-first-arrivals.json');

describe.runIf(ready)('legend items', () => {
  const ctx = ready ? createSimContext(new RegistryIndex(loadRegistry('research')), JSON.parse(readFileSync('data/derived/ak135-first-arrivals.json', 'utf8'))) : (null as never);
  it('lists only what exists at time t, with unique keys and a style for each', () => {
    const early = activeItems(ctx, { t: -2, layers: all, thermal: 'morgan', coast: true }, { tsunamiReached: false, flashesNow: false });
    expect(early.map((i) => i.key)).toEqual(['coast']);
    const mid = activeItems(ctx, { t: 1800, layers: all, thermal: 'morgan', coast: true }, { tsunamiReached: true, flashesNow: true });
    const keys = mid.map((i) => i.key);
    expect(new Set(keys).size).toBe(keys.length);
    for (const k of ['front:lamb', 'front:ejecta', 'front:R', 'fires', 'crater', 'tsunami', 'flash', 'bio:trees90']) expect(keys).toContain(k);
    for (const it of mid) { expect(it.title.pl.length).toBeGreaterThan(3); expect(it.title.en.length).toBeGreaterThan(3); expect(it.style.color.length).toBeGreaterThan(0); }
    expect(mid.filter(hasRing).every((i) => (i.radiusKm ?? 0) > 0)).toBe(true);
  });
  it('respects layer switches', () => {
    const off = { ...all, seismic: false, bio: false };
    const keys = activeItems(ctx, { t: 1800, layers: off, thermal: 'morgan', coast: false }, { tsunamiReached: true, flashesNow: false }).map((i) => i.key);
    expect(keys.some((k) => k.startsWith('front:P') || k.startsWith('bio:'))).toBe(false);
    expect(keys).not.toContain('coast');
  });
});

describe('label placement', () => {
  it('never overlaps and falls back to later candidates', () => {
    const bounds = { x: 0, y: 0, w: 400, h: 300 };
    const placed = placeLabels([
      { key: 'a', w: 60, h: 16, candidates: [[100, 100]] },
      { key: 'b', w: 60, h: 16, candidates: [[110, 104], [100, 200]] },
      { key: 'c', w: 60, h: 16, candidates: [[390, 100]] },
    ], bounds);
    expect(placed.get('a')).toEqual({ x: 104, y: 92, w: 60, h: 16 });
    expect(placed.get('b')!.y).toBe(192);
    expect(placed.has('c')).toBe(false);
  });
});
