import { describe, it, expect } from 'vitest';
import { validateRegistry } from '../src/model/registry/validate';
import type { Registry } from '../src/model/registry/types';

// Fikstury testowe — wartości liczbowe są arbitralne, nie pochodzą z researchu.
function base(): Registry {
  return {
    sources: [
      { id: 'srcA2005', type: 'article', authors: 'Alpha, A.; Beta, B.', year: 2005,
        title: 'Test article', container: 'Test Journal', doi: '10.1111/test.123',
        peerReviewed: true, verified: true },
      { id: 'dataB2018', type: 'dataset', authors: 'Gamma, G.', year: 2018,
        title: 'Test dataset', doi: '10.5281/zenodo.1', peerReviewed: false, verified: true },
    ],
    parameters: [
      { id: 'impactor.diameter', group: 'impactor', label: 'Średnica', value: 10, unit: 'km',
        range: [8, 15], certainty: 'extrapolation', method: 'model:srcA2005', sources: ['srcA2005'] },
      { id: 'energy.kinetic_eiep', group: 'energy', label: 'Energia', value: 1e23, unit: 'J',
        range: null, certainty: 'extrapolation', method: 'derived:eiep.kineticEnergy',
        sources: ['srcA2005'], derivedFrom: ['impactor.diameter'] },
    ],
  };
}

describe('validateRegistry', () => {
  it('accepts a valid registry', () => {
    expect(validateRegistry(base())).toEqual([]);
  });
  it('flags duplicate parameter ids', () => {
    const r = base(); r.parameters.push({ ...r.parameters[0]! });
    expect(validateRegistry(r).join('\n')).toContain('duplicate id');
  });
  it('flags unknown source references', () => {
    const r = base(); r.parameters[0]!.sources = ['nope'];
    expect(validateRegistry(r).join('\n')).toContain('unknown source "nope"');
  });
  it('flags unverified DOI sources used by parameters', () => {
    const r = base(); r.sources[0]!.verified = false;
    expect(validateRegistry(r).join('\n')).toContain('DOI not verified');
  });
  it('flags value outside range', () => {
    const r = base(); r.parameters[0]!.value = 20;
    expect(validateRegistry(r).join('\n')).toContain('outside range');
  });
  it('flags reversed range', () => {
    const r = base(); r.parameters[0]!.range = [15, 8];
    expect(validateRegistry(r).join('\n')).toContain('range reversed');
  });
  it('flags derived parameter without derivedFrom', () => {
    const r = base(); delete r.parameters[1]!.derivedFrom;
    expect(validateRegistry(r).join('\n')).toContain('derived without derivedFrom');
  });
  it('flags derivedFrom pointing to unknown parameter', () => {
    const r = base(); r.parameters[1]!.derivedFrom = ['ghost.param'];
    expect(validateRegistry(r).join('\n')).toContain('derivedFrom unknown param "ghost.param"');
  });
  it('flags group not matching id prefix', () => {
    const r = base(); r.parameters[0]!.group = 'crater';
    expect(validateRegistry(r).join('\n')).toContain('does not match id prefix');
  });
  it('flags non-derived parameter without sources', () => {
    const r = base(); r.parameters[0]!.sources = [];
    expect(validateRegistry(r).join('\n')).toContain('no sources');
  });
  it('flags article without DOI', () => {
    const r = base(); delete r.sources[0]!.doi; r.sources[0]!.url = 'https://example.org';
    expect(validateRegistry(r).join('\n')).toContain('article without DOI');
  });
  it('flags malformed DOI', () => {
    const r = base(); r.sources[0]!.doi = 'doi:10.1111/x';
    expect(validateRegistry(r).join('\n')).toContain('malformed DOI');
  });
  it('flags unknown certainty', () => {
    const r = base(); (r.parameters[0] as { certainty: string }).certainty = 'maybe';
    expect(validateRegistry(r).join('\n')).toContain('unknown certainty');
  });
});

describe('validateRegistry — predictive models', () => {
  it('accepts a predictive parameter with method predictive:* and stated assumptions', () => {
    const r = base();
    r.parameters.push({ id: 'darkness.light_fraction_24h', group: 'darkness', label: 'Ułamek światła', value: 0.1, unit: '',
      certainty: 'predictive', method: 'predictive:darkness', sources: ['srcA2005'], notes: 'Założenia: …' });
    expect(validateRegistry(r)).toEqual([]);
  });
  it('flags predictive parameter without assumptions or wrong method', () => {
    const r = base();
    r.parameters.push({ id: 'darkness.x', group: 'darkness', label: 'X', value: 1, unit: '',
      certainty: 'predictive', method: 'model:srcA2005', sources: ['srcA2005'] });
    expect(validateRegistry(r).join('\n')).toContain('predictive without assumptions');
  });
});

describe('validateRegistry — predictive assumptions without literature sources', () => {
  it('accepts a predictive assumption with notes but no sources', () => {
    const r = base();
    r.parameters.push({ id: 'temperature.k_assumed', group: 'temperature', label: 'k', value: 0.3, unit: 'W/(m·K)',
      certainty: 'predictive', method: 'predictive:ground-temperature', sources: [], notes: 'Założenie: sucha gleba.' });
    expect(validateRegistry(r)).toEqual([]);
  });
  it('still requires sources for non-predictive parameters', () => {
    const r = base(); r.parameters[0]!.sources = [];
    expect(validateRegistry(r).join('\n')).toContain('no sources');
  });
});
