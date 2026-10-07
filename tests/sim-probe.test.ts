import { describe, it, expect } from 'vitest';
import { existsSync, readFileSync } from 'node:fs';
import { loadRegistry } from '../src/model/registry/load';
import { RegistryIndex } from '../src/model/sim/registry-client';
import { createSimContext } from '../src/model/sim/context';
import { probe } from '../src/model/sim/probe';
import { destination } from '../src/model/sim/geo';
import { gridFromBuffer } from '../src/model/sim/grid';

const files = ['research/parameters.json', 'data/derived/ak135-first-arrivals.json', 'public/data/paleodem_elev_1440x720.i16', 'public/data/tsunami_tt_1440x720.f32', 'public/data/tsunami_amp_1440x720.f32'];
const ready = files.every((f) => existsSync(f));
const CERT = new Set(['fact', 'extrapolation', 'speculation', 'contested', 'predictive']);

describe.runIf(ready)('probe', () => {
  const reg = ready ? new RegistryIndex(loadRegistry('research')) : (null as never);
  const ctx = ready ? createSimContext(reg, JSON.parse(readFileSync('data/derived/ak135-first-arrivals.json', 'utf8'))) : (null as never);
  const buf = (f: string) => { const b = readFileSync(f); return b.buffer.slice(b.byteOffset, b.byteOffset + b.byteLength) as ArrayBuffer; };
  const grids = ready ? {
    elev: gridFromBuffer(buf(files[2]!), 1440, 720, 'i16'),
    tsunamiTT: gridFromBuffer(buf(files[3]!), 1440, 720, 'f32'),
    tsunamiAmp: gridFromBuffer(buf(files[4]!), 1440, 720, 'f32'),
  } : {};

  it('3000 km downrange: P < S < R1, P < ejecta (R1 and ejecta overlap, as at Tanis), sources exist', () => {
    const pt = destination(ctx.crater, ctx.downrangeAzDeg, 3000);
    const r = probe(ctx, grids, pt, { thermal: 'morgan', fires: 'regional' });
    expect(r.distanceKm).toBeCloseTo(3000, 3);
    const t = (k: string) => r.events.find((e) => e.kind === k)!.t;
    expect(t('P')).toBeLessThan(t('S'));
    expect(t('S')).toBeLessThan(t('R'));
    expect(t('P')).toBeLessThan(t('ejecta'));
    expect(Math.abs(t('R') - t('ejecta'))).toBeLessThan(600); // DePalma i in. 2019: R ~13 min, sferule 13–25 min
    for (const e of r.events) {
      expect(CERT.has(e.certainty), e.kind).toBe(true);
      for (const s of e.sourceIds) expect(() => reg.source(s), `${e.kind} → ${s}`).not.toThrow();
    }
    expect(r.events.map((e) => e.t)).toEqual([...r.events.map((e) => e.t)].sort((a, b) => a - b));
  });
  it('point near the crater gets the predictive water-depth ramp', () => {
    const r = probe(ctx, grids, destination(ctx.crater, 22.5, 100), { thermal: 'morgan', fires: 'regional' });
    expect(r.waterDepthPredictive).toBe(true);
    expect(r.waterDepthM).toBeGreaterThan(0);
  });
  it('an Atlantic point receives the tsunami within 24 h', () => {
    const r = probe(ctx, grids, destination(ctx.crater, 70, 2500), { thermal: 'morgan', fires: 'regional' });
    expect(r.events.some((e) => e.kind === 'tsunami')).toBe(true);
  });
});
