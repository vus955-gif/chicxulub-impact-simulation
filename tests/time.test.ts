import { describe, it, expect } from 'vitest';
import { createAxis } from '../src/time/axis';
import { advance } from '../src/time/playback';
import { eventsFromParams, nextEvent, prevEvent, phaseAt } from '../src/time/events';
import type { Parameter } from '../src/model/registry/types';

const axis = createAxis({ tEntry: 5.8, tMin: 0.01, tMax: 86400, prologShare: 0.06 });

describe('time axis', () => {
  it('round-trips t → u → t', () => {
    for (const t of [-3, 0.5, 30, 3600, 86400]) expect(axis.uToT(axis.tToU(t))).toBeCloseTo(t, 6);
  });
  it('is monotonic and spans [0, 1]', () => {
    const ts = [-5.8, -1, 0, 0.01, 1, 60, 3600, 86400];
    const us = ts.map(axis.tToU);
    expect(us[0]).toBeCloseTo(0, 9);
    expect(us[us.length - 1]).toBeCloseTo(1, 9);
    for (let i = 1; i < us.length; i++) expect(us[i]!).toBeGreaterThanOrEqual(us[i - 1]!);
  });
  it('labels every decade in plain units', () => {
    expect(axis.ticks().map((k) => k.label)).toEqual(['przelot', '0', '0,01 s', '0,1 s', '1 s', '10 s', '1 min', '10 min', '1 h', '6 h', '24 h']);
  });
});

describe('playback', () => {
  const cfg = { tEntry: 5.8, tMin: 0.01, tMax: 86400, prologScreenS: 3 };
  it('adaptive: 1 s of screen at 0.5 decade/s multiplies t by √10', () => {
    expect(advance(100, 1, 'adaptive', 0.5, cfg)).toBeCloseTo(100 * Math.sqrt(10), 6);
  });
  it('prolog runs linearly and hands over to tMin', () => {
    expect(advance(-5.8, 1, 'adaptive', 0.5, cfg)).toBeCloseTo(-5.8 + 5.8 / 3, 9);
    expect(advance(-0.1, 1, 'adaptive', 0.5, cfg)).toBe(0.01);
  });
  it('realtime adds screen time and stops at tMax', () => {
    expect(advance(100, 2, 'realtime', 0.5, cfg)).toBe(102);
    expect(advance(86399, 5, 'realtime', 0.5, cfg)).toBe(86400);
  });
});

describe('events', () => {
  const mk = (id: string, t: number): Parameter => ({ id, group: id.split('.')[0]!, label: id, value: t, unit: 's', certainty: 'extrapolation', method: 'measured', sources: ['x'], time: { t } });
  const events = eventsFromParams([mk('crater.a', 30), mk('seismic.b', 1212), mk('crater.c', 300), { ...mk('crater.n', 1), time: null }]);
  it('sorted, only parameters with time', () => expect(events.map((e) => e.t)).toEqual([30, 300, 1212]));
  it('next/prev navigation', () => {
    expect(nextEvent(events, 0)!.t).toBe(30);
    expect(nextEvent(events, 30)!.t).toBe(300);
    expect(prevEvent(events, 300)!.t).toBe(30);
    expect(nextEvent(events, 5000)).toBeUndefined();
  });
  it('phase names follow crater timing', () => {
    const thr = { transientMax: 30, peakRing: 300, final: 600 };
    expect(phaseAt(-2, thr).pl).toBe('Przelot przez atmosferę');
    expect(phaseAt(0.3, thr).pl).toBe('Kontakt i kompresja');
    expect(phaseAt(200, thr).pl).toBe('Wypiętrzenie i zapadanie dna');
    expect(phaseAt(7200, thr).en).toBe('Global effects');
  });
});
