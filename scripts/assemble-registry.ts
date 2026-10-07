/**
 * Składa rejestr z wyników wątków researchu + decyzji syntezy (research/synthesis.json).
 * Wyjście: research/parameters.json, research/sources.json (flagi verified zachowane, jeśli już ustawione).
 * Każda zmiana względem wątków ma uzasadnienie w synthesis.json — rejestr jest odtwarzalny.
 */
import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import type { Parameter, Source } from '../src/model/registry/types';

const THREADS = ['01-impaktor', '02-krater', '03-ejecta-termika', '04-tsunami', '05-sejsmika-cisnienie', '06-atmosfera-biosfera-paleo', '07-eiep'];
const PARAM_THREADS = new Set(THREADS.filter((t) => t !== '07-eiep')); // z 07 bierzemy tylko źródła

interface ThreadFile { thread: string; sources: Source[]; parameters: Parameter[] }
interface Synthesis {
  meta: Record<string, unknown>;
  drop: Array<{ id: string; reason: string }>;
  choose: Record<string, { thread: string; reason: string }>;
  patch: Record<string, Partial<Parameter> & { reason: string }>;
  add: Array<Parameter & { reason: string }>;
  sourcePatch?: Record<string, Partial<Source> & { reason: string }>;
  addSources?: Array<Source & { reason: string }>;
}

const read = <T>(f: string): T => JSON.parse(readFileSync(f, 'utf8')) as T;
const syn = read<Synthesis>('research/synthesis.json');
const prevVerified = new Map<string, boolean>();
if (existsSync('research/sources.json')) {
  for (const s of read<{ sources: Source[] }>('research/sources.json').sources) if (s.doi) prevVerified.set(s.doi.toLowerCase(), s.verified);
}

// ── źródła: deduplikacja po DOI, mapowanie identyfikatorów per wątek ──
const byKey = new Map<string, Source>();
const usedIds = new Set<string>();
const alias = new Map<string, Map<string, string>>(); // thread → (id w wątku → id kanoniczny)
for (const t of THREADS) {
  const f = `research/threads/${t}.json`;
  if (!existsSync(f)) { console.warn(`⚠ missing ${f}`); continue; }
  const tf = read<ThreadFile>(f);
  const map = new Map<string, string>();
  alias.set(t, map);
  for (const s of tf.sources) {
    s.doi = s.doi?.trim() || undefined; // pusty DOI = brak DOI
    const key = s.doi ? `doi:${s.doi.toLowerCase()}` : `id:${s.id}`;
    const existing = byKey.get(key);
    if (existing) { map.set(s.id, existing.id); continue; }
    let id = s.id;
    for (let k = 1; usedIds.has(id); k++) id = `${s.id}_${k}`;
    usedIds.add(id);
    const doi = s.doi;
    const src: Source = { ...s, id, doi, verified: doi ? prevVerified.get(doi.toLowerCase()) ?? false : s.verified };
    byKey.set(key, src);
    map.set(s.id, id);
  }
}
const sources = [...byKey.values()];
for (const add of syn.addSources ?? []) {
  if (sources.some((x) => x.id === add.id)) throw new Error(`addSources: duplicate ${add.id}`);
  const { reason: _r, ...src } = add;
  sources.push(src);
}
for (const [id, p] of Object.entries(syn.sourcePatch ?? {})) {
  const s = sources.find((x) => x.id === id);
  if (!s) throw new Error(`sourcePatch: unknown source ${id}`);
  const { reason: _r, ...fields } = p;
  Object.assign(s, fields);
}

// ── parametry: unia wątków z mapowaniem źródeł; konflikty rozstrzyga synthesis.choose ──
const candidates = new Map<string, Array<{ thread: string; p: Parameter }>>();
for (const t of THREADS) {
  if (!PARAM_THREADS.has(t)) continue;
  const f = `research/threads/${t}.json`;
  if (!existsSync(f)) continue;
  const map = alias.get(t)!;
  for (const p of read<ThreadFile>(f).parameters) {
    if (p.group === 'eiep') continue;
    const remapped: Parameter = { ...p, sources: (p.sources ?? []).map((sid) => map.get(sid) ?? sid) };
    const list = candidates.get(p.id) ?? [];
    list.push({ thread: t, p: remapped });
    candidates.set(p.id, list);
  }
}

const dropped = new Set(syn.drop.map((d) => d.id));
const unresolved: string[] = [];
const out: Parameter[] = [];
for (const [id, list] of candidates) {
  if (dropped.has(id)) continue;
  let chosen = list[0]!;
  if (list.length > 1) {
    const c = syn.choose[id];
    if (!c) { unresolved.push(`${id}: ${list.map((x) => `${x.thread}=${JSON.stringify(x.p.value)}`).join(' | ')}`); }
    else {
      const hit = list.find((x) => x.thread === c.thread);
      if (!hit) throw new Error(`choose ${id}: thread ${c.thread} has no such parameter`);
      chosen = hit;
    }
  }
  out.push({ ...chosen.p });
}
for (const [id, patch] of Object.entries(syn.patch)) {
  const p = out.find((x) => x.id === id);
  if (!p) throw new Error(`patch: unknown parameter ${id}`);
  const { reason, ...fields } = patch;
  Object.assign(p, fields);
  p.notes = [p.notes, `Synteza: ${reason}`].filter(Boolean).join(' ');
}
for (const a of syn.add) {
  if (out.some((x) => x.id === a.id)) throw new Error(`add: duplicate ${a.id}`);
  const { reason, ...p } = a;
  out.push({ ...p, notes: [p.notes, `Synteza: ${reason}`].filter(Boolean).join(' ') });
}
for (const d of syn.drop) if (!candidates.has(d.id)) console.warn(`⚠ drop: ${d.id} not present in threads`);

out.sort((a, b) => a.id.localeCompare(b.id));
writeFileSync('research/parameters.json', JSON.stringify({ meta: syn.meta, parameters: out }, null, 2) + '\n');
writeFileSync('research/sources.json', JSON.stringify({ sources }, null, 2) + '\n');
console.log(`parameters: ${out.length} (dropped ${dropped.size}, added ${syn.add.length}), sources: ${sources.length}`);
if (unresolved.length) {
  console.log(`UNRESOLVED duplicates (${unresolved.length}) — first thread kept; add to synthesis.choose:`);
  for (const u of unresolved) console.log(`  ${u}`);
}
