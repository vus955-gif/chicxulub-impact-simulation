/**
 * Flagi verified i źródła dopisywane przez syntezę (research/synthesis.json → addSources, sourcePatch).
 * Flaga verified pochodzi wyłącznie z raportu scripts/verify-dois.ts (research/doi-report.json), nigdy z ręcznego
 * wpisu ani z poprzedniego sources.json — inaczej ręcznie ustawione „true” przechodziłoby z przebiegu na przebieg,
 * a walidator rejestru (validate.ts) przepuszczałby niesprawdzone DOI.
 */
import type { Source } from '../src/model/registry/types';

/** Wpis addSources: pola źródła bez flagi verified (ustala ją verify-dois) + uzasadnienie decyzji syntezy. */
export type AddedSource = Omit<Source, 'verified'> & { reason: string };
/** Wpis sourcePatch: poprawka pól źródła; flagi verified nie wolno ustawiać ręcznie. */
export type SourcePatch = Partial<Omit<Source, 'verified'>> & { reason: string };

export interface DoiReport { checkedAt: string; report: Array<{ id: string; doi: string; ok: boolean }> }

/** DOI (małymi literami) → wynik ostatniego przebiegu verify-dois. */
export const verifiedDois = (report: DoiReport | undefined): Map<string, boolean> =>
  new Map((report?.report ?? []).map((r) => [r.doi.toLowerCase(), r.ok]));

/** Flaga verified dla źródła z DOI: wynik verify-dois, a gdy tego DOI jeszcze nie sprawdzano — false. */
export const verifiedFromRun = (doi: string, checked: ReadonlyMap<string, boolean>): boolean =>
  checked.get(doi.toLowerCase()) ?? false;

export function appendAddedSources(sources: Source[], added: readonly AddedSource[], checked: ReadonlyMap<string, boolean>): void {
  for (const add of added) {
    if (sources.some((x) => x.id === add.id)) throw new Error(`addSources: duplicate ${add.id}`);
    const { reason: _r, ...src } = add as AddedSource & { verified?: unknown };
    delete src.verified; // ręcznie wpisana flaga nie jest dowodem sprawdzenia
    sources.push({ ...src, verified: src.doi ? verifiedFromRun(src.doi, checked) : false });
  }
}

export function applySourcePatches(sources: Source[], patches: Readonly<Record<string, SourcePatch>>, checked: ReadonlyMap<string, boolean>): void {
  for (const [id, p] of Object.entries(patches)) {
    const s = sources.find((x) => x.id === id);
    if (!s) throw new Error(`sourcePatch: unknown source ${id}`);
    if ('verified' in p) throw new Error(`sourcePatch ${id}: "verified" is set only by scripts/verify-dois.ts`);
    const { reason: _r, ...fields } = p;
    Object.assign(s, fields);
    if ('doi' in fields) s.verified = s.doi ? verifiedFromRun(s.doi, checked) : false; // nowy DOI wymaga nowego sprawdzenia
  }
}
