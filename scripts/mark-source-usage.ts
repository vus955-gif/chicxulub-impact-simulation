/** Zapisuje w research/sources.json, gdzie cytowane jest każde źródło (pole citedIn; zob. scripts/source-usage.ts). */
import { readFileSync, writeFileSync } from 'node:fs';
import { loadRegistry } from '../src/model/registry/load';
import type { Source } from '../src/model/registry/types';
import { sourceUsage, usageSummary, type SiteRefs } from './source-usage';

const FILE = 'research/sources.json';
const doc = JSON.parse(readFileSync(FILE, 'utf8')) as { sources: Source[] };
const reg = loadRegistry('research');
const sites = (JSON.parse(readFileSync('research/sites.json', 'utf8')) as { sites: SiteRefs[] }).sites;
const usage = sourceUsage(doc.sources, reg.parameters, sites, readFileSync('research/report.template.html', 'utf8'));
for (const s of doc.sources) s.citedIn = usage.get(s.id)!;
writeFileSync(FILE, JSON.stringify(doc, null, 2) + '\n');
const n = usageSummary(usage);
console.log(`sources: ${n.total} — cited by parameters ${n.parameters}, only by sites ${n.sitesOnly}, only in the report text ${n.reportOnly}, not cited ${n.uncited}`);
