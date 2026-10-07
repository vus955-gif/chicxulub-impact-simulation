import { describe, it, expect } from 'vitest';
import { existsSync, readFileSync } from 'node:fs';
import { loadRegistry } from '../src/model/registry/load';
import { FIGURES, fmtTime } from '../src/report/figures';

const ready = existsSync('research/parameters.json') && existsSync('research/sources.json') && existsSync('data/derived/ak135-first-arrivals.json');

describe('fmtTime', () => {
  it('formats seconds, minutes and hours in Polish', () => {
    expect(fmtTime(8.5)).toBe('8,5 s');
    expect(fmtTime(780)).toBe('13 min');
    expect(fmtTime(63540)).toBe('17,6 h'); // 17,65 h → binarnie 17,649…
  });
});

describe.runIf(ready)('figures render from the real registry', () => {
  const reg = ready ? loadRegistry('research') : { parameters: [], sources: [] };
  const ak135 = ready ? JSON.parse(readFileSync('data/derived/ak135-first-arrivals.json', 'utf8')) : undefined;
  for (const [name, fn] of Object.entries(FIGURES)) {
    it(`${name}: valid SVG without NaN`, () => {
      const svg = fn({ reg, ak135 });
      expect(svg.startsWith('<svg')).toBe(true);
      expect(svg).not.toMatch(/NaN|Infinity|undefined/);
    });
  }
});
