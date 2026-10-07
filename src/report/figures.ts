/**
 * Rysunki raportu generowane z rejestru (SVG inline). Każda liczba na rysunku pochodzi z rejestru
 * albo z modułu EIEP liczonego z wejść rejestru — rysunek nie może rozjechać się z tabelami.
 * Kolory zjawisk: klasy CSS .ph-* (definiowane w szablonie), SVG używa currentColor.
 */
import type { Certainty, Parameter, Registry } from '../model/registry/types';
import { CERTAINTY_LABEL, formatDuration, formatNumber, formatParam } from '../model/registry/format';
import * as eiep from '../model/eiep';
import { R_KM } from '../model/sim/geo';
import { interpKnots } from '../model/sim/interp';
import { esc } from './html';

export interface FigureContext {
  reg: Registry;
  ak135?: { firstArrival_s: { P: Array<number | null>; S: Array<number | null> } };
}

const r1 = (x: number) => Math.round(x * 10) / 10;

/** Tory raportu (grupy rejestru) — pożary łączone z termiką, inaczej niż osobna warstwa w aplikacji. */
const REPORT_LANES: Array<{ key: string; label: string; groups: string[] }> = [
  { key: 'crater', label: 'Krater i skorupa', groups: ['crater', 'crust'] },
  { key: 'thermal', label: 'Kula ognia, termika, pożary', groups: ['fireball', 'thermal', 'fires', 'temperature'] },
  { key: 'ejecta', label: 'Ejecta', groups: ['ejecta'] },
  { key: 'seismic', label: 'Sejsmika', groups: ['seismic'] },
  { key: 'air', label: 'Fala ciśnienia i dźwięk', groups: ['airblast', 'sound'] },
  { key: 'tsunami', label: 'Tsunami', groups: ['tsunami'] },
  { key: 'atmo', label: 'Atmosfera', groups: ['atmosphere'] },
  { key: 'bio', label: 'Biosfera', groups: ['biosphere'] },
];
export const GROUP_LABEL: Record<string, string> = {
  airblast: 'fala ciśnienia', atmosphere: 'atmosfera', biosphere: 'biosfera', crater: 'krater', crust: 'skorupa',
  ejecta: 'ejecta', energy: 'energia', event: 'zdarzenie', fireball: 'kula ognia', fires: 'pożary', impactor: 'impaktor',
  paleo: 'paleogeografia', seismic: 'sejsmika', site: 'miejsce', sound: 'dźwięk', target: 'cel', temperature: 'temperatura',
  thermal: 'termika', tsunami: 'tsunami',
};
const phenomenonOf = (group: string) => REPORT_LANES.find((p) => p.groups.includes(group))?.key ?? 'meta';

const logScale = (v: number, d0: number, d1: number, p0: number, p1: number) =>
  p0 + ((Math.log10(v) - Math.log10(d0)) / (Math.log10(d1) - Math.log10(d0))) * (p1 - p0);
const linScale = (v: number, d0: number, d1: number, p0: number, p1: number) => p0 + ((v - d0) / (d1 - d0)) * (p1 - p0);

function num(reg: Registry, id: string): number | undefined {
  const v = reg.parameters.find((p) => p.id === id)?.value;
  return typeof v === 'number' ? v : undefined;
}
function param(reg: Registry, id: string): Parameter | undefined {
  return reg.parameters.find((p) => p.id === id);
}

/** Znacznik zależny od pewności: fakt ●, ekstrapolacja ◐ (półprzezroczyste), spekulacja ○, sporne ◇. */
function marker(c: Certainty, x: number, y: number, title: string): string {
  const t = `<title>${esc(title)}</title>`;
  switch (c) {
    case 'fact': return `<circle cx="${r1(x)}" cy="${r1(y)}" r="4.5" fill="currentColor">${t}</circle>`;
    case 'extrapolation': return `<circle cx="${r1(x)}" cy="${r1(y)}" r="4.5" fill="currentColor" fill-opacity="0.45" stroke="currentColor" stroke-width="1.2">${t}</circle>`;
    case 'speculation': return `<circle cx="${r1(x)}" cy="${r1(y)}" r="4" fill="none" stroke="currentColor" stroke-width="1.6" stroke-dasharray="2 2">${t}</circle>`;
    case 'predictive': return `<path d="M${r1(x)} ${r1(y - 5.5)} L${r1(x + 5)} ${r1(y + 4)} L${r1(x - 5)} ${r1(y + 4)} Z" fill="none" stroke="currentColor" stroke-width="1.6">${t}</path>`;
    default: return `<path d="M${r1(x)} ${r1(y - 5.5)} L${r1(x + 5.5)} ${r1(y)} L${r1(x)} ${r1(y + 5.5)} L${r1(x - 5.5)} ${r1(y)} Z" fill="none" stroke="currentColor" stroke-width="1.6">${t}</path>`;
  }
}

