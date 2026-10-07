import { describe, expect, it } from 'vitest';
import { existsSync, readFileSync } from 'node:fs';
import { loadRegistry } from '../src/model/registry/load';
import { RegistryIndex } from '../src/model/sim/registry-client';
import { createSimContext } from '../src/model/sim/context';
import { ejectaArrival } from '../src/model/sim/arrivals';
import { ejectaArrivalTime } from '../src/model/eiep/ejecta';
import { destination, gcDistanceKm } from '../src/model/sim/geo';
import { FLASH_LIFE_S, flashLevel, flashScreenAge, flightTimeTo, llToV3, makeParticle, orbitParams, particleAt, particleAtInto, sampleEjecta, speedForRange, v3ToLl, type EjectaParticle } from '../src/model/sim/ejecta-orbits';

const ready = existsSync('research/parameters.json') && existsSync('data/derived/ak135-first-arrivals.json');
describe.runIf(ready)('ejecta orbits (Kepler, rotating Earth, re-entry)', () => {
  const reg = ready ? new RegistryIndex(loadRegistry('research')) : (null as never);
  const ctx = ready ? createSimContext(reg, JSON.parse(readFileSync('data/derived/ak135-first-arrivals.json', 'utf8'))) : (null as never);
  const op = ready ? orbitParams(ctx) : (null as never);
  const crater = ready ? llToV3(ctx.crater.lat, ctx.crater.lon) : (null as never);
  const reentryRangeKm = (p: EjectaParticle) => gcDistanceKm(ctx.crater, { lat: p.reLat, lon: p.reLon });

  it('non-rotating 45° flight time matches the EIEP ballistic time (to the surface) within the re-entry-layer offset', () => {
    for (const d of [1000, 3000, 6000]) {
      const tLayer = flightTimeTo(d, 45, 6370)!; // warstwa na powierzchni → czas jak w EIEP
      expect(tLayer / ejectaArrivalTime(d * 1e3)).toBeCloseTo(1, 3);
      expect(flightTimeTo(d, 45, op.rRe)!).toBeLessThan(tLayer);
    }
  });

  it('without rotation a particle re-enters along its azimuth, just short of its nominal range', () => {
    const noRot = { ...op, omega: 0 };
    const d = 4000, az = 30;
    const p = makeParticle(crater, az, 45, speedForRange(d, 45)!, 0, noRot, d)!;
    const target = destination(ctx.crater, az, d);
    const re = reentryRangeKm(p);
    expect(re).toBeLessThan(d);
    expect(re).toBeGreaterThan(d * 0.95);
    // ten sam azymut: punkt wejścia leży na wielkim kole do celu
    const pr = llToV3(p.reLat, p.reLon), tg = llToV3(target.lat, target.lon);
    expect(Math.acos(pr[0] * tg[0] + pr[1] * tg[1] + pr[2] * tg[2]) * 6370).toBeCloseTo(d - re, -1);
  });

  it('stays on its orbit: launch at the surface, re-entry exactly at the layer radius', () => {
    const p = makeParticle(crater, 200, 40, speedForRange(5000, 40)!, 2, op, 5000)!;
    const at = (t: number) => { const v = particleAt(p, t, op)!; return Math.hypot(v[0], v[1], v[2]); };
    expect(at(p.t0 + 1e-3)).toBeCloseTo(6370, 0);
    expect(at(p.tRe - 1e-3)).toBeCloseTo(op.rRe, 0);
    expect(particleAt(p, p.tRe + 1, op)).toBeNull();
    expect(particleAt(p, p.t0 - 1, op)).toBeNull();
  });

  it('Earth rotation deflects a northward launch to the east in the northern hemisphere (Coriolis)', () => {
    const d = 3000;
    const v = speedForRange(d, 45)!;
    const rot = makeParticle(crater, 0, 45, v, 0, op, d)!;
    const fix = makeParticle(crater, 0, 45, v, 0, { ...op, omega: 0 }, d)!;
    const dLon = ((rot.reLon - fix.reLon + 540) % 360) - 180;
    expect(dLon).toBeGreaterThan(0.5);
  });

  it('sample: the fastest particles reproduce the literature arrival front; the rest arrive later', () => {
    const ps = sampleEjecta(ctx, 2500, 7);
    const bound = ps.filter((p) => !p.hyper);
    expect(ps.length).toBe(2500);
    const esc = ps.length - bound.length;
    expect(esc / ps.length).toBeGreaterThan(0.06);
    expect(esc / ps.length).toBeLessThan(0.18);
    for (const [lo, hi] of [[1500, 2500], [6000, 9000]] as const) {
      const bin = bound.filter((p) => { const r = reentryRangeKm(p); return r >= lo && r < hi; });
      expect(bin.length).toBeGreaterThan(20);
      const first = Math.min(...bin.map((p) => p.tRe));
      const front = ejectaArrival(ctx, lo).t;
      expect(first).toBeGreaterThan(front * 0.75);
      expect(first).toBeLessThan(ejectaArrival(ctx, hi).t * 1.25);
    }
    for (const p of bound) { expect(Number.isFinite(p.tRe)).toBe(true); expect(Number.isFinite(p.reLat)).toBe(true); }
  });

  it('the allocation-free particleAtInto agrees with the reference particleAt', () => {
    const out = new Float32Array(3);
    for (const p of sampleEjecta(ctx, 300, 5)) {
      for (const f of [0.1, 0.5, 0.9]) {
        const t = p.t0 + f * (Number.isFinite(p.tRe) ? p.tRe - p.t0 : 3600);
        const ref = particleAt(p, t, op)!;
        expect(particleAtInto(p, t, op, out, 0)).toBe(true);
        expect(Math.hypot(out[0]! - ref[0], out[1]! - ref[1], out[2]! - ref[2])).toBeLessThan(0.01 * Math.hypot(...ref));
      }
      expect(particleAtInto(p, p.t0 - 1, op, out, 0)).toBe(false);
    }
  });

  it('escaping particles climb away from Earth', () => {
    const p = sampleEjecta(ctx, 400, 11).find((x) => x.hyper)!;
    const r = (t: number) => { const v = particleAt(p, t, op)!; return Math.hypot(v[0], v[1], v[2]); };
    expect(r(p.t0 + 600)).toBeGreaterThan(r(p.t0 + 60));
    expect(r(p.t0 + 3600)).toBeGreaterThan(6370 * 3);
  });

  it('flash age is deterministic in screen seconds for both playback modes', () => {
    expect(flashScreenAge(1000, 1000, 'adaptive', 0.5)).toBe(0);
    expect(flashScreenAge(1000 * Math.sqrt(10), 1000, 'adaptive', 0.5)).toBeCloseTo(1, 6);
    expect(flashScreenAge(1002, 1000, 'realtime', 0.5)).toBe(2);
    expect(flashScreenAge(500, 1000, 'adaptive', 0.5)).toBeLessThan(0);
  });

  it('re-entry flash lights up fast, fades out and is dark outside its life', () => {
    expect(flashLevel(-0.01)).toBe(0);
    expect(flashLevel(0.06)).toBeCloseTo(1, 9);
    expect(flashLevel(0.03)).toBeCloseTo(0.5, 9);
    expect(flashLevel(0.2)).toBeLessThan(flashLevel(0.1));
    expect(flashLevel(FLASH_LIFE_S)).toBe(0);
    expect(flashLevel(FLASH_LIFE_S * 2)).toBe(0);
  });

  it('lat/lon conversion round-trips', () => {
    const ll = v3ToLl(llToV3(-33.3, 151.2));
    expect(ll.lat).toBeCloseTo(-33.3, 9);
    expect(ll.lon).toBeCloseTo(151.2, 9);
  });
});

