import { describe, it, expect } from 'vitest';
import { appendAddedSources, applySourcePatches, verifiedDois, type AddedSource, type SourcePatch } from '../scripts/registry-sources';
import type { Source } from '../src/model/registry/types';

const added = (over: Partial<AddedSource> = {}): AddedSource => ({
  id: 'kopp2011', type: 'article', authors: 'Kopp, G.; Lean, J. L.', year: 2011, title: 'T',
  doi: '10.1029/2010GL045777', peerReviewed: true, reason: 'r', ...over,
});
const report = (doi: string, ok: boolean) => verifiedDois({ checkedAt: '2026-01-01T00:00:00Z', report: [{ id: 'x', doi, ok }] });

describe('verified flags come only from the verify-dois report', () => {
  it('ignores a hand-set verified flag in addSources when the DOI was never checked', () => {
    // ręcznie wpisane "verified": true omijało walidator DOI (validate.ts) — flaga ma pochodzić tylko z verify-dois
    const handSet = { ...added(), verified: true } as AddedSource;
    const out: Source[] = [];
    appendAddedSources(out, [handSet], verifiedDois(undefined));
    expect(out[0]!.verified).toBe(false);
  });

  it('takes the flag from the report (DOI matched case-insensitively)', () => {
    const out: Source[] = [];
    appendAddedSources(out, [added()], report('10.1029/2010gl045777', true));
    expect(out[0]!.verified).toBe(true);
  });

  it('keeps a failed check failed', () => {
    const out: Source[] = [];
    appendAddedSources(out, [added()], report('10.1029/2010GL045777', false));
    expect(out[0]!.verified).toBe(false);
  });

  it('marks a source without DOI as not verified and drops the reason field', () => {
    const out: Source[] = [];
    appendAddedSources(out, [added({ id: 'pygplates2025', type: 'software', doi: undefined, url: 'https://www.gplates.org' })], new Map());
    expect(out[0]).not.toHaveProperty('reason');
    expect(out[0]!.verified).toBe(false);
  });

  it('rejects an id that already exists', () => {
    const out: Source[] = [];
    appendAddedSources(out, [added()], new Map());
    expect(() => appendAddedSources(out, [added()], new Map())).toThrow(/duplicate kopp2011/);
  });

  it('sourcePatch may not set the flag, and a patched DOI needs a new check', () => {
    const out: Source[] = [];
    appendAddedSources(out, [added()], report('10.1029/2010GL045777', true));
    expect(() => applySourcePatches(out, { kopp2011: { verified: true, reason: 'r' } as SourcePatch }, new Map())).toThrow(/verify-dois/);
    applySourcePatches(out, { kopp2011: { doi: '10.1029/9999XX000000', reason: 'r' } }, report('10.1029/2010GL045777', true));
    expect(out[0]!.verified).toBe(false);
  });
});