function certaintyLegend(x: number, y: number): string {
  const items: Certainty[] = ['fact', 'extrapolation', 'speculation', 'contested'];
  return `<g class="ink">${items.map((c, i) => `<g transform="translate(${x + i * 120},${y})">${marker(c, 0, -4, CERTAINTY_LABEL[c])}<text x="10" y="0" class="fig-small">${CERTAINTY_LABEL[c]}</text></g>`).join('')}</g>`;
}

/** Rys.: zdarzenia pierwszej doby na logarytmicznej osi czasu, w pasach zjawisk. */
export function timelineFigure(ctx: FigureContext): string {
  const W = 760, L = 170, R = 20, laneH = 30, top = 10;
  const t0 = 1, t1 = 86400;
  const lanes = REPORT_LANES;
  const H = top + lanes.length * laneH + 60;
  const x = (t: number) => logScale(Math.min(Math.max(t, t0), t1), t0, t1, L, W - R);
  const ticks: Array<[number, string]> = [[1, '1 s'], [10, '10 s'], [60, '1 min'], [600, '10 min'], [3600, '1 h'], [21600, '6 h'], [86400, '24 h']];
  const parts: string[] = [];
  parts.push(`<svg viewBox="0 0 ${W} ${H}" class="fig" role="img" aria-label="Oś czasu zdarzeń pierwszej doby">`);
  for (const [t, lab] of ticks) {
    parts.push(`<line x1="${r1(x(t))}" x2="${r1(x(t))}" y1="${top}" y2="${top + lanes.length * laneH}" class="grid"/>`);
    parts.push(`<text x="${r1(x(t))}" y="${top + lanes.length * laneH + 16}" text-anchor="middle" class="fig-small">${lab}</text>`);
  }
  lanes.forEach((lane, li) => {
    const yc = top + li * laneH + laneH / 2;
    parts.push(`<text x="${L - 10}" y="${yc + 4}" text-anchor="end" class="fig-label">${esc(lane.label)}</text>`);
    parts.push(`<line x1="${L}" x2="${W - R}" y1="${yc}" y2="${yc}" class="lane"/>`);
    const evs = ctx.reg.parameters
      .filter((p) => p.time && p.time.t > 0 && p.time.t <= t1 && phenomenonOf(p.group) === lane.key)
      .sort((a, b) => a.time!.t - b.time!.t);
    evs.forEach((p, i) => {
      const y = yc + [-7, 0, 7][i % 3]!;
      const tt = p.time!.t;
      const g: string[] = [];
      if (p.time!.range) {
        const [a, b] = p.time!.range;
        g.push(`<line x1="${r1(x(Math.max(a, t0)))}" x2="${r1(x(Math.min(b, t1)))}" y1="${r1(y)}" y2="${r1(y)}" stroke="currentColor" stroke-width="1.5" stroke-opacity="0.55"/>`);
      }
      g.push(marker(p.certainty, x(tt), y, `${p.label} — T+${formatDuration(tt)} (${CERTAINTY_LABEL[p.certainty]})`));
      parts.push(`<g class="ph-${lane.key}">${g.join('')}</g>`);
    });
  });
  parts.push(certaintyLegend(L, H - 12));
  parts.push('</svg>');
  return parts.join('\n');
}

