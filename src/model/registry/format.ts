import type { Certainty, Parameter } from './types';

export const CERTAINTY_MARK: Record<Certainty, string> = {
  fact: '●', extrapolation: '◐', speculation: '○', contested: '⚑', predictive: '△',
};
export const CERTAINTY_LABEL: Record<Certainty, string> = {
  fact: 'fakt', extrapolation: 'ekstrapolacja', speculation: 'spekulacja', contested: 'sporne', predictive: 'model predykcyjny projektu',
};
export const CERTAINTY_LABEL_EN: Record<Certainty, string> = {
  fact: 'fact', extrapolation: 'extrapolation', speculation: 'speculation', contested: 'contested', predictive: 'project predictive model',
};

const SUPERSCRIPT: Record<string, string> = {
  '-': '⁻', '0': '⁰', '1': '¹', '2': '²', '3': '³', '4': '⁴', '5': '⁵', '6': '⁶', '7': '⁷', '8': '⁸', '9': '⁹',
};
let numberLocale = 'pl-PL';
/** Język formatowania liczb (aplikacja przełącza PL/EN; raport i skrypty zostają przy pl-PL). */
export const setNumberLocale = (locale: 'pl-PL' | 'en-US') => { numberLocale = locale; };
const localeNumber = (x: number, maxFrac: number) => x.toLocaleString(numberLocale, { maximumFractionDigits: maxFrac });

export function formatNumber(x: number, sig = 3): string {
  if (x === 0) return '0';
  const abs = Math.abs(x);
  if (abs >= 1e6 || abs < 1e-3) {
    let exp = Math.floor(Math.log10(abs));
    let mant = Number((x / 10 ** exp).toPrecision(sig));
    if (Math.abs(mant) >= 10) { mant /= 10; exp += 1; }
    const sup = [...String(exp)].map((c) => SUPERSCRIPT[c] ?? c).join('');
    return `${localeNumber(mant, sig)} × 10${sup}`;
  }
  return localeNumber(Number(x.toPrecision(sig)), 20);
}

/** Czas trwania w jednostce dobranej do wielkości: s, min albo h. */
export function formatDuration(s: number): string {
  if (s < 60) return `${formatNumber(s, 2)} s`;
  if (s < 3600) return `${formatNumber(s / 60, 2)} min`;
  return `${formatNumber(s / 3600, 3)} h`;
}

export const withUnit = (s: string, unit: string) => (unit === '' ? s : unit === '°' ? `${s}°` : `${s} ${unit}`);

export function formatParam(p: Parameter): string {
  if (p.value === null) return '—';
  if (typeof p.value === 'string') return withUnit(p.value, p.unit);
  return withUnit(formatNumber(p.value), p.unit);
}

export function formatRange(p: Parameter): string {
  if (!p.range) return '—';
  return withUnit(`${formatNumber(p.range[0])}–${formatNumber(p.range[1])}`, p.unit);
}
