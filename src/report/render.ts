import type { Parameter, Registry } from '../model/registry/types';
import { CERTAINTY_LABEL, CERTAINTY_MARK, formatDuration, formatNumber, formatParam, formatRange } from '../model/registry/format';
import { gcDistanceKm } from '../model/sim/geo';
import { esc } from './html';
import type { Certainty } from '../model/registry/types';

export interface SiteObservation { text: string; sources: string[]; certainty: Certainty }
export interface Site { id: string; name: string; lat: number; lon: number; coordSource?: string; observations: SiteObservation[]; paleoLat?: number; paleoLon?: number }

const fmtT = (s: number): string => `T${s < 0 ? '−' : '+'}${formatDuration(Math.abs(s))}`;

export interface RenderResult { html: string; issues: string[] }

export function renderReport(template: string, reg: Registry, figs: Record<string, () => string> = {}, sites: Site[] = []): RenderResult {
  const issues: string[] = [];
  const params = new Map(reg.parameters.map((p) => [p.id, p]));
  const sources = new Map(reg.sources.map((s) => [s.id, s]));
  const order: string[] = [];

  const num = (sid: string): number => {
    if (!order.includes(sid)) order.push(sid);
    return order.indexOf(sid) + 1;
  };
  const cite = (ids: string[]): string => {
    const known = ids.filter((id) => {
      if (sources.has(id)) return true;
      issues.push(`unknown source "${id}"`);
      return false;
    });
    if (known.length === 0) return '';
    return `<sup class="cite">${known.map((id) => `<a href="#ref-${num(id)}">[${num(id)}]</a>`).join('')}</sup>`;
  };
  const value = (p: Parameter): string =>
    `<span class="pv ${p.certainty}" title="${esc(CERTAINTY_LABEL[p.certainty])}">${esc(formatParam(p))}` +
    ` <span class="mark">${CERTAINTY_MARK[p.certainty]}</span></span>${cite(p.sources)}`;
  const table = (group: string): string => {
    const rows = reg.parameters.filter((p) => p.group === group);
    if (rows.length === 0) { issues.push(`empty table group "${group}"`); return ''; }
    const tr = rows.map((p) =>
      `<tr><td>${esc(p.label)}</td><td class="num">${value(p)}</td><td class="num">${esc(formatRange(p))}</td>` +
      `<td>${esc(CERTAINTY_LABEL[p.certainty])}</td><td class="method">${esc(p.method)}</td>` +
      `<td class="loc">${esc(p.locator ?? '')}</td></tr>`).join('\n');
    return `<div class="tablewrap"><table class="params reg"><thead><tr><th>Parametr</th><th>Wartość</th><th>Zakres w literaturze</th>` +
      `<th>Pewność</th><th>Metoda</th><th>Miejsce w źródle</th></tr></thead><tbody>\n${tr}\n</tbody></table></div>`;
  };
  const bib = (): string => {
    const items = order.map((id, k) => {
      const s = sources.get(id)!;
      const parts = [`${esc(s.authors)} (${s.year}). ${esc(s.title)}.`];
      if (s.container) parts.push(` <i>${esc(s.container)}</i>${s.volume ? ` ${esc(s.volume)}` : ''}${s.pages ? `, ${esc(s.pages)}` : ''}.`);
      if (s.doi) parts.push(` <a href="https://doi.org/${esc(s.doi)}">doi:${esc(s.doi)}</a>`);
      else if (s.url) parts.push(` <a href="${esc(s.url)}">${esc(s.url)}</a>`);
      return `<li id="ref-${k + 1}">${parts.join('')}</li>`;
    });
    return `<ol class="bib">\n${items.join('\n')}\n</ol>`;
  };

  const chrono = (maxT: number): string => {
    const ev = reg.parameters.filter((p) => p.time && Number.isFinite(p.time.t) && p.time.t <= maxT).sort((a, b) => a.time!.t - b.time!.t);
    const tr = ev.map((p) => {
      const rg = p.time!.range ? `${fmtT(p.time!.range[0])} … ${fmtT(p.time!.range[1])}` : '';
      return `<tr><td class="num nowrap">${fmtT(p.time!.t)}</td><td>${esc(p.label)}</td><td class="num">${value(p)}</td><td class="nowrap small">${esc(rg)}</td></tr>`;
    }).join('\n');
    return `<table class="params chrono"><thead><tr><th>Czas</th><th>Zdarzenie / wielkość</th><th>Wartość</th><th>Zakres czasu</th></tr></thead><tbody>\n${tr}\n</tbody></table>`;
  };
  const sitesTable = (): string => {
    if (sites.length === 0) { issues.push('sites table requested but no sites given'); return ''; }
    const lat0 = params.get('site.lat')?.value, lon0 = params.get('site.lon')?.value;
    const tr = sites.map((st) => {
      const dist = typeof lat0 === 'number' && typeof lon0 === 'number' ? `${formatNumber(gcDistanceKm({ lat: lat0, lon: lon0 }, st), 2)} km` : '—';
      const paleo = st.paleoLat !== undefined && st.paleoLon !== undefined ? `${formatNumber(st.paleoLat, 3)}°, ${formatNumber(st.paleoLon, 3)}°` : 'oczekuje na rekonstrukcję';
      const obs = st.observations.map((o) => `<li>${esc(o.text)} <span class="mark ${o.certainty}" title="${esc(CERTAINTY_LABEL[o.certainty] ?? '')}">${CERTAINTY_MARK[o.certainty] ?? ''}</span>${cite(o.sources)}</li>`).join('');
      return `<tr><td><b>${esc(st.name)}</b><br><span class="small">${formatNumber(st.lat, 4)}°, ${formatNumber(st.lon, 4)}°${st.coordSource ? cite([st.coordSource]) : ''}<br>dziś ${dist} od krateru<br>paleo: ${paleo}</span></td><td><ul class="obs">${obs}</ul></td></tr>`;
    }).join('\n');
    return `<table class="params sites"><thead><tr><th>Stanowisko</th><th>Obserwacje w zapisie geologicznym</th></tr></thead><tbody>\n${tr}\n</tbody></table>`;
  };

  let html = template.replace(/\{\{(p|v|r|cite|table|fig|chrono|sites):([^}]+)\}\}/g, (_m, kind: string, rawArg: string) => {
    const arg = rawArg.trim();
    if (kind === 'chrono') return chrono(Number(arg));
    if (kind === 'sites') return sitesTable();
    if (kind === 'fig') {
      const f = figs[arg];
      if (!f) { issues.push(`unknown figure "${arg}"`); return ''; }
      const svg = f();
      if (/NaN|Infinity/.test(svg)) issues.push(`figure "${arg}" contains NaN/Infinity`);
      return svg;
    }
    if (kind === 'cite') return cite(arg.split(',').map((x) => x.trim()));
    if (kind === 'table') return table(arg);
    const p = params.get(arg);
    if (!p) { issues.push(`unknown parameter "${arg}"`); return `<mark class="err">${esc(arg)}</mark>`; }
    if (kind === 'v') return `<span class="pv ${p.certainty}" title="${esc(CERTAINTY_LABEL[p.certainty])}">${esc(formatParam(p))} <span class="mark">${CERTAINTY_MARK[p.certainty]}</span></span>`;
    return kind === 'p' ? value(p) : esc(formatRange(p));
  });
  html = html.replace('{{bib}}', bib());
  return { html, issues };
}
