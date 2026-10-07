/** Wspólny stan aplikacji (Svelte 5 runes). Jeden zegar T dla wszystkich widoków; stan odtwarzany z adresu URL. */
import { decodeState, encodeState, PHENOMENA, type LangKey, type PhenomenonKey, type ViewKey } from './url-state';
import type { ThermalScenario } from '../model/sim/intensities';
import type { FireScenario } from '../model/predictive/darkness';
import type { PlayMode } from '../time/playback';

export interface Drawer { title: string; paramId?: string; sourceIds?: string[]; method?: string; note?: string }

const defaultLayers = Object.fromEntries(PHENOMENA.map((k) => [k, k !== 'atmo'])) as Record<PhenomenonKey, boolean>;

export const ui = $state({
  t: -5.8,
  playing: false,
  mode: 'adaptive' as PlayMode,
  dps: 0.5,
  view: 'map2d' as ViewKey,
  layers: { ...defaultLayers },
  probe: null as { lat: number; lon: number } | null,
  site: 'tanis' as string | null,
  thermal: 'morgan' as ThermalScenario,
  fires: 'regional' as FireScenario,
  envelope: false,
  /** dzisiejsze linie brzegowe obrócone do 65 mln lat — tylko orientacja */
  coast: true,
  drawer: null as Drawer | null,
  /** krok przewodnika (null = zamknięty; -1 = otwórz od początku) */
  guide: null as number | null,
  /** element legendy wskazany kursorem (wyróżniany na mapie i globie) */
  hover: null as string | null,
  /** język interfejsu */
  lang: 'pl' as LangKey,
});

export function restoreFromUrl(): void {
  const d = decodeState(location.hash);
  if (d.t !== undefined) ui.t = d.t;
  if (d.view) ui.view = d.view;
  if (d.layers) ui.layers = d.layers;
  if (d.probe) { ui.probe = d.probe; ui.site = null; }
  if (d.site) { ui.site = d.site; ui.probe = null; }
  if (d.thermal) ui.thermal = d.thermal;
  if (d.fires) ui.fires = d.fires;
  if (d.envelope !== undefined) ui.envelope = d.envelope;
  if (d.mode) ui.mode = d.mode;
  if (d.dps !== undefined) ui.dps = d.dps;
  if (d.coast !== undefined) ui.coast = d.coast;
  if (d.lang) ui.lang = d.lang;
}

let lastWrite = 0;
export function writeUrl(force = false): void {
  const now = performance.now();
  if (!force && now - lastWrite < 500) return;
  lastWrite = now;
  history.replaceState(null, '', encodeState({ t: ui.t, view: ui.view, layers: ui.layers, probe: ui.probe, site: ui.site, thermal: ui.thermal, fires: ui.fires, envelope: ui.envelope, mode: ui.mode, dps: ui.dps, coast: ui.coast, lang: ui.lang }));
}

export const openDrawer = (d: Drawer) => { ui.drawer = d; };
