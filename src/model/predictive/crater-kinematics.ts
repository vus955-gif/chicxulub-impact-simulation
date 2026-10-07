/**
 * MODEL PREDYKCYJNY PROJEKTU — kinematyka formowania krateru (luka: brak publicznych pól przemieszczeń hydrokodu
 * w postaci liczbowej; literatura podaje migawki i wielkości w chwilach kluczowych).
 *
 * Klatki kluczowe (◐/●, z rejestru): krater przejściowy (średnica, głębokość, czas maksimum), początek kolapsu,
 * wypiętrzenie centralne (wysokość, czas maksimum), pierścień szczytowy (średnica, wysokość, czas), krater końcowy
 * (średnica, krawędź wewnętrzna, głębokość dna, czas), końcowe wypiętrzenie strukturalne i wypiętrzenie Moho.
 * Kształt MIĘDZY klatkami (△) to interpolacja kinematyczna:
 *  – wykop: promień jamy ∝ (t/t_tr)^0,4 (wzrost w reżimie grawitacyjnym), profil paraboliczny z wałem;
 *  – wypiętrzenie: dno jamy podnosi się gładko do maksimum wypiętrzenia centralnego;
 *  – zapadanie i modyfikacja: płynne przejście profilu do stanu z uformowanym pierścieniem i do krateru końcowego;
 *  – horyzonty skał: przemieszczenie zanika wykładniczo z głębokością; końcowe wypiętrzenie strukturalne dopasowane
 *    do dwóch kotwic (skały z ~10 km na powierzchni w centrum, Moho +1,5 km).
 * Pominięte: asymetria uderzenia ukośnego (przesunięcia pierścienia i wypiętrzenia płaszcza — w rejestrze jako fakty),
 * tarasy i megabloki, porowatość, odbicie izostatyczne po 1. dobie.
 * Jednostki: km, s. z dodatnie w górę; 0 = pierwotna powierzchnia celu (dno morskie przed uderzeniem).
 */
import type { RegistryIndex } from '../sim/registry-client';

export interface CraterKeyframes {
  Rt: number; Dt: number; tD: number; tTr: number; tCo: number;
  Hu: number; tU: number; tPR: number; Rpr: number; hPR: number; wPR: number;
  tF: number; Rf: number; Rin: number; Df: number;
  SU: number; MU: number; Hs: number; Hc: number;
  Rm: number; Tm: number;
  tSea: number; tCrest: number; tSettle: number;
}

export function craterKeyframes(reg: RegistryIndex): CraterKeyframes {
  const n = (id: string) => reg.num(id);
  const tD = reg.param('crater.transient_depth').time?.t ?? n('crater.t_transient_max');
  return {
    Rt: n('crater.transient_diameter') / 2, Dt: n('crater.transient_depth'), tD, tTr: n('crater.t_transient_max'),
    tCo: n('crater.t_collapse_onset'),
    Hu: n('crater.central_uplift_max_height'), tU: n('crater.t_uplift_max'),
    tPR: n('crater.t_peak_ring'), Rpr: n('crater.peak_ring_diameter') / 2, hPR: n('crater.peak_ring_height') / 1000,
    wPR: n('crater.peak_ring_width'),
    tF: n('crater.t_final'), Rf: n('crater.final_diameter') / 2, Rin: n('crater.inner_rim_radius'), Df: n('crater.floor_depth') / 1000,
    SU: n('crust.central_structural_uplift'), MU: n('crust.moho_uplift'),
    Hs: n('target.sediment_thickness'), Hc: n('target.crust_thickness'),
    Rm: n('crater.melt_sheet_diameter') / 2, Tm: n('crater.melt_sheet_thickness'),
    tSea: n('crater.t_first_seawater_peak_ring'), tCrest: n('crater.t_resurge_crest_peak_ring'), tSettle: n('crater.t_resurge_settling'),
  };
}

