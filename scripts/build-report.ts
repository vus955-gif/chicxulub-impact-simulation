import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import { loadRegistry } from '../src/model/registry/load';
import { validateRegistry } from '../src/model/registry/validate';
import { renderReport } from '../src/report/render';
import { FIGURES } from '../src/report/figures';
import { AK135_FIRST_ARRIVALS } from './paths';

const reg = loadRegistry('research');
const regIssues = validateRegistry(reg);
const syn = JSON.parse(readFileSync('research/synthesis.json', 'utf8')) as { drop: unknown[]; patch: Record<string, unknown> };
const litCount = reg.parameters.filter((p) => !p.method.startsWith('derived:')).length;
const meta: Record<string, string> = {
  date: new Date().toLocaleDateString('pl-PL', { year: 'numeric', month: 'long', day: 'numeric' }),
  sources: String(reg.sources.length),
  dois: String(reg.sources.filter((s) => s.doi).length),
  verified: String(reg.sources.filter((s) => s.doi && s.verified).length),
  lit: String(litCount),
  derived: String(reg.parameters.length - litCount),
  drops: String(syn.drop.length),
  patches: String(Object.keys(syn.patch).length),
};
const template = readFileSync('research/report.template.html', 'utf8').replace(/\{\{meta:(\w+)\}\}/g, (_m, k: string) => {
  if (!(k in meta)) throw new Error(`unknown meta token ${k}`);
  return meta[k]!;
});
const ak135 = JSON.parse(readFileSync(AK135_FIRST_ARRIVALS, 'utf8'));
const figs = Object.fromEntries(Object.entries(FIGURES).map(([k, f]) => [k, () => f({ reg, ak135 })]));
const sitesFile = existsSync('research/sites.json') ? 'research/sites.json' : 'research/sites.input.json';
const sites = JSON.parse(readFileSync(sitesFile, 'utf8')).sites.filter((x: { id: string }) => x.id !== 'chicxulub');
const { html, issues } = renderReport(template, reg, figs, sites);
const all = [...regIssues.map((x) => `registry: ${x}`), ...issues.map((x) => `template: ${x}`)];
if (all.length) {
  console.error(`Report NOT written — ${all.length} issue(s):`);
  for (const x of all) console.error(`  ✗ ${x}`);
  process.exit(1);
}
writeFileSync('research/raport-chicxulub.html', html);
console.log(`research/raport-chicxulub.html written (${(html.length / 1024).toFixed(0)} KB)`);
