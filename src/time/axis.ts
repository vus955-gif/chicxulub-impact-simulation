/** Oś czasu: prolog liniowy [−tEntry, 0] na [0, prologShare], potem skala logarytmiczna [tMin, tMax] na [prologShare, 1]. */
import { formatNumber } from '../model/registry/format';

/** Zakres osi czasu po kontakcie: od 0,01 s do 24 h. */
export const T_MIN = 0.01;
export const T_MAX = 86400;

export interface AxisConfig { tEntry: number; tMin: number; tMax: number; prologShare: number }
export interface Tick { t: number; u: number; label: string; labelEn?: string; major: boolean }

export function createAxis(cfg: AxisConfig) {
  const { tEntry, tMin, tMax, prologShare: P } = cfg;
  const l0 = Math.log10(tMin), l1 = Math.log10(tMax);
  const tToU = (t: number): number => {
    if (t <= -tEntry) return 0;
    if (t < 0) return (P * (t + tEntry)) / tEntry;
    if (t < tMin) return P;
    if (t >= tMax) return 1;
    return P + ((1 - P) * (Math.log10(t) - l0)) / (l1 - l0);
  };
  const uToT = (u: number): number => {
    if (u <= 0) return -tEntry;
    if (u < P) return -tEntry + (u / P) * tEntry;
    if (u >= 1) return tMax;
    return 10 ** (l0 + ((u - P) / (1 - P)) * (l1 - l0));
  };
  const label = (t: number) => (t < 60 ? `${formatNumber(t, 2)} s` : t < 3600 ? `${formatNumber(t / 60, 2)} min` : `${formatNumber(t / 3600, 2)} h`);
  const ticks = (): Tick[] => [
    { t: -tEntry, u: 0, label: 'przelot', labelEn: 'entry', major: false },
    { t: 0, u: P, label: '0', major: true },
    ...[0.01, 0.1, 1, 10, 60, 600, 3600, 21600, 86400].filter((t) => t >= tMin && t <= tMax).map((t) => ({ t, u: tToU(t), label: label(t), major: true })),
  ];
  return { tToU, uToT, ticks, cfg };
}
export type Axis = ReturnType<typeof createAxis>;

/** Zegar „T+ hh:mm:ss.s” / „T− s.s”. */
export function formatClock(t: number): string {
  if (t < 0) return `T− ${(-t).toFixed(1)} s`;
  const h = Math.floor(t / 3600), m = Math.floor((t % 3600) / 60), s = t % 60;
  const ss = t < 10 ? s.toFixed(2) : s.toFixed(1);
  return `T+ ${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${ss.padStart(t < 10 ? 5 : 4, '0')}`;
}
