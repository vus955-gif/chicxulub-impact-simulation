/**
 * Legenda i style linii — jedno źródło prawdy dla mapy 2D, globu i panelu legendy:
 * kolor, wzór i grubość każdego elementu, krótki podpis na linii, opis w legendzie i bieżący promień.
 */
import type { Certainty, Txt } from '../model/registry/types';
import type { SimContext } from '../model/sim/context';
import { frontsAt, irZoneAt, type FrontKind } from '../model/sim/fronts';
import { bioReachAt, bioZones, type BioZoneKey } from '../model/sim/biosphere';
import type { ThermalScenario } from '../model/sim/intensities';
import type { PhenomenonKey } from './url-state';

export interface LineStyle { color: string; dash: number[]; width: number }
export type ItemKind = 'ring' | 'band' | 'disc' | 'raster' | 'dots' | 'outline';

export interface LegendItem {
  key: string;
  layer: PhenomenonKey | 'coast';
  kind: ItemKind;
  /** krótki podpis na linii */
  tag: Txt;
  /** nazwa w legendzie i w dymku */
  title: Txt;
  /** jedno zdanie: co ta linia/pole oznacza */
  desc: Txt;
  style: LineStyle;
  certainty: Certainty;
  /** bieżący promień po powierzchni [km] (pierścienie, pasma, tarcze) */
  radiusKm?: number;
  /** wewnętrzny promień pasma [km] */
  innerKm?: number;
}

/** Kolory jako zmienne CSS motywu (rozwiązywane w widokach). */
export const FRONT_STYLE: Record<FrontKind, LineStyle & { tag: Txt; title: Txt; desc: Txt }> = {
  P: { color: '--c-seismic', dash: [], width: 2.2, tag: { pl: 'fala P', en: 'P wave' }, title: { pl: 'Fala P (podłużna)', en: 'P wave (compressional)' },
    desc: { pl: 'Pierwsze, najszybsze drgania przechodzące przez wnętrze Ziemi.', en: 'The first, fastest shaking, travelling through the Earth’s interior.' } },
  S: { color: '--c-seismic', dash: [9, 5], width: 1.9, tag: { pl: 'fala S', en: 'S wave' }, title: { pl: 'Fala S (poprzeczna)', en: 'S wave (shear)' },
    desc: { pl: 'Druga fala przez wnętrze Ziemi — wolniejsza od P.', en: 'The second wave through the Earth’s interior — slower than P.' } },
  R: { color: '--c-seismic-surf', dash: [12, 4, 2, 4], width: 2, tag: { pl: 'Rayleigh', en: 'Rayleigh' }, title: { pl: 'Fala Rayleigha (powierzchniowa)', en: 'Rayleigh wave (surface)' },
    desc: { pl: 'Najsilniejsze, powolne falowanie gruntu; okrąża Ziemię wielokrotnie.', en: 'The strongest, slow rolling of the ground; circles the Earth many times.' } },
  G: { color: '--c-seismic-surf', dash: [2, 4], width: 2, tag: { pl: 'Love', en: 'Love' }, title: { pl: 'Fala Love’a (powierzchniowa)', en: 'Love wave (surface)' },
    desc: { pl: 'Poziome kołysanie gruntu; nieco szybsza od fali Rayleigha.', en: 'Horizontal swaying of the ground; slightly faster than the Rayleigh wave.' } },
  lamb: { color: '--c-air', dash: [], width: 2.3, tag: { pl: 'fala ciśnienia', en: 'pressure wave' }, title: { pl: 'Fala ciśnienia w atmosferze (fala Lamba)', en: 'Atmospheric pressure wave (Lamb wave)' },
    desc: { pl: 'Skok ciśnienia biegnący wokół globu; blisko krateru — huraganowy wiatr.', en: 'A pressure jump racing around the globe; near the crater — hurricane-force wind.' } },
  ejecta: { color: '--c-ejecta', dash: [], width: 2.3, tag: { pl: 'front ejecta', en: 'ejecta front' }, title: { pl: 'Front ejecta', en: 'Ejecta front' },
    desc: { pl: 'Granica, do której dotarły już pierwsze wyrzuty nad atmosferę.', en: 'How far the first ejecta have already travelled above the atmosphere.' } },
  fireball: { color: '--c-thermal', dash: [], width: 0, tag: { pl: 'kula ognia', en: 'fireball' }, title: { pl: 'Kula ognia', en: 'Fireball' },
    desc: { pl: 'Obszar bezpośredniego promieniowania kuli ognia nad kraterem.', en: 'Area directly irradiated by the fireball above the crater.' } },
};

