import { litFlashRange } from '../model/sim/ejecta-orbits';
import type { PlayMode } from '../time/playback';
import { tsunamiReachKm, type AppData } from './data';
import { activeItems, type LegendItem, type LegendState } from './legend';

/** Elementy legendy mapy i globu w bieżącym stanie interfejsu (flashOrder = sortByReentry(data.ejecta)). */
export function viewItems(data: AppData, flashOrder: Int32Array, s: LegendState & { mode: PlayMode; dps: number }): LegendItem[] {
  const [lo, hi] = litFlashRange(data.ejecta, flashOrder, s.t, s.mode, s.dps);
  return activeItems(data.ctx, s, { tsunamiReached: s.t > 0 && tsunamiReachKm(data, s.t) > 0, flashesNow: hi > lo });
}