/** Rys.: czasy dotarcia zjawisk w funkcji odległości (krzywe liczone + model tsunami + obserwacje z Tanis). */
export function travelTimeFigure(ctx: FigureContext): string {
  const W = 760, H = 430, L = 70, R = 20, T = 15, B = 75;
  const d0 = 0, d1 = 20015, tmin = 10, tmax = 86400;
  const x = (d: number) => linScale(d, d0, d1, L, W - R);
  const y = (t: number) => logScale(Math.min(Math.max(t, tmin), tmax), tmin, tmax, H - B, T);
  const path = (pts: Array<[number, number]>) => pts.map(([d, t], i) => `${i ? 'L' : 'M'}${r1(x(d))} ${r1(y(t))}`).join(' ');
  const parts: string[] = [`<svg viewBox="0 0 ${W} ${H}" class="fig" role="img" aria-label="Czasy dotarcia zjawisk w funkcji odległości">`];
  for (const [t, lab] of [[10, '10 s'], [60, '1 min'], [600, '10 min'], [3600, '1 h'], [21600, '6 h'], [86400, '24 h']] as Array<[number, string]>) {
    parts.push(`<line x1="${L}" x2="${W - R}" y1="${r1(y(t))}" y2="${r1(y(t))}" class="grid"/><text x="${L - 6}" y="${r1(y(t)) + 4}" text-anchor="end" class="fig-small">${lab}</text>`);
  }
  for (let d = 0; d <= 20000; d += 2500) {
    parts.push(`<line x1="${r1(x(d))}" x2="${r1(x(d))}" y1="${T}" y2="${H - B}" class="grid"/><text x="${r1(x(d))}" y="${H - B + 15}" text-anchor="middle" class="fig-small">${d === 0 ? '0' : formatNumber(d)}</text>`);
  }
  parts.push(`<text x="${(L + W - R) / 2}" y="${H - B + 32}" text-anchor="middle" class="fig-small">odległość od krateru po powierzchni Ziemi [km] (antypody ≈ 20 000 km)</text>`);
  const curves: Array<{ cls: string; label: string; pts: Array<[number, number]>; dash?: string }> = [];
  if (ctx.ak135) {
    const toPts = (arr: Array<number | null>) => arr.flatMap((t, deg) => (t && deg > 0 ? [[(deg * Math.PI * R_KM) / 180, t] as [number, number]] : []));
    curves.push({ cls: 'ph-seismic', label: 'fala P (ak135)', pts: toPts(ctx.ak135.firstArrival_s.P) });
    curves.push({ cls: 'ph-seismic', label: 'fala S / SKS (ak135)', pts: toPts(ctx.ak135.firstArrival_s.S), dash: '6 3' });
  }
  const UR = num(ctx.reg, 'seismic.rayleigh_group_velocity');
  if (UR) curves.push({ cls: 'ph-seismic', label: `fala Rayleigha R1 (${formatNumber(UR)} km/s)`, pts: [[100, 100 / UR], [20015, 20015 / UR]], dash: '2 3' });
  const cL = num(ctx.reg, 'airblast.lamb_speed');
  if (cL) curves.push({ cls: 'ph-air', label: `fala Lamba (${formatNumber(cL)} m/s)`, pts: [[50, 50e3 / cL], [20015, 20015e3 / cL]] });
  const ej: Array<[number, number]> = [];
  for (let d = 100; d <= 10000; d += 100) ej.push([d, eiep.ejectaArrivalTime(d * 1e3)]);
  curves.push({ cls: 'ph-ejecta', label: 'ejecta balistyczne (EIEP, 45°)', pts: ej });
  const ts: Array<[number, number]> = [];
  for (const [rid, tid] of [['tsunami.rim_wave_radius_600s', 600], ['tsunami.front_radius_1h', 3600], ['tsunami.front_radius_4h_east', 14400]] as Array<[string, number]>) {
    const v = num(ctx.reg, rid);
    if (v) ts.push([v, tid]);
  }
  if (ts.length) curves.push({ cls: 'ph-tsunami', label: 'front tsunami (model Range i in. 2022)', pts: ts });
  for (const c of curves) {
    parts.push(`<path d="${path(c.pts)}" fill="none" stroke="currentColor" stroke-width="2" class="${c.cls}"${c.dash ? ` stroke-dasharray="${c.dash}"` : ''}><title>${esc(c.label)}</title></path>`);
    if (c.cls === 'ph-tsunami') for (const [d, t] of c.pts) parts.push(`<g class="ph-tsunami">${marker('extrapolation', x(d), y(t), `${c.label}: ${formatNumber(d)} km po ${formatDuration(t)}`)}</g>`);
  }
  // obserwacje / modele lokalne w Tanis (DePalma i in. 2019)
  const dT = num(ctx.reg, 'seismic.tanis_distance');
  if (dT) {
    const obs: Array<[string, string]> = [['seismic.p_arrival_tanis', 'ph-seismic'], ['seismic.s_arrival_tanis', 'ph-seismic'], ['seismic.rayleigh_arrival_tanis', 'ph-seismic'], ['biosphere.tanis_spherule_arrival', 'ph-ejecta'], ['biosphere.tanis_shocked_quartz_arrival', 'ph-ejecta']];
    for (const [id, cls] of obs) {
      const p = param(ctx.reg, id);
      const t = p?.time?.t;
      if (p && t) parts.push(`<g class="${cls}"><rect x="${r1(x(dT) - 4)}" y="${r1(y(t) - 4)}" width="8" height="8" fill="none" stroke="currentColor" stroke-width="1.8"><title>${esc(`${p.label}: ${formatDuration(t)} (DePalma i in. 2019)`)}</title></rect></g>`);
    }
    parts.push(`<text x="${r1(x(dT) + 8)}" y="${r1(y(300))}" class="fig-small ink">□ Tanis (DePalma i in. 2019)</text>`);
  }
  // legenda
  curves.forEach((c, i) => {
    const lx = L + (i % 3) * 230, ly = H - 22 + Math.floor(i / 3) * 14 - 8;
    parts.push(`<g class="${c.cls}"><line x1="${lx}" x2="${lx + 22}" y1="${ly - 4}" y2="${ly - 4}" stroke="currentColor" stroke-width="2"${c.dash ? ` stroke-dasharray="${c.dash}"` : ''}/></g><text x="${lx + 28}" y="${ly}" class="fig-small">${esc(c.label)}</text>`);
  });
  parts.push('</svg>');
  return parts.join('\n');
}

