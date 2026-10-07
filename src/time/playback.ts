/** Odtwarzanie: tryb adaptacyjny (stała liczba dekad czasu na sekundę ekranu) albo czas rzeczywisty. */
export type PlayMode = 'adaptive' | 'realtime';
export interface PlaybackConfig { tEntry: number; tMin: number; tMax: number; prologScreenS: number }

export function advance(t: number, dtScreen: number, mode: PlayMode, decadesPerSecond: number, cfg: PlaybackConfig): number {
  let next: number;
  if (mode === 'realtime') next = t + dtScreen;
  else if (t < 0) {
    next = t + dtScreen * (cfg.tEntry / cfg.prologScreenS);
    if (next >= 0) next = cfg.tMin;
  } else if (t < cfg.tMin) next = cfg.tMin;
  else next = t * 10 ** (decadesPerSecond * dtScreen);
  return Math.min(next, cfg.tMax);
}
