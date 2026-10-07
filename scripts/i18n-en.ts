/**
 * Angielskie teksty rejestru i stanowisk (polski jest językiem źródłowym).
 * Słownik: research/i18n-en.json; etykiety i notatki tabel odległości (derived.json) — wzorce poniżej.
 */
import type { Parameter, Source } from '../src/model/registry/types';

export interface I18nEn {
  labels: Record<string, string>;
  notes: Record<string, string>;
  sourceNotes: Record<string, string>;
  methods: Record<string, string>;
  sites: Record<string, { name: string; obs: string[] }>;
}

const km = (s: string) => s.replace(/\s/g, ',');
const LABEL_PATTERNS: Array<[RegExp, (m: RegExpMatchArray) => string]> = [
  [/^Ekspozycja cieplna od kuli ognia, (.+) km$/, (m) => `Fireball thermal exposure, ${km(m[1]!)} km`],
  [/^Efektywna magnituda wstrząsów, (.+) km$/, (m) => `Effective shaking magnitude, ${km(m[1]!)} km`],
  [/^Dotarcie fali P, (.+) km$/, (m) => `P-wave arrival, ${km(m[1]!)} km`],
  [/^Dotarcie fali S, (.+) km$/, (m) => `S-wave arrival, ${km(m[1]!)} km`],
  [/^Dotarcie fali Rayleigha \(R1\), (.+) km$/, (m) => `Rayleigh-wave (R1) arrival, ${km(m[1]!)} km`],
  [/^Grubość ejecta, (.+) km$/, (m) => `Ejecta thickness, ${km(m[1]!)} km`],
  [/^Dotarcie ejecta balistycznych, (.+) km$/, (m) => `Ballistic ejecta arrival, ${km(m[1]!)} km`],
  [/^Nadciśnienie fali uderzeniowej, (.+) km$/, (m) => `Shock-wave overpressure, ${km(m[1]!)} km`],
  [/^Maksymalny wiatr za frontem, (.+) km$/, (m) => `Peak wind behind the front, ${km(m[1]!)} km`],
  [/^Poziom ciśnienia akustycznego, (.+) km$/, (m) => `Sound pressure level, ${km(m[1]!)} km`],
  [/^Dotarcie fali Lamba \(ciśnienia\), (.+) km$/, (m) => `Lamb (pressure) wave arrival, ${km(m[1]!)} km`],
];
const NOTE_BY_TEXT: Record<string, string> = {
  'Zero = kula ognia pod horyzontem. Nie obejmuje impulsu podczerwieni od opadających ejecta (thermal.ir_*).':
    'Zero = fireball below the horizon. Does not include the infrared pulse from falling ejecta (thermal.ir_*).',
  'Collins i in. 2005: dla E > 10⁴ Mt model prawdopodobnie zawyża nadciśnienie 2–5× — rząd wielkości.':
    'Collins et al. 2005: for E > 10⁴ Mt the model probably overestimates overpressure 2–5× — order of magnitude.',
  'Powyżej ~194 dB to fala uderzeniowa, nie dźwięk w sensie akustycznym.':
    'Above ~194 dB this is a shock wave, not sound in the acoustic sense.',
};
const POLISH = /[ąćęłńóśźżĄĆĘŁŃÓŚŹŻ]/;

function labelEn(p: Parameter, d: I18nEn): string | undefined {
  if (d.labels[p.id]) return d.labels[p.id];
  for (const [re, f] of LABEL_PATTERNS) { const m = p.label.match(re); if (m) return f(m); }
  return undefined;
}

/** Dołącza labelEn / notesEn / methodEn; zwraca listę braków (puste = komplet). */
export function applyEnglish(params: Parameter[], sources: Source[], d: I18nEn): { params: Parameter[]; sources: Source[]; missing: string[] } {
  const missing: string[] = [];
  const outP = params.map((p) => {
    const q: Parameter = { ...p };
    const l = labelEn(p, d);
    if (l) q.labelEn = l; else missing.push(`label ${p.id}`);
    if (p.notes && POLISH.test(p.notes)) {
      const n = d.notes[p.id] ?? NOTE_BY_TEXT[p.notes];
      if (n) q.notesEn = n; else missing.push(`notes ${p.id}`);
    }
    if (p.method && POLISH.test(p.method)) {
      const m = d.methods[p.id];
      if (m) q.methodEn = m; else missing.push(`method ${p.id}`);
    }
    return q;
  });
  const outS = sources.map((s) => {
    if (!s.notes || !POLISH.test(s.notes)) return s;
    const n = d.sourceNotes[s.id];
    if (!n) missing.push(`source notes ${s.id}`);
    return n ? { ...s, notesEn: n } : s;
  });
  return { params: outP, sources: outS, missing };
}

export interface SiteJson { id: string; name: string; observations: Array<{ text: string } & Record<string, unknown>> }

export function applyEnglishSites<T extends SiteJson>(sites: T[], d: I18nEn): { sites: T[]; missing: string[] } {
  const missing: string[] = [];
  const out = sites.map((s) => {
    const e = d.sites[s.id];
    if (!e) { missing.push(`site ${s.id}`); return s; }
    if (e.obs.length !== s.observations.length) missing.push(`site ${s.id}: ${s.observations.length} observations, ${e.obs.length} translated`);
    return { ...s, nameEn: e.name, observations: s.observations.map((o, i) => ({ ...o, textEn: e.obs[i] ?? o.text })) };
  });
  return { sites: out, missing };
}