/** Rys.: grubość ejecta i nadciśnienie w funkcji odległości — EIEP (linia) vs pomiary (prostokąty). */
export function distanceEffectsFigure(ctx: FigureContext): string {
  const W = 760, H = 330, PW = 340, T = 20, B = 50;
  const DtcKm = num(ctx.reg, 'crater.transient_diameter') ?? 100;
  const E = num(ctx.reg, 'energy.kinetic');
  const parts: string[] = [`<svg viewBox="0 0 ${W} ${H}" class="fig" role="img" aria-label="Skutki w funkcji odległości">`];
  const panel = (ox: number, title: string, yd: [number, number], ylab: string, body: (x: (d: number) => number, y: (v: number) => number) => string) => {
    const L = ox + 55, Rr = ox + PW;
    const x = (d: number) => logScale(d, 200, 20000, L, Rr);
    const y = (v: number) => logScale(Math.min(Math.max(v, yd[0]), yd[1]), yd[0], yd[1], H - B, T + 10);
    const g: string[] = [`<text x="${L}" y="${T}" class="fig-label">${esc(title)}</text>`];
    for (const d of [200, 500, 1000, 2000, 5000, 10000, 20000]) g.push(`<line x1="${r1(x(d))}" x2="${r1(x(d))}" y1="${T + 10}" y2="${H - B}" class="grid"/><text x="${r1(x(d))}" y="${H - B + 14}" text-anchor="middle" class="fig-small">${formatNumber(d)}</text>`);
    for (let e = Math.ceil(Math.log10(yd[0])); e <= Math.floor(Math.log10(yd[1])); e++) {
      const v = 10 ** e;
      g.push(`<line x1="${L}" x2="${Rr}" y1="${r1(y(v))}" y2="${r1(y(v))}" class="grid"/><text x="${L - 5}" y="${r1(y(v)) + 4}" text-anchor="end" class="fig-small">${formatNumber(v)}</text>`);
    }
    g.push(`<text x="${(L + Rr) / 2}" y="${H - B + 30}" text-anchor="middle" class="fig-small">odległość [km]</text>`);
    g.push(`<text x="${ox + 8}" y="${T + 4}" class="fig-small">${esc(ylab)}</text>`);
    g.push(body(x, y));
    return g.join('\n');
  };
  // panel A: grubość ejecta
  parts.push(panel(0, 'Grubość warstwy ejecta', [1e-4, 300], '[m]', (x, y) => {
    const g: string[] = [];
    const pts: string[] = [];
    for (let d = 200; d <= 10000; d *= 1.1) pts.push(`${pts.length ? 'L' : 'M'}${r1(x(d))} ${r1(y(eiep.ejectaThickness(DtcKm * 1e3, d * 1e3)))}`);
    g.push(`<path d="${pts.join(' ')}" fill="none" stroke="currentColor" stroke-width="2" class="ph-ejecta"><title>EIEP eq. 47, D_tc = ${formatNumber(DtcKm)} km</title></path>`);
    const boxes: Array<[string, number, number, number]> = [
      ['ejecta.thickness_300_400km', 300, 400, 1], ['ejecta.thickness_500_1000km', 500, 1000, 1],
      ['ejecta.thickness_2000_4000km', 2000, 4000, 0.01], ['ejecta.distal_layer_thickness', 6000, 20000, 0.001],
    ];
    for (const [id, a, b, toM] of boxes) {
      const p = param(ctx.reg, id);
      if (!p || typeof p.value !== 'number') continue;
      const [lo, hi] = p.range ?? [p.value, p.value];
      const ya = y(hi * toM), yb = y(lo * toM);
      g.push(`<g class="ink"><rect x="${r1(x(a))}" y="${r1(ya - (ya === yb ? 3 : 0))}" width="${r1(x(b) - x(a))}" height="${r1(Math.max(yb - ya, 6))}" fill="currentColor" fill-opacity="0.18" stroke="currentColor" stroke-width="1.2"><title>${esc(`${p.label}: ${formatParam(p)} (pomiar)`)}</title></rect></g>`);
    }
    g.push(`<g class="ph-ejecta"><line x1="${235}" x2="${255}" y1="${H - 12}" y2="${H - 12}" stroke="currentColor" stroke-width="2"/></g><text x="${260}" y="${H - 8}" class="fig-small">EIEP</text><rect x="${290}" y="${H - 17}" width="14" height="9" class="ink" fill="currentColor" fill-opacity="0.18" stroke="currentColor"/><text x="${308}" y="${H - 8}" class="fig-small">pomiar</text>`);
    return g.join('\n');
  }));
  // panel B: nadciśnienie
  parts.push(panel(400, 'Nadciśnienie fali uderzeniowej', [1e2, 1e8], '[Pa]', (x, y) => {
    if (!E) return '';
    const g: string[] = [];
    const up: string[] = [], lo: string[] = [];
    for (let d = 200; d <= 10000; d *= 1.1) {
      const p = eiep.airblastOverpressure(E, d * 1e3);
      up.push(`${up.length ? 'L' : 'M'}${r1(x(d))} ${r1(y(p))}`);
      lo.unshift(`L${r1(x(d))} ${r1(y(p / 5))}`);
    }
    g.push(`<path d="${up.join(' ')} ${lo.join(' ')} Z" class="ph-air" fill="currentColor" fill-opacity="0.15" stroke="none"><title>Zakres: wynik EIEP ÷ 5 … wynik EIEP (model zawyża 2–5× powyżej 10⁴ Mt)</title></path>`);
    g.push(`<path d="${up.join(' ')}" fill="none" stroke="currentColor" stroke-width="2" class="ph-air"><title>EIEP eq. 54</title></path>`);
    g.push(`<line x1="${r1(x(200))}" x2="${r1(x(20000))}" y1="${r1(y(101325))}" y2="${r1(y(101325))}" class="ink" stroke="currentColor" stroke-dasharray="4 3"/><text x="${r1(x(5000))}" y="${r1(y(101325)) - 5}" class="fig-small">1 atm</text>`);
    const hunga = param(ctx.reg, 'airblast.lamb_amplitude_hunga_756km');
    if (hunga && typeof hunga.value === 'number') g.push(`<g class="ink"><rect x="${r1(x(756) - 4)}" y="${r1(y(hunga.value) - 4)}" width="8" height="8" fill="none" stroke="currentColor" stroke-width="1.6"><title>${esc(`${hunga.label}: ${formatParam(hunga)} — inne zdarzenie, tylko dla skali`)}</title></rect></g><text x="${r1(x(756) + 7)}" y="${r1(y(hunga.value)) + 4}" class="fig-small">Hunga Tonga 2022 (skala)</text>`);
    return g.join('\n');
  }));
  parts.push('</svg>');
  return parts.join('\n');
}

