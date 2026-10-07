import { readFileSync, writeFileSync } from 'node:fs';
import type { Source } from '../src/model/registry/types';
import { checkMatch, type DoiMeta } from './doi-match';

const UA = { 'User-Agent': 'chicxulub-sim/0.1 (research registry DOI check)' };
const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

async function crossref(doi: string): Promise<DoiMeta | null> {
  const r = await fetch(`https://api.crossref.org/works/${encodeURIComponent(doi)}`, { headers: UA });
  if (!r.ok) return null;
  const m = ((await r.json()) as { message: any }).message;
  const year = m.issued?.['date-parts']?.[0]?.[0] ?? m.published?.['date-parts']?.[0]?.[0] ?? null;
  return { title: m.title?.[0] ?? '', year, firstAuthorFamily: m.author?.[0]?.family ?? null };
}

async function datacite(doi: string): Promise<DoiMeta | null> {
  const r = await fetch(`https://api.datacite.org/dois/${encodeURIComponent(doi)}`, { headers: UA });
  if (!r.ok) return null;
  const a = ((await r.json()) as { data?: { attributes?: any } }).data?.attributes;
  if (!a) return null;
  return { title: a.titles?.[0]?.title ?? '', year: a.publicationYear ?? null, firstAuthorFamily: a.creators?.[0]?.familyName ?? null };
}

const file = process.argv[2] ?? 'research/sources.json';
const doc = JSON.parse(readFileSync(file, 'utf8')) as { sources: Source[] };
const report: Array<{ id: string; doi: string; ok: boolean; registrar: string; reasons: string[] }> = [];

for (const s of doc.sources) {
  if (!s.doi) continue;
  let meta = await crossref(s.doi);
  let registrar = 'crossref';
  if (!meta) { meta = await datacite(s.doi); registrar = 'datacite'; }
  if (!meta) {
    s.verified = false;
    report.push({ id: s.id, doi: s.doi, ok: false, registrar: 'none', reasons: ['DOI not found in Crossref or DataCite'] });
  } else {
    const res = checkMatch(s, meta);
    s.verified = res.ok;
    report.push({ id: s.id, doi: s.doi, ok: res.ok, registrar, reasons: res.reasons });
  }
  await sleep(150);
}

writeFileSync(file, JSON.stringify(doc, null, 2) + '\n');
const reportFile = file.replace(/sources\.json$/, 'doi-report.json');
writeFileSync(reportFile, JSON.stringify({ checkedAt: new Date().toISOString(), report }, null, 2) + '\n');
const bad = report.filter((r) => !r.ok);
console.log(`DOI checked: ${report.length}, ok: ${report.length - bad.length}, failed: ${bad.length}`);
for (const b of bad) console.log(`  ✗ ${b.id} (${b.doi}): ${b.reasons.join('; ')}`);
process.exit(bad.length ? 1 : 0);
