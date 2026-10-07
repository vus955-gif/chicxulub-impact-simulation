import type { Certainty, Parameter, Registry, Source } from './types';

const CERTAINTIES: readonly Certainty[] = ['fact', 'extrapolation', 'speculation', 'contested', 'predictive'];
const DOI_RE = /^10\.\d{4,9}\/\S+$/;

export function validateRegistry(reg: Registry): string[] {
  const issues: string[] = [];
  const sources = new Map<string, Source>();
  const paramIds = new Set<string>();

  for (const s of reg.sources) {
    if (sources.has(s.id)) issues.push(`source ${s.id}: duplicate id`);
    sources.set(s.id, s);
    if (s.doi !== undefined && !DOI_RE.test(s.doi)) issues.push(`source ${s.id}: malformed DOI "${s.doi}"`);
    if (s.type === 'article' && !s.doi) issues.push(`source ${s.id}: article without DOI`);
    if (!s.doi && !s.url) issues.push(`source ${s.id}: neither DOI nor URL`);
  }
  for (const p of reg.parameters) {
    if (paramIds.has(p.id)) issues.push(`param ${p.id}: duplicate id`);
    paramIds.add(p.id);
  }
  for (const p of reg.parameters) issues.push(...validateParameter(p, paramIds, sources));
  return issues;
}

function validateParameter(p: Parameter, paramIds: Set<string>, sources: Map<string, Source>): string[] {
  const out: string[] = [];
  const tag = `param ${p.id}`;
  if (p.group !== p.id.split('.')[0]) out.push(`${tag}: group "${p.group}" does not match id prefix`);
  if (!CERTAINTIES.includes(p.certainty)) out.push(`${tag}: unknown certainty "${p.certainty}"`);
  if (p.certainty === 'predictive' && (!p.method.startsWith('predictive:') || !p.notes?.trim())) {
    out.push(`${tag}: predictive without assumptions (method must be predictive:*, notes must list assumptions)`);
  }

  if (p.method.startsWith('derived:')) {
    if (!p.derivedFrom || p.derivedFrom.length === 0) out.push(`${tag}: derived without derivedFrom`);
    for (const d of p.derivedFrom ?? []) {
      if (!paramIds.has(d)) out.push(`${tag}: derivedFrom unknown param "${d}"`);
    }
  } else if (p.sources.length === 0 && p.certainty !== 'predictive') {
    out.push(`${tag}: no sources`); // założenia modeli predykcyjnych dokumentuje pole notes (sprawdzane wyżej)
  }

  for (const sid of p.sources) {
    const s = sources.get(sid);
    if (!s) { out.push(`${tag}: unknown source "${sid}"`); continue; }
    if (s.doi && !s.verified) out.push(`${tag}: source "${sid}" DOI not verified`);
  }

  if (typeof p.value === 'number') {
    if (!Number.isFinite(p.value)) out.push(`${tag}: non-finite value`);
    if (p.range) {
      const [lo, hi] = p.range;
      if (lo > hi) out.push(`${tag}: range reversed`);
      else if (p.value < lo || p.value > hi) out.push(`${tag}: value ${p.value} outside range [${lo}, ${hi}]`);
    }
  }
  if (p.time && !Number.isFinite(p.time.t)) out.push(`${tag}: non-finite time`);
  return out;
}