export const BIO_STYLE: Record<BioZoneKey, LineStyle & { tag: Txt }> = {
  sterile: { color: '--c-bio', dash: [], width: 1.6, tag: { pl: 'zniszczenie', en: 'total destruction' } },
  thermal: { color: '--c-bio', dash: [2, 3], width: 1.6, tag: { pl: 'zapłon / oparzenia', en: 'ignition / burns' } },
  trees90: { color: '--c-bio', dash: [8, 4], width: 1.6, tag: { pl: '90% drzew powalonych', en: '90% of trees down' } },
  trees30: { color: '--c-bio', dash: [8, 4], width: 1.6, tag: { pl: '30% drzew powalonych', en: '30% of trees down' } },
  liquefaction: { color: '--c-bio', dash: [1, 3], width: 1.8, tag: { pl: 'upłynnienie gruntu', en: 'soil liquefaction' } },
  slopes: { color: '--c-bio', dash: [1, 3], width: 1.8, tag: { pl: 'osuwiska podmorskie', en: 'submarine landslides' } },
};

export const OTHER_STYLE = {
  ir: { color: '--c-thermal', dash: [], width: 1.2 },
  fires: { color: '--c-fires', dash: [5, 4], width: 1.8 },
  crater: { color: '--c-crater', dash: [], width: 1.8 },
  tsunami: { color: '--c-tsunami', dash: [], width: 0 },
  dark: { color: '--c-atmo', dash: [], width: 0 },
  flash: { color: '--c-ejecta', dash: [], width: 0 },
  coast: { color: '#ffffff', dash: [], width: 0.8 },
} satisfies Record<string, LineStyle>;

const FRONT_LAYER: Record<FrontKind, PhenomenonKey> = { P: 'seismic', S: 'seismic', R: 'seismic', G: 'seismic', lamb: 'air', ejecta: 'ejecta', fireball: 'thermal' };

export interface LegendState {
  t: number; layers: Record<PhenomenonKey, boolean>; thermal: ThermalScenario; coast: boolean;
}

