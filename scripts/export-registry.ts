/** Eksport rejestru i danych pomocniczych do public/data/ (wejście aplikacji przeglądarkowej). */
import { mkdirSync, readFileSync, writeFileSync, copyFileSync } from 'node:fs';
import { loadRegistry } from '../src/model/registry/load';
import { validateRegistry } from '../src/model/registry/validate';
import { applyEnglish, applyEnglishSites, type I18nEn, type SiteJson } from './i18n-en';
import { AK135_FIRST_ARRIVALS } from './paths';

const reg = loadRegistry('research');
const issues = validateRegistry(reg);
if (issues.length) {
  console.error(`Registry invalid — ${issues.length} issue(s):`);
  for (const i of issues) console.error(`  ✗ ${i}`);
  process.exit(1);
}
const en = JSON.parse(readFileSync('research/i18n-en.json', 'utf8')) as I18nEn;
const withEn = applyEnglish(reg.parameters, reg.sources, en);
const sitesJson = JSON.parse(readFileSync('research/sites.json', 'utf8')) as { sites: SiteJson[] } & Record<string, unknown>;
const sitesEn = applyEnglishSites(sitesJson.sites, en);
const missing = [...withEn.missing, ...sitesEn.missing];
if (missing.length) {
  console.error(`English texts missing — ${missing.length} item(s) (research/i18n-en.json):`);
  for (const m of missing) console.error(`  ✗ ${m}`);
  process.exit(1);
}
mkdirSync('public/data', { recursive: true });
writeFileSync('public/data/registry.json', JSON.stringify({ generatedAt: new Date().toISOString(), parameters: withEn.params, sources: withEn.sources }));
copyFileSync(AK135_FIRST_ARRIVALS, 'public/data/ak135.json');
writeFileSync('public/data/sites.json', `${JSON.stringify({ ...sitesJson, sites: sitesEn.sites }, null, 2)}\n`);
console.log(`public/data/registry.json: ${reg.parameters.length} parameters, ${reg.sources.length} sources; ak135.json, sites.json copied`);