export type CraterPhase = 'pre' | 'excavation' | 'uplift' | 'collapse' | 'modification' | 'final';

export interface CraterState {
  t: number;
  phase: CraterPhase;
  /** promień jamy (krawędź aktywnego krateru) [km] */
  cavityRadius: number;
  /** wysokość powierzchni nad pierwotnym dnem morskim w odległości r [km] */
  surface(r: number): number;
  /** położenie pierwotnie poziomego horyzontu z głębokości d0 [km] (bez ograniczenia przez powierzchnię) */
  horizon(d0: number, r: number): number;
  /** czy pokrywa osadowa jest w odległości r obecna (wewnątrz strefy wykopu została wyrzucona/odparowana) */
  sedimentPresent(r: number): boolean;
  /** miąższość stopu impaktowego na dnie w odległości r [km] */
  melt(r: number): number;
  /** postęp wypiętrzenia strukturalnego 0…1 */
  structural: number;
}

const clamp01 = (x: number) => Math.min(1, Math.max(0, x));
const smooth = (x: number) => { const u = clamp01(x); return u * u * (3 - 2 * u); };
const lerp = (a: number, b: number, s: number) => a + (b - a) * s;

/** Wysokość wału jamy przejściowej: ~4% średnicy (typowa proporcja dla kraterów przejściowych) — △. */
const RIM_FRACTION = 0.04;
/** Szerokość wypiętrzenia centralnego jako ułamek promienia jamy przejściowej — △. */
const UPLIFT_WIDTH = 0.3;
/** Relief w chwili uformowania pierścienia względem stanu końcowego (dalsze osiadanie w fazie modyfikacji) — △. */
const PEAK_RING_RELIEF = 2.5;

/** Profil paraboliczny jamy z wałem (ciągły na krawędzi) + wypiętrzenie centralne. */
function bowl(r: number, R: number, D: number, hr: number, U: number, wU: number): number {
  const base = R <= 0 ? 0 : r < R ? -D * (1 - (r / R) ** 2) + hr * (r / R) ** 2 : hr * (R / r) ** 3;
  return base + U * Math.exp(-((r / wU) ** 2));
}

/** Profil końcowy: dno, pierścień szczytowy nad dnem, strefa tarasów do krawędzi, płasko poza kraterem. */
function finalProfile(k: CraterKeyframes, r: number): number {
  const ring = k.hPR * Math.exp(-(((r - k.Rpr) / (k.wPR / 2)) ** 2));
  if (r <= k.Rin) return -k.Df + ring;
  if (r < k.Rf) return -k.Df * ((k.Rf - r) / (k.Rf - k.Rin)) + ring;
  return 0;
}