type Prof = Array<[number, number]>; // [r km, z km] dla r ≥ 0, symetrycznie
const interp = (p: Prof, r: number) => interpKnots(Math.abs(r), p);

/** Rys.: schematyczne przekroje krateru w klatkach kluczowych (geometria odczytana z rysunków iSALE, ±2 km). */
export function craterSectionsFigure(ctx: FigureContext): string {
  const g = (id: string, d: number) => num(ctx.reg, id) ?? d;
  const sed = g('target.sediment_thickness', 3), moho = -g('target.crust_thickness', 33);
  const dtc = g('crater.transient_depth', 28), Dt = g('crater.transient_diameter', 100) / 2;
  const up = g('crater.central_uplift_max_height', 15), Rf = g('crater.final_diameter', 200) / 2;
  const Rpr = g('crater.peak_ring_diameter', 85) / 2, hpr = g('crater.peak_ring_height', 400) / 1000;
  const floor = -g('crater.floor_depth', 800) / 1000, Lkm = g('impactor.diameter', 13);
  const tT = g('crater.t_transient_max', 30), tU = g('crater.t_uplift_max', 180), tP = g('crater.t_peak_ring', 300), tF = g('crater.t_final', 600);
  interface Frame { t: string; surf: Prof; mohoP: Prof; sedP: Prof; curtain?: number; melt?: Prof; zr: [number, number]; ex: number; water?: boolean; imp?: boolean }
  const frames: Frame[] = [
    { t: 'T = 0 s — kontakt', surf: [[0, 0], [120, 0]], mohoP: [[0, moho], [120, moho]], sedP: [[0, sed], [120, sed]], imp: true, zr: [-40, 25], ex: 1 },
    { t: 'T ≈ 20 s — wzrost wnęki', surf: [[0, -dtc], [12, -dtc * 0.77], [20, -dtc * 0.36], [25, 0], [32, 1], [60, 0], [120, 0]], mohoP: [[0, moho - 4], [30, moho - 1], [60, moho], [120, moho]], sedP: [[0, 0], [25, 0], [28, sed], [120, sed]], curtain: 25, zr: [-40, 25], ex: 1 },
    { t: `T ≈ ${formatNumber(tT)}–60 s — krater przejściowy`, surf: [[0, -dtc + 3], [Dt * 0.5, -(dtc - 3) * 0.75], [Dt * 0.85, -(dtc - 3) * 0.3], [Dt, 0], [Dt + 8, 1.5], [90, 0], [120, 0]], mohoP: [[0, moho - 3], [40, moho - 1], [70, moho], [120, moho]], sedP: [[0, 0], [Dt, 0], [Dt + 4, sed], [120, sed]], curtain: Dt, melt: [[0, 0.8], [Dt * 0.9, 0.8], [Dt, 0]], zr: [-40, 25], ex: 1 },
    { t: `T ≈ ${formatNumber(tU)} s — maksimum wypiętrzenia`, surf: [[0, up], [12, up * 0.66], [20, 0], [35, -7], [50, 0], [65, 2], [90, 0], [120, 0]], mohoP: [[0, moho + 3], [40, moho - 1], [60, moho], [120, moho]], sedP: [[0, 0], [30, 0], [40, 2], [55, sed], [120, sed]], zr: [-40, 25], ex: 1 },
    { t: `T ≈ ${formatNumber(tP)}–340 s — pierścień szczytowy`, surf: [[0, -2.5], [25, -2.5], [Rpr - 3, -1.2], [Rpr, -1], [Rpr + 6, -2], [65, 1], [Rf, 0], [120, 0]], mohoP: [[0, moho + 1.5], [40, moho], [120, moho]], sedP: [[0, 0], [Rpr, 0], [Rpr + 10, sed * 0.6], [70, sed], [120, sed]], melt: [[0, 2.5], [Rpr - 8, 2], [Rpr - 4, 0]], zr: [-40, 25], ex: 1 },
    { t: `T ≈ ${formatNumber(tF / 60)} min — krater końcowy, zalany (przewyższenie ×10)`, surf: [[0, floor], [Rpr - 6, floor], [Rpr, floor + hpr], [Rpr + 5, floor - 0.1], [Rpr + 12, floor - 0.1], [70, floor * 0.6], [Rf - 5, -0.1], [Rf, 0], [120, 0]], mohoP: [[0, -40], [120, -40]], sedP: [[0, 0], [Rpr + 8, 0], [Rf, sed], [120, sed]], melt: [[0, 2.6], [15, 2.4], [25, 1.6], [Rpr - 10, 0.6], [Rpr - 6, 0]], water: true, zr: [-3.5, 1], ex: 10 },
  ];
  const PW = 370, PH = 130, cols = 2, gapX = 20, gapY = 24, top = 4;
  const W = cols * PW + gapX, H = top + Math.ceil(frames.length / cols) * (PH + gapY) + 24;
  const parts: string[] = [`<svg viewBox="0 0 ${W} ${H}" class="fig" role="img" aria-label="Przekroje krateru w klatkach kluczowych">`];
  frames.forEach((f, i) => {
    const ox = (i % cols) * (PW + gapX), oy = top + Math.floor(i / cols) * (PH + gapY) + 14;
    const sx = PW / 240; // km → px (r ∈ [−120, 120])
    const sz = (PH - 4) / (f.zr[1] - f.zr[0]);
    const X = (r: number) => ox + (r + 120) * sx;
    const Z = (z: number) => oy + (f.zr[1] - Math.min(Math.max(z, f.zr[0]), f.zr[1])) * sz;
    const rs: number[] = [];
    for (let r = -120; r <= 120; r += 1) rs.push(r);
    const line = (fz: (r: number) => number) => rs.map((r) => `${r1(X(r))},${r1(Z(fz(r)))}`);
    const surf = (r: number) => interp(f.surf, r);
    const sedBase = (r: number) => surf(r) - interp(f.sedP, r);
    const mohoZ = (r: number) => Math.min(interp(f.mohoP, r), sedBase(r));
    const bottom = `${r1(X(120))},${r1(Z(f.zr[0]))} ${r1(X(-120))},${r1(Z(f.zr[0]))}`;
    parts.push(`<clipPath id="cp${i}"><rect x="${ox}" y="${oy}" width="${PW}" height="${PH - 4}"/></clipPath><g clip-path="url(#cp${i})">`);
    if (f.water) parts.push(`<polygon class="x-water" points="${line(() => 0).join(' ')} ${line(surf).reverse().join(' ')}"/>`);
    parts.push(`<polygon class="x-sed" points="${line(surf).join(' ')} ${bottom}"/>`);
    parts.push(`<polygon class="x-crust" points="${line(sedBase).join(' ')} ${bottom}"/>`);
    parts.push(`<polygon class="x-mantle" points="${line(mohoZ).join(' ')} ${bottom}"/>`);
    if (f.melt) parts.push(`<polygon class="x-melt" points="${line(surf).filter((_, k) => Math.abs(rs[k]!) <= f.melt![f.melt!.length - 1]![0]).join(' ')} ${line((r) => surf(r) - interp(f.melt!, r)).filter((_, k) => Math.abs(rs[k]!) <= f.melt![f.melt!.length - 1]![0]).reverse().join(' ')}"/>`);
    if (f.curtain) for (const s of [-1, 1]) parts.push(`<line x1="${r1(X(s * f.curtain))}" y1="${r1(Z(0))}" x2="${r1(X(s * (f.curtain + 8)))}" y2="${r1(Z(22))}" class="ph-ejecta" stroke="currentColor" stroke-width="3" stroke-linecap="round"/>`);
    if (f.imp) parts.push(`<circle cx="${r1(X(0))}" cy="${r1(Z(Lkm / 2))}" r="${r1((Lkm / 2) * sx)}" class="x-imp"/>`);
    parts.push('</g>');
    parts.push(`<rect x="${ox}" y="${oy}" width="${PW}" height="${PH - 4}" fill="none" class="frame"/>`);
    parts.push(`<text x="${ox}" y="${oy - 4}" class="fig-small ink">${esc(f.t)}</text>`);
    if (i === frames.length - 1) parts.push(`<text x="${r1(X(-Rf))}" y="${r1(Z(0)) - 3}" text-anchor="middle" class="fig-small ink">krawędź</text><text x="${r1(X(Rpr))}" y="${r1(Z(floor + hpr)) - 4}" text-anchor="middle" class="fig-small ink">pierścień</text>`);
  });
  const ly = H - 8;
  const leg: Array<[string, string]> = [['x-water', 'woda'], ['x-sed', 'osady (węglany, ewaporaty)'], ['x-crust', 'skorupa krystaliczna'], ['x-mantle', 'płaszcz'], ['x-melt', 'stop impaktowy']];
  const legX = [0, 70, 270, 420, 510];
  leg.forEach(([c, l], k) => parts.push(`<rect x="${legX[k]}" y="${ly - 9}" width="12" height="10" class="${c}"/><text x="${legX[k]! + 16}" y="${ly}" class="fig-small">${l}</text>`));
  parts.push('</svg>');
  return parts.join('\n');
}

