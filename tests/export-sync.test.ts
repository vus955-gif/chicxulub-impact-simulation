import { describe, it, expect } from 'vitest';
import { existsSync, readFileSync } from 'node:fs';
import { loadRegistry } from '../src/model/registry/load';

const ready = existsSync('research/parameters.json') && existsSync('public/data/registry.json');

describe.runIf(ready)('browser export is in sync with the research registry', () => {
  it('same parameter ids and values (run `npm run registry` after changing research data)', () => {
    const src = loadRegistry('research');
    const exp = JSON.parse(readFileSync('public/data/registry.json', 'utf8')) as { parameters: Array<{ id: string; value: unknown }>; sources: Array<{ id: string }> };
    const a = new Map(src.parameters.map((p) => [p.id, p.value]));
    const b = new Map(exp.parameters.map((p) => [p.id, p.value]));
    expect([...b.keys()].sort()).toEqual([...a.keys()].sort());
    for (const [id, v] of a) expect(b.get(id), id).toEqual(v);
    expect(exp.sources.map((s) => s.id).sort()).toEqual(src.sources.map((s) => s.id).sort());
  });
});
