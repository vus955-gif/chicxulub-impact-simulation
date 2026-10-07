import { describe, expect, it } from 'vitest';
import { existsSync, readFileSync } from 'node:fs';
import { loadRegistry } from '../src/model/registry/load';
import { RegistryIndex } from '../src/model/sim/registry-client';
import { createSimContext } from '../src/model/sim/context';
import { probe } from '../src/model/sim/probe';
import { siteComparisons, ratio } from '../src/app/site-compare';

const ready = existsSync('research/parameters.json') && existsSync('data/derived/ak135-first-arrivals.json') && existsSync('public/data/sites.json');
describe.runIf(ready)('site comparisons (model vs literature)', () => {
  const reg = ready ? new RegistryIndex(loadRegistry('research')) : (null as never);
  const ctx = ready ? createSimContext(reg, JSON.parse(readFileSync('data/derived/ak135-first-arrivals.json', 'utf8'))) : (null as never);
  const sites = ready ? (JSON.parse(readFileSync('public/data/sites.json', 'utf8')).sites as Array<{ id: string; paleoLat: number; paleoLon: number }>) : [];
  const at = (id: string) => { const s = sites.find((x) => x.id === id)!; return probe(ctx, {}, { lat: s.paleoLat, lon: s.paleoLon }, { thermal: 'morgan', fires: 'regional' }); };

  it('Tanis: paleo distance and seismic arrivals agree with the literature within 15%', () => {
    const rows = siteComparisons('tanis', at('tanis'), reg);
    const get = (l: string) => rows.find((r) => r.label.pl.startsWith(l))!;
    for (const l of ['odległość', 'fala P', 'fala S', 'fale Rayleigha']) {
      const q = ratio(get(l));
      expect(q).not.toBeNull();
      expect(Math.abs(q! - 1)).toBeLessThan(0.15);
    }
  });

  it('Tanis: first ejecta precede the published start of spherule fall', () => {
    const row = siteComparisons('tanis', at('tanis'), reg).find((r) => r.label.pl.startsWith('początek opadu'))!;
    expect(row.model!.value).toBeLessThanOrEqual(row.lit.value);
  });

  it('unknown sites give no rows', () => {
    expect(siteComparisons('gubbio', at('gubbio'), reg)).toEqual([]);
  });
});
