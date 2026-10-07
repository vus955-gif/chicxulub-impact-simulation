/** Stan widoku w adresie (#t=…&v=…): link do konkretnego momentu, warstw i sondy. Wejście z URL zawsze walidowane. */
export const PHENOMENA = ['crater', 'thermal', 'ejecta', 'seismic', 'air', 'tsunami', 'fires', 'atmo', 'bio'] as const;
export type PhenomenonKey = (typeof PHENOMENA)[number];
export const VIEWS = ['map2d', 'globe', 'closeup', 'section'] as const;
export type ViewKey = (typeof VIEWS)[number];
export type ThermalKey = 'morgan' | 'goldin' | 'melosh';
export type FiresKey = 'regional' | 'global';
export type ModeKey = 'adaptive' | 'realtime';
export type LangKey = 'pl' | 'en';

export interface UrlState {
  t: number; view: ViewKey; layers: Record<PhenomenonKey, boolean>;
  probe: { lat: number; lon: number } | null; site: string | null;
  thermal: ThermalKey; fires: FiresKey; envelope: boolean; mode: ModeKey; dps: number; coast: boolean; lang: LangKey;
}

const sig = (x: number) => Number(x.toPrecision(4));

export function encodeState(s: UrlState): string {
  const q = new URLSearchParams();
  q.set('t', String(sig(s.t)));
  q.set('v', s.view);
  q.set('l', PHENOMENA.filter((k) => s.layers[k]).join(','));
  if (s.probe) q.set('p', `${s.probe.lat.toFixed(2)},${s.probe.lon.toFixed(2)}`);
  if (s.site) q.set('s', s.site);
  q.set('th', s.thermal);
  q.set('f', s.fires);
  q.set('e', s.envelope ? '1' : '0');
  q.set('m', s.mode);
  q.set('d', String(sig(s.dps)));
  q.set('c', s.coast ? '1' : '0');
  q.set('lang', s.lang);
  return '#' + q.toString();
}

const oneOf = <T extends string>(v: string | null, allowed: readonly T[]): T | undefined => (v !== null && (allowed as readonly string[]).includes(v) ? (v as T) : undefined);
const finite = (v: string | null, lo: number, hi: number): number | undefined => {
  if (v === null) return undefined;
  const x = Number(v);
  return Number.isFinite(x) && x >= lo && x <= hi ? x : undefined;
};

export function decodeState(hash: string): Partial<UrlState> {
  try {
    const q = new URLSearchParams(hash.replace(/^#/, ''));
    const out: Partial<UrlState> = {};
    const t = finite(q.get('t'), -60, 86400); if (t !== undefined) out.t = t;
    const v = oneOf(q.get('v'), VIEWS); if (v) out.view = v;
    const l = q.get('l');
    if (l !== null) {
      const set = new Set(l.split(','));
      out.layers = Object.fromEntries(PHENOMENA.map((k) => [k, set.has(k)])) as Record<PhenomenonKey, boolean>;
    }
    const p = q.get('p');
    if (p) {
      const [a, b] = p.split(',').map(Number);
      if (Number.isFinite(a) && Number.isFinite(b) && Math.abs(a!) <= 90 && Math.abs(b!) <= 180) out.probe = { lat: a!, lon: b! };
    }
    const s = q.get('s'); if (s && /^[a-z0-9_]{1,40}$/.test(s)) out.site = s;
    const th = oneOf(q.get('th'), ['morgan', 'goldin', 'melosh'] as const); if (th) out.thermal = th;
    const f = oneOf(q.get('f'), ['regional', 'global'] as const); if (f) out.fires = f;
    const e = q.get('e'); if (e === '0' || e === '1') out.envelope = e === '1';
    const m = oneOf(q.get('m'), ['adaptive', 'realtime'] as const); if (m) out.mode = m;
    const d = finite(q.get('d'), 0.01, 5); if (d !== undefined) out.dps = d;
    const c = q.get('c'); if (c === '0' || c === '1') out.coast = c === '1';
    const lg = oneOf(q.get('lang'), ['pl', 'en'] as const); if (lg) out.lang = lg;
    return out;
  } catch {
    return {};
  }
}