/** Elementy widoczne w chwili t (kolejność = kolejność w legendzie). */
export function activeItems(ctx: SimContext, s: LegendState, opts: { tsunamiReached: boolean; flashesNow: boolean }): LegendItem[] {
  const { t, layers } = s, reg = ctx.reg;
  const out: LegendItem[] = [];
  if (t > 0) {
    for (const f of frontsAt(ctx, t)) {
      if (!layers[FRONT_LAYER[f.kind]] || f.radiusKm <= 0) continue;
      const st = FRONT_STYLE[f.kind];
      const lap = (pl: string, en: string) => (f.order > 1 ? { pl: `${pl} · okrążenie ${f.order}`, en: `${en} · circuit ${f.order}` } : { pl, en });
      out.push({ key: `front:${f.kind}`, layer: FRONT_LAYER[f.kind], kind: f.kind === 'fireball' ? 'disc' : 'ring', tag: lap(st.tag.pl, st.tag.en), title: st.title, desc: st.desc,
        style: { color: st.color, dash: st.dash, width: st.width }, certainty: f.certainty, radiusKm: f.radiusKm });
    }
    if (layers.thermal) {
      const z = irZoneAt(ctx, t, s.thermal);
      if (z.outerKm > z.innerKm + 1) out.push({ key: 'ir', layer: 'thermal', kind: 'band', tag: { pl: 'impuls IR', en: 'IR pulse' }, title: { pl: 'Strefa trwającego impulsu podczerwieni', en: 'Zone of the ongoing infrared pulse' },
        desc: { pl: 'Tu właśnie wracające ejecta rozgrzewają niebo; natężenie zależy od spornego scenariusza.', en: 'Here re-entering ejecta are heating the sky right now; the intensity depends on a contested scenario.' }, style: OTHER_STYLE.ir, certainty: 'contested', radiusKm: z.outerKm, innerKm: z.innerKm });
    }
    if (layers.fires && t > reg.num('fireball.t_max_radiation_eiep')) out.push({ key: 'fires', layer: 'fires', kind: 'ring', tag: { pl: 'zapłon (kula ognia)', en: 'ignition (fireball)' }, title: { pl: 'Zasięg zapłonu roślinności od kuli ognia', en: 'Vegetation-ignition range of the fireball' },
      desc: { pl: 'Do tej odległości promieniowanie kuli ognia mogło zapalić roślinność.', en: 'Up to this distance fireball radiation could ignite vegetation.' }, style: OTHER_STYLE.fires, certainty: reg.param('fires.ignition_radius_fireball').certainty, radiusKm: reg.num('fires.ignition_radius_fireball') });
    if (layers.ejecta && opts.flashesNow) out.push({ key: 'flash', layer: 'ejecta', kind: 'dots', tag: { pl: 'wejście ejecta', en: 'ejecta re-entry' }, title: { pl: 'Rozbłyski ponownego wejścia wyrzutów', en: 'Ejecta re-entry flashes' },
      desc: { pl: 'Miejsca, w których wyrzuty właśnie wracają w atmosferę (symbol; trajektorie △).', en: 'Places where ejecta are re-entering the atmosphere right now (symbol; trajectories △).' }, style: OTHER_STYLE.flash, certainty: 'predictive' });
    if (layers.bio) {
      for (const z of bioZones(ctx)) {
        const r = bioReachAt(ctx, z, t);
        if (r.outerKm <= 0) continue;
        const st = BIO_STYLE[z.key];
        out.push({ key: `bio:${z.key}`, layer: 'bio', kind: z.key === 'sterile' ? 'disc' : r.lowKm !== undefined ? 'band' : 'ring', tag: st.tag, title: z.label,
          desc: z.radiusLowKm !== undefined ? { pl: 'Pasmo między dolną a górną granicą zasięgu (EIEP zawyża ciśnienie dla tak dużych energii).', en: 'Band between the lower and upper bound of the range (EIEP overestimates pressure at such large energies).' } : z.method,
          style: { color: st.color, dash: st.dash, width: st.width }, certainty: z.certainty, radiusKm: r.outerKm, innerKm: r.lowKm });
      }
    }
    if (layers.tsunami && opts.tsunamiReached) out.push({ key: 'tsunami', layer: 'tsunami', kind: 'raster', tag: { pl: 'tsunami', en: 'tsunami' }, title: { pl: 'Tsunami', en: 'Tsunami' },
      desc: { pl: 'Obszar oceanu, do którego dotarła fala; jaśniejszy pas — czoło fali.', en: 'Ocean area the wave has reached; the brighter band is the wave front.' }, style: OTHER_STYLE.tsunami, certainty: 'extrapolation' });
    if (layers.atmo) out.push({ key: 'dark', layer: 'atmo', kind: 'raster', tag: { pl: 'zaciemnienie', en: 'darkness' }, title: { pl: 'Zaciemnienie nieba △', en: 'Darkened sky △' },
      desc: { pl: 'Model predykcyjny projektu: pył i sadza przyciemniają światło.', en: 'Project predictive model: dust and soot dim the sunlight.' }, style: OTHER_STYLE.dark, certainty: 'predictive' });
  }
  if (layers.crater) {
    const r = t >= reg.num('crater.t_final') ? reg.num('crater.final_diameter') / 2 : t > 0 ? reg.num('crater.transient_diameter') / 2 : 0;
    if (r > 0) out.push({ key: 'crater', layer: 'crater', kind: 'outline', tag: { pl: 'krater', en: 'crater' }, title: { pl: 'Krawędź krateru', en: 'Crater rim' },
      desc: { pl: 'Obrys krateru (przejściowego, a od 10. minuty końcowego).', en: 'Crater outline (transient, then final from the 10th minute).' }, style: OTHER_STYLE.crater, certainty: reg.param('crater.final_diameter').certainty, radiusKm: r });
  }
  if (s.coast) out.push({ key: 'coast', layer: 'coast', kind: 'ring', tag: { pl: 'dzisiejsze wybrzeża', en: 'present-day coasts' }, title: { pl: 'Dzisiejsze linie brzegowe', en: 'Present-day coastlines' },
    desc: { pl: 'Tylko orientacja: dzisiejsze wybrzeża przesunięte z płytami — nie paleolinia brzegowa.', en: 'For orientation only: today’s coasts moved with the plates — not the palaeo-coastline.' }, style: OTHER_STYLE.coast, certainty: 'fact' });
  return out;
}

/** Elementy, które mają linię z promieniem (do podpisów i trafiania kursorem). */
export const hasRing = (it: LegendItem) => it.radiusKm !== undefined && (it.kind === 'ring' || it.kind === 'band' || it.kind === 'outline' || it.kind === 'disc');

export interface Box { x: number; y: number; w: number; h: number }
const overlaps = (a: Box, b: Box) => a.x < b.x + b.w && b.x < a.x + a.w && a.y < b.y + b.h && b.y < a.y + a.h;

/**
 * Rozmieszczenie podpisów bez nachodzenia: dla każdego elementu próbujemy kolejnych punktów-kandydatów
 * (na jego linii) i bierzemy pierwszy, którego prostokąt mieści się w granicach i nie zachodzi na zajęte.
 */
export function placeLabels(items: Array<{ key: string; w: number; h: number; candidates: Array<[number, number]> }>, bounds: Box, taken: Box[] = []): Map<string, Box> {
  const placed = new Map<string, Box>();
  const occupied = [...taken];
  for (const it of items) {
    for (const [x, y] of it.candidates) {
      const b = { x: x + 4, y: y - it.h / 2, w: it.w, h: it.h };
      if (b.x < bounds.x || b.y < bounds.y || b.x + b.w > bounds.x + bounds.w || b.y + b.h > bounds.y + bounds.h) continue;
      if (occupied.some((o) => overlaps(o, b))) continue;
      placed.set(it.key, b); occupied.push(b);
      break;
    }
  }
  return placed;
}