/** Rys.: szczytowy strumień podczerwieni przy gruncie — pas = zakres z pracy, znacznik = wartość (jeśli podana). */
export function thermalModelsFigure(ctx: FigureContext): string {
  const rows: Array<[string, string]> = [
    ['thermal.ir_flux_global_melosh', 'Melosh i in. 1990 — globalnie, godziny'],
    ['thermal.ir_flux_peak_goldin', 'Goldin & Melosh 2009 — z samoekranowaniem'],
    ['thermal.ir_flux_peak_proximal_downrange', 'Morgan i in. 2013 — z biegiem, 2000–2500 km'],
    ['thermal.ir_flux_peak_intermediate_downrange', 'Morgan i in. 2013 — z biegiem, 4000–5000 km'],
    ['thermal.ir_flux_peak_distal_downrange', 'Morgan i in. 2013 — z biegiem, 7000–8000 km'],
    ['thermal.ir_flux_uprange_far', 'Morgan i in. 2013 — pod bieg, ponad 3000 km'],
    ['thermal.na_ground_flux_upper_bound', 'Belcher i in. — górna granica z zapisu węgla'],
  ];
  const W = 760, L = 300, R = 30, rowH = 26, T = 44;
  const present = rows.filter(([id]) => { const p = param(ctx.reg, id); return p && (typeof p.value === 'number' || p.range); });
  const H = T + present.length * rowH + 84;
  const x = (v: number) => linScale(Math.min(v, 60), 0, 60, L, W - R);
  const parts: string[] = [`<svg viewBox="0 0 ${W} ${H}" class="fig" role="img" aria-label="Modele impulsu cieplnego">`];
  for (let v = 0; v <= 60; v += 10) parts.push(`<line x1="${r1(x(v))}" x2="${r1(x(v))}" y1="${T - 6}" y2="${T + present.length * rowH}" class="grid"/><text x="${r1(x(v))}" y="${T + present.length * rowH + 15}" text-anchor="middle" class="fig-small">${v}</text>`);
  parts.push(`<text x="${(L + W - R) / 2}" y="${T + present.length * rowH + 32}" text-anchor="middle" class="fig-small">szczytowy strumień promieniowania przy gruncie [kW/m²]</text>`);
  present.forEach(([id, lab], i) => {
    const p = param(ctx.reg, id)!;
    const yc = T + i * rowH + rowH / 2;
    const tip = `${p.label}: ${p.range ? `${formatNumber(p.range[0])}–${formatNumber(p.range[1])} ${p.unit}` : formatParam(p)} (${CERTAINTY_LABEL[p.certainty]})`;
    parts.push(`<text x="${L - 8}" y="${yc + 4}" text-anchor="end" class="fig-small">${esc(lab)}</text>`);
    const g: string[] = [];
    if (p.range) g.push(`<rect x="${r1(x(p.range[0]))}" y="${yc - 7}" width="${r1(Math.max(x(p.range[1]) - x(p.range[0]), 3))}" height="14" rx="3" fill="currentColor" fill-opacity="0.35"><title>${esc(tip)}</title></rect>`);
    if (typeof p.value === 'number') g.push(marker(p.certainty, x(p.value), yc, tip));
    parts.push(`<g class="ph-thermal">${g.join('')}</g>`);
  });
  const thr: Array<[string, string, number]> = [['thermal.ignition_litter', 'zapłon ściółki', T - 26], ['thermal.ignition_wood_spontaneous', 'samozapłon drewna', T - 12]];
  for (const [id, lab, ty] of thr) {
    const v = num(ctx.reg, id);
    if (v) parts.push(`<line x1="${r1(x(v))}" x2="${r1(x(v))}" y1="${ty + 3}" y2="${T + present.length * rowH}" class="ink" stroke="currentColor" stroke-dasharray="5 3" stroke-width="1.4"/><text x="${r1(x(v)) - 4}" y="${ty}" text-anchor="end" class="fig-small">${lab} (${formatNumber(v)})</text>`);
  }
  parts.push(`<g class="ph-thermal"><rect x="40" y="${H - 38}" width="22" height="10" rx="3" fill="currentColor" fill-opacity="0.35"/></g><text x="68" y="${H - 29}" class="fig-small">zakres podany w pracy</text>`);
  parts.push(certaintyLegend(46, H - 8));
  parts.push('</svg>');
  return parts.join('\n');
}

