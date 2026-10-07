/** Ładowanie zasobów aplikacji (public/data) i budowa kontekstu modelu. Każdy brak pliku zgłaszany z nazwą. */
import type { Registry, Certainty } from '../model/registry/types';
import { RegistryIndex } from '../model/sim/registry-client';
import { createSimContext, type SimContext, type Ak135Json } from '../model/sim/context';
import { gridFromBuffer, type EquirectGrid } from '../model/sim/grid';
import { gcDistanceKm } from '../model/sim/geo';
import { eventsFromParams, type TimelineEvent } from '../time/events';
import { sampleEjecta, type EjectaParticle } from '../model/sim/ejecta-orbits';
import { L } from './i18n';

export interface SiteObservation { text: string; textEn?: string; sources: string[]; certainty: Certainty }
export interface Site { id: string; name: string; nameEn?: string; lat: number; lon: number; paleoLat: number; paleoLon: number; plateId?: number; coordSource?: string; observations: SiteObservation[] }

export interface AppData {
  reg: RegistryIndex; ctx: SimContext; sites: Site[]; events: TimelineEvent[];
  elev: EquirectGrid; tsunamiTT: EquirectGrid; tsunamiAmp: EquirectGrid; texture: HTMLImageElement;
  /** zasięg frontu tsunami: posortowane czasy dotarcia komórek i bieżące maksimum odległości [km] */
  tsunamiReach: { t: Float32Array; maxDist: Float32Array };
  /** dzisiejsze linie brzegowe obrócone do wieku mapy (lon, lat naprzemiennie) — orientacja, nie paleolinia brzegowa */
  coastlines: number[][];
  /** trajektorie wyrzutów (orbity Keplera, obracająca się Ziemia) — wspólne dla globu i mapy */
  ejecta: EjectaParticle[];
}

async function fetchOk(url: string): Promise<Response> {
  const r = await fetch(url);
  if (!r.ok) throw new Error(`${L('Nie udało się wczytać', 'Could not load')} ${url} (HTTP ${r.status})`);
  return r;
}
const json = async <T>(url: string) => (await fetchOk(url)).json() as Promise<T>;
const bin = async (url: string) => (await fetchOk(url)).arrayBuffer();
const image = (url: string) => new Promise<HTMLImageElement>((res, rej) => {
  const im = new Image();
  im.onload = () => res(im);
  im.onerror = () => rej(new Error(`${L('Nie udało się wczytać', 'Could not load')} ${url}`));
  im.src = url;
});

function buildReach(ctx: SimContext, tt: EquirectGrid) {
  const pairs: Array<[number, number]> = [];
  for (let r = 0; r < tt.h; r++) for (let c = 0; c < tt.w; c++) {
    const t = tt.data[r * tt.w + c]!;
    if (!Number.isFinite(t)) continue;
    pairs.push([t, gcDistanceKm(ctx.crater, { lat: 90 - (r + 0.5) * (180 / tt.h), lon: -180 + (c + 0.5) * (360 / tt.w) })]);
  }
  pairs.sort((a, b) => a[0] - b[0]);
  const t = new Float32Array(pairs.length), maxDist = new Float32Array(pairs.length);
  let m = 0;
  pairs.forEach(([ti, di], i) => { m = Math.max(m, di); t[i] = ti; maxDist[i] = m; });
  return { t, maxDist };
}

export async function loadAppData(onProgress: (msg: string) => void): Promise<AppData> {
  const base = `${import.meta.env.BASE_URL}data/`;
  onProgress(L('Rejestr parametrów i źródeł…', 'Parameter and source registry…'));
  const [registry, ak, sitesJson, coast] = await Promise.all([
    json<Registry & { generatedAt: string }>(`${base}registry.json`),
    json<Ak135Json>(`${base}ak135.json`),
    json<{ sites: Site[] }>(`${base}sites.json`),
    json<{ lines: number[][] }>(`${base}coastlines_paleo.json`),
  ]);
  onProgress(L('Paleogeografia i siatki tsunami…', 'Palaeogeography and tsunami grids…'));
  const [elevB, ttB, ampB, texture] = await Promise.all([
    bin(`${base}paleodem_elev_1440x720.i16`), bin(`${base}tsunami_tt_1440x720.f32`), bin(`${base}tsunami_amp_1440x720.f32`),
    image(`${base}paleodem_color_4096.jpg`),
  ]);
  const reg = new RegistryIndex(registry);
  const ctx = createSimContext(reg, ak);
  const tsunamiTT = gridFromBuffer(ttB, 1440, 720, 'f32');
  onProgress(L('Trajektorie wyrzutów…', 'Ejecta trajectories…'));
  await new Promise((r) => setTimeout(r, 0)); // pokaż komunikat przed obliczeniem
  const ejecta = sampleEjecta(ctx, 3000);
  onProgress(L('Przygotowanie modelu…', 'Preparing the model…'));
  return {
    reg, ctx, texture, tsunamiTT,
    sites: sitesJson.sites.filter((s) => s.id !== 'chicxulub'),
    events: eventsFromParams(registry.parameters),
    elev: gridFromBuffer(elevB, 1440, 720, 'i16'),
    tsunamiAmp: gridFromBuffer(ampB, 1440, 720, 'f32'),
    tsunamiReach: buildReach(ctx, tsunamiTT),
    coastlines: coast.lines,
    ejecta,
  };
}

/** Zasięg frontu tsunami [km] w chwili t (największa odległość osiągniętej komórki). */
export function tsunamiReachKm(d: AppData, t: number): number {
  const a = d.tsunamiReach.t;
  let lo = 0, hi = a.length - 1, k = -1;
  while (lo <= hi) { const mid = (lo + hi) >> 1; if (a[mid]! <= t) { k = mid; lo = mid + 1; } else hi = mid - 1; }
  return k < 0 ? 0 : d.tsunamiReach.maxDist[k]!;
}