export function craterAt(k: CraterKeyframes, t: number): CraterState {
  const hrT = RIM_FRACTION * 2 * k.Rt;
  const wU = UPLIFT_WIDTH * k.Rt;
  const radius = (tt: number) => k.Rt * Math.min(1, Math.max(0, tt) / k.tTr) ** 0.4;

  // parametry jamy i wypiętrzenia do chwili maksimum wypiętrzenia
  const sU = smooth((t - k.tCo) / (k.tU - k.tCo));
  const D = t <= k.tD ? k.Dt * Math.min(1, Math.max(0, t) / k.tD) ** 0.4 : k.Dt * (1 - 0.5 * sU);
  const R = radius(t);
  const hr = RIM_FRACTION * 2 * R;
  const zc = t <= k.tCo ? -D : lerp(-k.Dt, k.Hu, sU); // wysokość środka
  const U = t <= k.tCo ? 0 : zc + D;

  const pAtUplift = (r: number) => {
    const Dm = k.Dt * 0.5;
    return bowl(r, k.Rt, Dm, hrT, k.Hu + Dm, wU);
  };
  const pRing = (r: number) => PEAK_RING_RELIEF * finalProfile(k, r);

  let phase: CraterPhase;
  let surface: (r: number) => number;
  let cavityRadius: number;
  if (t <= 0) { phase = 'pre'; surface = () => 0; cavityRadius = 0; }
  else if (t <= k.tU) {
    phase = t <= k.tTr ? 'excavation' : 'uplift'; // od t_collapse dno już się podnosi, ale krawędź rośnie do t_tr
    surface = (r) => bowl(r, R, D, hr, U, wU);
    cavityRadius = R;
  } else if (t <= k.tPR) {
    phase = 'collapse';
    const s = smooth((t - k.tU) / (k.tPR - k.tU));
    surface = (r) => lerp(pAtUplift(r), pRing(r), s);
    cavityRadius = lerp(k.Rt, k.Rin, s);
  } else if (t <= k.tF) {
    phase = 'modification';
    const s = smooth((t - k.tPR) / (k.tF - k.tPR));
    surface = (r) => lerp(pRing(r), finalProfile(k, r), s);
    cavityRadius = lerp(k.Rin, k.Rf, s);
  } else { phase = 'final'; surface = (r) => finalProfile(k, r); cavityRadius = k.Rf; }

  // wypiętrzenie strukturalne: narasta od początku kolapsu do pierścienia; kotwice: SU dla skał z SU km, MU dla Moho
  const structural = t <= k.tCo ? 0 : smooth((t - k.tCo) / (k.tPR - k.tCo));
  const lam = (k.Hc - k.SU) / Math.log(k.SU / k.MU);
  const wS = k.Rpr; // zasięg wypiętrzenia strukturalnego ~ wnętrze pierścienia — △
  const structAt = (d0: number, r: number) => (d0 <= k.SU ? k.SU : k.SU * Math.exp(-(d0 - k.SU) / lam)) * Math.exp(-((r / wS) ** 2)) * structural;

  const horizon = (d0: number, r: number) => {
    const topo = surface(r) * Math.exp(-d0 / k.Dt); // przemieszczenie powierzchni przenoszone w głąb z zanikiem
    return -d0 + topo + structAt(d0, r);
  };

  const sedimentPresent = (r: number) => {
    if (t <= 0) return true;
    if (t <= k.tU) return r >= R;
    return r >= Math.min(cavityRadius, k.Rin); // osady ześlizgnięte w strefę tarasów zostają poza krawędzią wewnętrzną
  };

  const melt = (r: number) => {
    if (t <= 0) return 0;
    const lining = r < cavityRadius ? 0.4 * (1 - (r / Math.max(cavityRadius, 1e-6)) ** 2) : 0; // stop wyściełający jamę
    const lens = r < k.Rm ? k.Tm * (1 - (r / k.Rm) ** 2) : 0; // soczewka stopu w basenie centralnym
    const s = smooth((t - k.tTr) / (k.tF - k.tTr));
    return Math.max(lining * (1 - s), lens * s);
  };

  return { t, phase, cavityRadius, surface, horizon, sedimentPresent, melt, structural };
}

/** Poziom wody w basenie krateru (względem poziomu morza = 0) i zasięg powrotu wody — △, czasy z rejestru. */
export interface CraterWater { inflowRadius: number; basinLevel: number | null }

export function craterWaterAt(k: CraterKeyframes, t: number, floorBelowSea: number): CraterWater {
  if (t <= 0) return { inflowRadius: 0, basinLevel: 0 };
  if (t < k.tF) return { inflowRadius: Number.POSITIVE_INFINITY, basinLevel: null }; // woda wypchnięta poza krater
  if (t < k.tSea) return { inflowRadius: lerp(k.Rf, k.Rpr, smooth((t - k.tF) / (k.tSea - k.tF))), basinLevel: null };
  const s = smooth((t - k.tSea) / (k.tSettle - k.tSea));
  return { inflowRadius: 0, basinLevel: lerp(-floorBelowSea, 0, s) };
}
