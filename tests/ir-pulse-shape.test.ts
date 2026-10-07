import { describe, expect, it } from 'vitest';
import { existsSync, readFileSync } from 'node:fs';
import { loadRegistry } from '../src/model/registry/load';
import { RegistryIndex } from '../src/model/sim/registry-client';
import { createSimContext } from '../src/model/sim/context';
import { irPulse, irFluxAt, ignitionLevel } from '../src/model/sim/intensities';
import { groundTemperatureAt, surfaceTemperature } from '../src/model/predictive/ground-temperature';

const ready = existsSync('research/parameters.json') && existsSync('data/derived/ak135-first-arrivals.json');
describe.runIf(ready)('IR pulse shape (Goldin & Melosh 2009: strong for minutes, above solar ~30 min)', () => {
  const reg = ready ? new RegistryIndex(loadRegistry('research')) : (null as never);
  const ctx = ready ? createSimContext(reg, JSON.parse(readFileSync('data/derived/ak135-first-arrivals.json', 'utf8'))) : (null as never);

  it('holds the peak for the strong phase, then decays to the solar level at the end of the pulse', () => {
    const p = irPulse(ctx, 7500, 90, 'goldin');
    const strong = reg.num('thermal.ir_goldin_strong_phase_pred') * 60;
    expect(p.shape!.strongS).toBe(strong);
    expect(irFluxAt(p, p.peakHigh, strong * 0.5)).toBe(p.peakHigh);
    expect(irFluxAt(p, p.peakHigh, p.durationS)).toBeCloseTo(reg.num('thermal.solar_constant'), 6);
    let prev = Infinity;
    for (let tau = strong; tau <= p.durationS; tau += 60) { const q = irFluxAt(p, p.peakHigh, tau); expect(q).toBeLessThanOrEqual(prev); prev = q; }
    expect(irFluxAt(p, p.peakHigh, p.durationS + 1)).toBe(0);
  });

  it('ground heats much less than under the former 30-min rectangular pulse', () => {
    const p = irPulse(ctx, 7500, 90, 'goldin');
    const gt = groundTemperatureAt(ctx, p, p.startS + p.durationS + 1);
    const prm = { k: reg.num('temperature.soil_conductivity_pred'), rhoC: reg.num('temperature.soil_heat_capacity_pred'), a: reg.num('temperature.surface_absorptivity_pred'), T0: reg.num('temperature.initial_surface_pred') };
    const rect = surfaceTemperature(p.peakHigh * 1e3, p.durationS, p.durationS + 1, prm);
    expect(gt.peakHighK).toBeLessThan(rect.peakK - 50);
    expect(gt.peakHighK).toBeGreaterThan(prm.T0);
  });

  it('other scenarios stay rectangular', () => {
    expect(irPulse(ctx, 2250, 0, 'morgan').shape).toBeUndefined();
    expect(irPulse(ctx, 2250, 0, 'melosh').shape).toBeUndefined();
  });

  it('ignition uses the time spent at the peak, not the whole pulse', () => {
    const p = irPulse(ctx, 7500, 90, 'goldin');
    expect(ignitionLevel(ctx, { ...p, peakHigh: 30 })).toBe('ściółka'); // 3 min ≥ 1 min na szczycie
    expect(ignitionLevel(ctx, { ...p, peakHigh: 60 })).toBe('drewno'); // 3 min ≥ 2 min na szczycie
    expect(ignitionLevel(ctx, { ...p, peakHigh: 60, shape: { strongS: 90 } })).toBe('ściółka');
  });
});
