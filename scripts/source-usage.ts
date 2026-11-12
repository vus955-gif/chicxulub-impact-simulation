/**
 * Gdzie projekt cytuje każde źródło — pole citedIn w research/sources.json:
 *  parameters — parametry rejestru (literaturowe i pochodne),
 *  sites      — obserwacje i współrzędne stanowisk (research/sites.json),
 *  report     — jawne {{cite:…}} w tekście raportu (research/report.template.html).
 * Pusta lista = źródło przeczytane w wątkach researchu, ale nigdzie niecytowane (lektura tła).
 */
import type { CitedIn, Parameter, Source } from '../src/model/registry/types';

export interface SiteRefs { coordSource?: string; observations?: Array<{ sources?: string[] }> }

/** Identyfikatory z {{cite:a,b}} w szablonie raportu. */
export const reportCites = (template: string): Set<string> =>
  new Set([...template.matchAll(/\{\{cite:([^}]+)\}\}/g)].flatMap((m) => m[1]!.split(',').map((x) => x.trim())));

export function sourceUsage(sources: readonly Source[], params: readonly Parameter[], sites: readonly SiteRefs[], reportTemplate: string): Map<string, CitedIn[]> {
  const byParams = new Set(params.flatMap((p) => p.sources));
  const bySites = new Set(sites.flatMap((s) => [...(s.coordSource ? [s.coordSource] : []), ...(s.observations ?? []).flatMap((o) => o.sources ?? [])]));
  const byReport = reportCites(reportTemplate);
  return new Map(sources.map((s) => {
    const where: CitedIn[] = [];
    if (byParams.has(s.id)) where.push('parameters');
    if (bySites.has(s.id)) where.push('sites');
    if (byReport.has(s.id)) where.push('report');
    return [s.id, where];
  }));
}

/** Liczby do README: cytowane przez parametry; tylko przez stanowiska; tylko w tekście raportu; nigdzie. */
export function usageSummary(usage: ReadonlyMap<string, readonly CitedIn[]>) {
  const all = [...usage.values()];
  return {
    total: all.length,
    parameters: all.filter((w) => w.includes('parameters')).length,
    sitesOnly: all.filter((w) => !w.includes('parameters') && w.includes('sites')).length,
    reportOnly: all.filter((w) => w.length === 1 && w[0] === 'report').length,
    uncited: all.filter((w) => w.length === 0).length,
  };
}
