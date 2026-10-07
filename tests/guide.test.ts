import { describe, expect, it } from 'vitest';
import { existsSync } from 'node:fs';
import { loadRegistry } from '../src/model/registry/load';
import { RegistryIndex } from '../src/model/sim/registry-client';
import { GUIDE } from '../src/app/guide';
import { VIEWS } from '../src/app/url-state';

describe.runIf(existsSync('research/parameters.json'))('guide', () => {
  const reg = new RegistryIndex(loadRegistry('research'));
  it('every step shows only registry values that exist and are set', () => {
    for (const s of GUIDE) for (const id of s.paramIds) {
      const p = reg.opt(id);
      expect(p, `${s.title.pl}: ${id}`).toBeDefined();
      expect(p!.value, `${s.title.pl}: ${id}`).not.toBeNull();
    }
  });
  it('steps are in time order, within the simulated day, with valid views', () => {
    let prev = -Infinity;
    for (const s of GUIDE) {
      const t = s.t === 'entry' ? -1 : s.t;
      expect(t).toBeGreaterThanOrEqual(prev);
      expect(t).toBeLessThanOrEqual(86400);
      expect(VIEWS).toContain(s.view);
      prev = t;
    }
  });
  it('step text carries no digits (numbers come only from the registry chips)', () => {
    // dozwolone tylko identyfikatory (nazwa ekspedycji, numer otworu), nie wielkości
    for (const s of GUIDE) for (const text of [s.text.pl, s.text.en]) expect(/\d/.test(text.replace(/IODP-ICDP (?:Expedition )?\d+|M\d{4}[A-Z]/g, '')), s.title.pl).toBe(false);
  });
});