/** Rys.: struktura pewności rejestru — liczba parametrów z literatury wg grupy i poziomu pewności. */
export function certaintyFigure(ctx: FigureContext): string {
  const lit = ctx.reg.parameters.filter((p) => !p.method.startsWith('derived:'));
  const groups = [...new Set(lit.map((p) => p.group))].sort();
  const order: Certainty[] = ['fact', 'extrapolation', 'speculation', 'contested'];
  const max = Math.max(...groups.map((g) => lit.filter((p) => p.group === g).length));
  const W = 760, L = 130, R = 60, rowH = 20, T = 10;
  const H = T + groups.length * rowH + 40;
  const x = (v: number) => (v / max) * (W - L - R);
  const parts: string[] = [`<svg viewBox="0 0 ${W} ${H}" class="fig" role="img" aria-label="Struktura pewności rejestru">`];
  groups.forEach((g, i) => {
    const yc = T + i * rowH + rowH / 2;
    let acc = L;
    parts.push(`<text x="${L - 8}" y="${yc + 4}" text-anchor="end" class="fig-small">${esc(GROUP_LABEL[g] ?? g)}</text>`);
    for (const c of order) {
      const n = lit.filter((p) => p.group === g && p.certainty === c).length;
      if (!n) continue;
      parts.push(`<rect x="${r1(acc)}" y="${yc - 7}" width="${r1(x(n))}" height="14" class="cert-${c}"><title>${esc(`${GROUP_LABEL[g] ?? g}: ${CERTAINTY_LABEL[c]} — ${n}`)}</title></rect>`);
      acc += x(n);
    }
    parts.push(`<text x="${r1(acc + 5)}" y="${yc + 4}" class="fig-small">${lit.filter((p) => p.group === g).length}</text>`);
  });
  order.forEach((c, k) => parts.push(`<rect x="${L + k * 150}" y="${H - 18}" width="12" height="10" class="cert-${c}"/><text x="${L + k * 150 + 16}" y="${H - 9}" class="fig-small">${CERTAINTY_LABEL[c]}</text>`));
  parts.push('</svg>');
  return parts.join('\n');
}

export const FIGURES: Record<string, (ctx: FigureContext) => string> = {
  timeline: timelineFigure,
  travel: travelTimeFigure,
  distance: distanceEffectsFigure,
  crater: craterSectionsFigure,
  thermal: thermalModelsFigure,
  certainty: certaintyFigure,
};
