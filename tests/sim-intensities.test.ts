import { describe, it, expect } from 'vitest';
import { existsSync, readFileSync } from 'node:fs';
import { loadRegistry } from '../src/model/registry/load';
import { RegistryIndex } from '../src/model/sim/registry-client';
import { createSimContext } from '../src/model/sim/context';
import { airblastAt, ejectaThicknessAt, irPulse, ignitionLevel, seismicMeffAt } from '../src/model/sim/intensities';

const ready = existsSync('research/parameters.json') && existsSync('data/derived/ak135-first-arrivals.json');
describe.runIf(ready)('intensities', () => {
  const reg = ready ? new RegistryIndex(loadRegistry('research')) : (null as never);
  const ctx = ready ? createSimContext(reg, JSON.parse(readFileSync('data/derived/ak135-first-arrivals.json', 'utf8'))) : (null as never);
  const rel = (a: number, b: number) => Math.abs(a - b) / Math.abs(b);

  it('matches derived.json at 1000 and 3000 km (same EIEP code path)', () => {
    for (const d of [1000, 3000]) {
      expect(rel(airblastAt(ctx, d).overpressurePa, reg.num(`airblast.overpressure_eiep_${d}km`))).toBeLessThan(1e-9);
      expect(rel(airblastAt(ctx, d).windMS, reg.num(`airblast.wind_eiep_${d}km`))).toBeLessThan(1e-9);
      expect(seismicMeffAt(ctx, d).value).toBeCloseTo(reg.num(`seismic.m_eff_eiep_${d}km`), 9);
      expect(rel(ejectaThicknessAt(ctx, d).value, reg.num(`ejecta.thickness_eiep_${d}km`))).toBeLessThan(1e-9);
    }
  });
  it('overpressure band spans EIEP/5 … EIEP and flags shocks above 194 dB', () => {
    const a = airblastAt(ctx, 1000);
    expect(a.overpressureLowPa).toBeCloseTo(a.overpressurePa / 5, 6);
    expect(a.isShock).toBe(a.splDb > 194);
  });
  it('distal ejecta never thinner than the measured global layer', () => {
    const floorM = reg.num('ejecta.distal_layer_thickness') / 1000;
    expect(ejectaThicknessAt(ctx, 15000).value).toBeGreaterThanOrEqual(floorM);
  });
  it('Morgan scenario: downrange intermediate = registry value; far uprange is negligible', () => {
    expect(irPulse(ctx, 4500, 0, 'morgan').peakHigh).toBeCloseTo(reg.num('thermal.ir_flux_peak_intermediate_downrange') * 1.1, 6);
    expect(irPulse(ctx, 5000, 180, 'morgan').peakHigh).toBeLessThanOrEqual(reg.param('thermal.ir_flux_uprange_far').range![1]);
  });
  it('Goldin scenario uses only the published range (no invented central value)', () => {
    const p = irPulse(ctx, 6000, 0, 'goldin');
    expect([p.peakLow, p.peakHigh]).toEqual(reg.param('thermal.ir_flux_peak_goldin').range);
  });
  it('ignition levels follow the registry thresholds', () => {
    expect(ignitionLevel(ctx, { peakLow: 50, peakHigh: 56, durationS: 150 })).toBe('wood');
    expect(ignitionLevel(ctx, { peakLow: 20, peakHigh: 30, durationS: 90 })).toBe('litter');
    expect(ignitionLevel(ctx, { peakLow: 5, peakHigh: 15, durationS: 1800 })).toBe('none');
  });
});
