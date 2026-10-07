export interface DoiMeta { title: string; year: number | null; firstAuthorFamily: string | null }
export interface MatchResult { ok: boolean; reasons: string[] }

const ascii = (s: string) => s.normalize('NFKD').replace(/[\u0300-\u036f]/g, '').toLowerCase();

export function normalizeTitle(t: string): string[] {
  return ascii(t.replace(/<[^>]+>/g, ' '))
    .replace(/[^a-z0-9]+/g, ' ')
    .trim()
    .split(/\s+/)
    .filter((w) => w.length > 2);
}

export function titleSimilarity(a: string, b: string): number {
  const A = new Set(normalizeTitle(a));
  const B = new Set(normalizeTitle(b));
  if (A.size === 0 || B.size === 0) return 0;
  let inter = 0;
  for (const w of A) if (B.has(w)) inter++;
  return inter / (A.size + B.size - inter);
}

export function checkMatch(src: { title: string; year: number; authors: string }, meta: DoiMeta): MatchResult {
  const reasons: string[] = [];
  const sim = titleSimilarity(src.title, meta.title);
  if (sim < 0.6) reasons.push(`title similarity ${sim.toFixed(2)} < 0.6 (registry: "${src.title}" vs DOI: "${meta.title}")`);
  if (meta.year !== null && Math.abs(meta.year - src.year) > 1) reasons.push(`year ${meta.year} vs ${src.year}`);
  if (meta.firstAuthorFamily && !ascii(src.authors).includes(ascii(meta.firstAuthorFamily))) {
    reasons.push(`first author "${meta.firstAuthorFamily}" not in "${src.authors}"`);
  }
  return { ok: reasons.length === 0, reasons };
}
