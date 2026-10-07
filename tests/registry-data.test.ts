import { describe, it, expect } from 'vitest';
import { existsSync } from 'node:fs';
import { loadRegistry } from '../src/model/registry/load';
import { validateRegistry } from '../src/model/registry/validate';
import { SCENARIO_INPUT_IDS } from '../src/model/registry/scenario-ids';

const ready = existsSync('research/parameters.json') && existsSync('research/sources.json');

describe.runIf(ready)('research registry (real data)', () => {
  // Vitest wykonuje ciało describe także przy pominięciu — ładujemy tylko, gdy pliki istnieją.
  const reg = ready ? loadRegistry('research') : { parameters: [], sources: [] };
  it('passes validation', () => {
    expect(validateRegistry(reg)).toEqual([]);
  });
  it('defines every scenario input as a number', () => {
    for (const id of SCENARIO_INPUT_IDS) {
      const p = reg.parameters.find((x) => x.id === id);
      expect(p, id).toBeDefined();
      expect(typeof p!.value, id).toBe('number');
    }
  });
  it('cites only peer-reviewed sources for non-dataset parameters', () => {
    const src = new Map(reg.sources.map((s) => [s.id, s]));
    for (const p of reg.parameters) {
      for (const sid of p.sources) {
        const s = src.get(sid)!;
        if (s.type === 'article') expect(s.peerReviewed, `${p.id} → ${sid}`).toBe(true);
      }
    }
  });
});
