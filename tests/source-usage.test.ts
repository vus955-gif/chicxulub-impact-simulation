import { describe, it, expect } from 'vitest';
import { existsSync, readFileSync } from 'node:fs';
import { loadRegistry } from '../src/model/registry/load';
import type { Parameter, Source } from '../src/model/registry/types';
import { reportCites, sourceUsage, usageSummary, type SiteRefs } from '../scripts/source-usage';

const src = (id: string): Source => ({ id, type: 'article', authors: 'A', year: 2000, title: 'T', doi: `10.1000/${id}`, peerReviewed: true, verified: true });
const par = (id: string, sources: string[]): Parameter => ({ id, group: id.split('.')[0]!, label: id, value: 1, unit: '', certainty: 'fact', method: 'measured', sources });

describe('sourceUsage', () => {
  it('reads multi-id cites from the report template', () => {
    expect([...reportCites('a {{cite:x}} b {{cite:y, z}} {{p:crater.final_diameter}}')]).toEqual(['x', 'y', 'z']);
  });
  it('classifies sources by where they are cited; empty = not cited anywhere', () => {
    const u = sourceUsage([src('a'), src('b'), src('c'), src('d')], [par('x.p', ['a'])],
      [{ coordSource: 'b', observations: [{ sources: ['a'] }] }], '{{cite:a}} {{cite:c}}');
    expect(Object.fromEntries(u)).toEqual({ a: ['parameters', 'sites', 'report'], b: ['sites'], c: ['report'], d: [] });
    expect(usageSummary(u)).toEqual({ total: 4, parameters: 1, sitesOnly: 1, reportOnly: 1, uncited: 1 });
  });
});

const ready = existsSync('research/sources.json') && existsSync('research/sites.json');
describe.runIf(ready)('citedIn in research/sources.json (real data)', () => {
  const reg = ready ? loadRegistry('research') : { parameters: [], sources: [] };
  const usage = ready ? sourceUsage(reg.sources, reg.parameters,
    (JSON.parse(readFileSync('research/sites.json', 'utf8')) as { sites: SiteRefs[] }).sites,
    readFileSync('research/report.template.html', 'utf8')) : new Map();
  it('is up to date (run `npm run registry` after changing parameters, sites or report cites)', () => {
    for (const s of reg.sources) expect(s.citedIn, s.id).toEqual(usage.get(s.id));
  });
  it('matches the counts stated in both READMEs', () => {
    const n = usageSummary(usage);
    const en = readFileSync('README.md', 'utf8').replace(/\s+/g, ' ');
    const pl = readFileSync('README.pl.md', 'utf8').replace(/\s+/g, ' ');
    expect(en).toContain(`Of the ${n.total} sources in \`sources.json\`, ${n.parameters} are cited by registry parameters, ${n.sitesOnly} only by site observations`);
    expect(en).toContain(`${n.reportOnly} only in the text of the research report; the remaining ${n.uncited} were collected`);
    expect(pl).toContain(`Ze ${n.total} źródeł w \`sources.json\` parametry rejestru cytują ${n.parameters}, kolejne ${n.sitesOnly} cytują tylko obserwacje stanowisk`);
    expect(pl).toContain(`a ${n.reportOnly} — tylko tekst raportu badawczego. Pozostałe ${n.uncited} zebrano`);
  });
});