describe('re-entry geometry (analytic) agrees with the orbit propagation', () => {
  it('distance and time to the layer match the state-vector orbit', async () => {
    const m = await import('../src/model/sim/ejecta-orbits');
    const rRe = 6370 + 70, nu = 1.2, phi = 30;
    const g = m.reentryGeometry(nu, phi, rRe)!;
    const crater = m.llToV3(0, 0);
    const p = m.makeParticle(crater, 90, phi, Math.sqrt(nu * 9.8e-3 * 6370), 0, { omega: 0, rRe }, g.dKm)!;
    expect(p.tRe).toBeCloseTo(g.tS, 3);
    const a = crater, b = m.llToV3(p.reLat, p.reLon);
    expect(Math.acos(a[0] * b[0] + a[1] * b[1] + a[2] * b[2]) * 6370).toBeCloseTo(g.dKm, 2);
  });
});

describe.runIf(ready)('fast propagation and flash windows', () => {
  it('particleAtInto equals particleAt; flash window selects exactly the lit flashes', async () => {
    const m = await import('../src/model/sim/ejecta-orbits');
    const reg = new RegistryIndex(loadRegistry('research'));
    const ctx = createSimContext(reg, JSON.parse(readFileSync('data/derived/ak135-first-arrivals.json', 'utf8')));
    const op = m.orbitParams(ctx), ps = m.sampleEjecta(ctx, 600, 3), out = new Float32Array(3);
    for (const p of ps.slice(0, 200)) for (const t of [p.t0 + 30, (p.t0 + Math.min(p.tRe, p.t0 + 7200)) / 2]) {
      const a = m.particleAt(p, t, op), ok = m.particleAtInto(p, t, op, out, 0);
      expect(ok).toBe(a !== null);
      if (a) for (let k = 0; k < 3; k++) expect(out[k]!).toBeCloseTo(a[k]!, 0);
    }
    const order = m.sortByReentry(ps);
    for (const [t, mode] of [[1200, 'adaptive'], [3000, 'realtime']] as const) {
      const [tf, tt] = m.flashWindow(t, 0.4, mode, 0.5);
      const [lo, hi] = m.reentryWindow(ps, order, tf, tt);
      const lit = ps.filter((p) => { const g = m.flashScreenAge(t, p.tRe, mode, 0.5); return g >= 0 && g < 0.4; }).length;
      expect(Math.abs(hi - lo - lit)).toBeLessThanOrEqual(1);
    }
  });
});
