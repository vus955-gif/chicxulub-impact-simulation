import { describe, it, expect } from 'vitest';
import { titleSimilarity, checkMatch } from '../scripts/doi-match';

describe('titleSimilarity', () => {
  it('is 1 for identical titles', () =>
    expect(titleSimilarity('Rock fluidization during peak-ring formation', 'Rock fluidization during peak-ring formation')).toBe(1));
  it('ignores case, punctuation and HTML tags', () =>
    expect(titleSimilarity('Rock fluidization during peak-ring formation of large impact structures',
      '<i>Rock</i> fluidization during peak-ring formation of large impact structures.')).toBe(1));
  it('is low for unrelated titles', () =>
    expect(titleSimilarity('Global tsunami from an impact', 'Seasonal growth of fish bones')).toBeLessThan(0.2));
});

describe('checkMatch', () => {
  const src = { title: 'A steeply-inclined trajectory for the Chicxulub impact', year: 2020, authors: 'Collins, G.S.; Patel, N.' };
  it('accepts matching metadata', () =>
    expect(checkMatch(src, { title: 'A steeply-inclined trajectory for the Chicxulub impact', year: 2020, firstAuthorFamily: 'Collins' }).ok).toBe(true));
  it('tolerates online-first year off by one', () =>
    expect(checkMatch(src, { title: src.title, year: 2019, firstAuthorFamily: 'Collins' }).ok).toBe(true));
  it('rejects year off by two', () =>
    expect(checkMatch(src, { title: src.title, year: 2018, firstAuthorFamily: 'Collins' }).ok).toBe(false));
  it('rejects different title', () =>
    expect(checkMatch(src, { title: 'Something else entirely about dinosaurs', year: 2020, firstAuthorFamily: 'Collins' }).ok).toBe(false));
  it('rejects wrong first author', () =>
    expect(checkMatch(src, { title: src.title, year: 2020, firstAuthorFamily: 'Smith' }).ok).toBe(false));
  it('matches authors with diacritics', () =>
    expect(checkMatch({ title: 'Ruthenium isotopes', year: 2024, authors: 'Fischer-Gödde, M.' },
      { title: 'Ruthenium isotopes', year: 2024, firstAuthorFamily: 'Fischer-Gödde' }).ok).toBe(true));
});
