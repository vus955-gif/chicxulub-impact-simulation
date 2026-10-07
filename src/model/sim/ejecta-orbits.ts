/**
 * Trajektorie wyrzutów wysokoenergetycznych: orbity Keplera w układzie inercjalnym (μ = g R², jak EIEP) z ruchem
 * obrotowym Ziemi (doba gwiazdowa z rejestru), ponowne wejście w warstwę nagrzewaną przez powracające wyrzuty.
 *
 * Układ współrzędnych jak w widokach: x = cosφ cosλ, y = sinφ (oś obrotu = biegun paleo PALEOMAP), z = −cosφ sinλ.
 * Układ inercjalny pokrywa się z ziemskim w T = 0; Ziemia obraca się wokół +y (na wschód).
 *
 * Losowanie (MODEL PREDYKCYJNY PROJEKTU △ — rozkład, nie pojedyncze trajektorie z literatury):
 *  – zasięg: logarytmicznie równomiernie od ~800 km do antypodów (bliżej — kurtyna ejecta przy kraterze); kierunek z przewagą „z biegiem lotu”,
 *    a dalej niż 3000 km ze słabą obsadą sektora „pod bieg” (Morgan i in. 2013: tam impuls IR pomijalny;
 *    Artemieva & Morgan 2020: warstwa dystalna z chmury pyłu, nie z balistyki);
 *  – kąt wyrzutu: od kąta, przy którym czas lotu = czas pierwszego dotarcia z literatury (ejectaArrival),
 *    do kąta maksymalnego — dzięki temu najszybsze cząstki odtwarzają front, a wolniejsze „deszcz” po nim;
 *  – ułamek uciekających z Ziemi — z rejestru (ejecta.escape_fraction), orbity hiperboliczne.
 */
import { G_EARTH, R_EARTH } from '../eiep/constants';
import type { SimContext } from './context';
import { ejectaArrival } from './arrivals';
import { angleDiffDeg } from './geo';
import { mulberry32 } from './rng';
import type { PlayMode } from '../../time/playback';

type V3 = [number, number, number];
const R = R_EARTH / 1e3; // km
const MU = (G_EARTH / 1e3) * R * R; // km³/s²
const dot = (a: V3, b: V3) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
const cross = (a: V3, b: V3): V3 => [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]];
const scale = (a: V3, s: number): V3 => [a[0] * s, a[1] * s, a[2] * s];
const add = (a: V3, b: V3): V3 => [a[0] + b[0], a[1] + b[1], a[2] + b[2]];
const norm = (a: V3) => Math.hypot(a[0], a[1], a[2]);
const unit = (a: V3): V3 => scale(a, 1 / norm(a));
/** obrót wokół osi y o kąt θ (prawoskrętny) */
const rotY = (a: V3, th: number): V3 => { const c = Math.cos(th), s = Math.sin(th); return [a[0] * c + a[2] * s, a[1], -a[0] * s + a[2] * c]; };

export const llToV3 = (lat: number, lon: number): V3 => {
  const f = (lat * Math.PI) / 180, l = (lon * Math.PI) / 180;
  return [Math.cos(f) * Math.cos(l), Math.sin(f), -Math.cos(f) * Math.sin(l)];
};
export const v3ToLl = (v: V3): { lat: number; lon: number } => {
  const n = unit(v);
  return { lat: (Math.asin(Math.max(-1, Math.min(1, n[1]))) * 180) / Math.PI, lon: (Math.atan2(-n[2], n[0]) * 180) / Math.PI };
};

export interface EjectaParticle {
  t0: number;           // chwila wyrzutu [s]
  hyper: boolean;       // ucieka z Ziemi
  a: number; e: number; n: number; M0: number; // półoś [km] (ujemna dla hiperboli), mimośród, ruch średni [rad/s], anomalia średnia przy wyrzucie
  P: V3; Q: V3;         // baza płaszczyzny orbity (kierunek perycentrum, prostopadły w kierunku ruchu)
  tRe: number;          // chwila ponownego wejścia w warstwę rRe (Infinity dla uciekających)
  reLat: number; reLon: number; // miejsce ponownego wejścia (układ ziemski, paleo)
  rangeKm: number;      // zasięg nominalny (bez obrotu) — do koloru/rozmiaru
  speed: number;        // prędkość wyrzutu względem gruntu [km/s]
}

export interface OrbitParams { omega: number; rRe: number }

export function orbitParams(ctx: SimContext): OrbitParams {
  return { omega: (2 * Math.PI) / ctx.reg.num('paleo.sidereal_day'), rRe: R + ctx.reg.num('ejecta.reentry_layer_altitude') };
}

/** Elementy orbity z wektora stanu (inercjalnie); zwraca też anomalię średnią w chwili stanu. */
function elements(r: V3, v: V3) {
  const rn = norm(r), vn = norm(v);
  const h = cross(r, v);
  const eVec = add(scale(cross(v, h), 1 / MU), scale(r, -1 / rn));
  const e = norm(eVec);
  const a = 1 / (2 / rn - (vn * vn) / MU);
  const P = e > 1e-9 ? unit(eVec) : unit(r);
  const Q = unit(cross(unit(h), P));
  const cosNu = Math.max(-1, Math.min(1, dot(P, r) / rn));
  let nu = Math.acos(cosNu);
  if (dot(r, v) < 0) nu = 2 * Math.PI - nu;
  if (e < 1) {
    const E = 2 * Math.atan2(Math.sqrt(1 - e) * Math.sin(nu / 2), Math.sqrt(1 + e) * Math.cos(nu / 2));
    const M = E - e * Math.sin(E);
    return { a, e, P, Q, n: Math.sqrt(MU / (a * a * a)), M0: M, hyper: false };
  }
  const nuS = nu > Math.PI ? nu - 2 * Math.PI : nu;
  const H = 2 * Math.atanh(Math.sqrt((e - 1) / (e + 1)) * Math.tan(nuS / 2));
  return { a, e, P, Q, n: Math.sqrt(MU / (-a * -a * -a)), M0: e * Math.sinh(H) - H, hyper: true };
}

/** Położenie inercjalne [km] po upływie dt od chwili wyrzutu. */
function inertialAt(p: EjectaParticle, dt: number): V3 {
  const M = p.M0 + p.n * dt;
  if (!p.hyper) {
    let E = M;
    for (let i = 0; i < 14; i++) E -= (E - p.e * Math.sin(E) - M) / (1 - p.e * Math.cos(E));
    const x = p.a * (Math.cos(E) - p.e), y = p.a * Math.sqrt(1 - p.e * p.e) * Math.sin(E);
    return add(scale(p.P, x), scale(p.Q, y));
  }
  let H = Math.asinh(M / p.e);
  for (let i = 0; i < 20; i++) H -= (p.e * Math.sinh(H) - H - M) / (p.e * Math.cosh(H) - 1);
  const A = -p.a;
  const x = A * (p.e - Math.cosh(H)), y = A * Math.sqrt(p.e * p.e - 1) * Math.sinh(H);
  return add(scale(p.P, x), scale(p.Q, y));
}

/**
 * Położenie w układzie ziemskim [km] w chwili t; null, gdy cząstka nie leci (przed wyrzutem / po wejściu).
 * Wersja wzorcowa (prosta, z alokacją) — testy sprawdzają nią szybką particleAtInto.
 */
export function particleAt(p: EjectaParticle, t: number, op: OrbitParams): V3 | null {
  if (t <= p.t0 || t >= p.tRe) return null;
  return rotY(inertialAt(p, t - p.t0), -op.omega * t);
}

/**
 * Szybka wersja particleAt do pętli klatki: bez alokacji, Newton z wczesnym zakończeniem.
 * Zapisuje x, y, z [km] do out[o..o+2]; zwraca false, gdy cząstka nie leci.
 */
export function particleAtInto(p: EjectaParticle, t: number, op: OrbitParams, out: Float32Array | number[], o: number): boolean {
  if (t <= p.t0 || t >= p.tRe) return false;
  const M = p.M0 + p.n * (t - p.t0);
  let x: number, y: number;
  if (!p.hyper) {
    let E = M + p.e * Math.sin(M);
    for (let i = 0; i < 12; i++) { const d = (E - p.e * Math.sin(E) - M) / (1 - p.e * Math.cos(E)); E -= d; if (Math.abs(d) < 1e-10) break; }
    x = p.a * (Math.cos(E) - p.e); y = p.a * Math.sqrt(1 - p.e * p.e) * Math.sin(E);
  } else {
    let H = Math.asinh(M / p.e);
    for (let i = 0; i < 20; i++) { const d = (p.e * Math.sinh(H) - H - M) / (p.e * Math.cosh(H) - 1); H -= d; if (Math.abs(d) < 1e-10) break; }
    const A = -p.a;
    x = A * (p.e - Math.cosh(H)); y = A * Math.sqrt(p.e * p.e - 1) * Math.sinh(H);
  }
  const ix = p.P[0] * x + p.Q[0] * y, iy = p.P[1] * x + p.Q[1] * y, iz = p.P[2] * x + p.Q[2] * y;
  const th = -op.omega * t, c = Math.cos(th), sn = Math.sin(th);
  out[o] = ix * c + iz * sn; out[o + 1] = iy; out[o + 2] = -ix * sn + iz * c;
  return true;
}

/** Indeksy cząstek posortowane wg chwili ponownego wejścia (do szybkiego wyboru świecących rozbłysków). */
export function sortByReentry(ps: EjectaParticle[]): Int32Array {
  const idx = Array.from(ps.keys()).filter((i) => Number.isFinite(ps[i]!.tRe)).sort((a, b) => ps[a]!.tRe - ps[b]!.tRe);
  return Int32Array.from(idx);
}

/** Zakres [lo, hi) w posortowanych indeksach: cząstki, których wejście nastąpiło w oknie [tFrom, tTo]. */
export function reentryWindow(ps: EjectaParticle[], order: Int32Array, tFrom: number, tTo: number): [number, number] {
  const lb = (x: number) => { let lo = 0, hi = order.length; while (lo < hi) { const m = (lo + hi) >> 1; if (ps[order[m]!]!.tRe < x) lo = m + 1; else hi = m; } return lo; };
  return [lb(tFrom), lb(tTo + 1e-9)];
}

/** Okno chwil wejścia, dla których rozbłysk w chwili t ma wiek w [0, life) sekund ekranu. */
export function flashWindow(t: number, life: number, mode: PlayMode, dps: number): [number, number] {
  if (t <= 0) return [Infinity, -Infinity];
  return mode === 'realtime' ? [t - life, t] : [t / 10 ** (life * Math.max(1e-6, dps)), t];
}

/** Wektor stanu startu (układ inercjalny) dla wyrzutu z krateru pod kątem φ, w azymucie az, z prędkością v względem gruntu. */
function launchState(crater: V3, azDeg: number, phiDeg: number, v: number, t0: number, op: OrbitParams, inertial = false): { r: V3; v: V3 } {
  const up = rotY(crater, op.omega * t0);
  const east = unit(cross([0, 1, 0], up));
  const north = cross(up, east);
  const az = (azDeg * Math.PI) / 180, ph = (phiDeg * Math.PI) / 180;
  const hor = add(scale(north, Math.cos(az)), scale(east, Math.sin(az)));
  const vRel = add(scale(hor, v * Math.cos(ph)), scale(up, v * Math.sin(ph)));
  const r = scale(up, R);
  if (inertial) return { r, v: vRel }; // prędkość zadana w układzie inercjalnym (obrót już w niej zawarty)
  const vRot = cross([0, op.omega, 0], r);
  return { r, v: add(vRel, vRot) };
}

/** Prędkość dla zasięgu (kąt Δ) przy kącie wyrzutu φ, kula nierotująca: tan(Δ/2) = ν sinφ cosφ / (1 − ν cos²φ). */
export function speedForRange(rangeKm: number, phiDeg: number): number | null {
  const D = rangeKm / R, ph = (phiDeg * Math.PI) / 180, T = Math.tan(D / 2);
  const nu = T / (Math.sin(ph) * Math.cos(ph) + T * Math.cos(ph) ** 2);
  return nu > 0 && nu < 1.98 ? Math.sqrt(nu * MU / R) : null;
}

/** Czas lotu do warstwy rRe dla zasięgu i kąta (kula nierotująca); null, gdy orbita nie istnieje. */
export function flightTimeTo(rangeKm: number, phiDeg: number, rRe: number): number | null {
  const v = speedForRange(rangeKm, phiDeg);
  if (v === null) return null;
  const st = launchState([1, 0, 0], 0, phiDeg, v, 0, { omega: 0, rRe });
  const el = elements(st.r, st.v);
  if (el.hyper || el.a * (1 + el.e) < rRe) return null;
  const cosE = (1 - rRe / el.a) / el.e;
  if (cosE < -1 || cosE > 1) return null;
  const Ere = 2 * Math.PI - Math.acos(cosE);
  return (Ere - el.e * Math.sin(Ere) - el.M0) / el.n;
}

/**
 * Geometria ponownego wejścia (kula nierotująca, analitycznie): dla ν = v²/(gR) i kąta φ — odległość po powierzchni
 * od krateru do punktu, w którym cząstka schodzi do promienia rRe, oraz czas lotu do tej chwili.
 * Orbita: p = R ν cos²φ, e² = 1 − ν(2−ν)cos²φ, apocentrum w anomalii π.
 */
export function reentryGeometry(nu: number, phiDeg: number, rRe: number): { dKm: number; tS: number } | null {
  const c2 = Math.cos((phiDeg * Math.PI) / 180) ** 2;
  const pp = R * nu * c2, e = Math.sqrt(Math.max(0, 1 - nu * (2 - nu) * c2)), a = R / (2 - nu);
  if (nu <= 0 || nu >= 2 || e < 1e-9 || a * (1 + e) <= rRe) return null;
  const cL = (pp / R - 1) / e, cR = (pp / rRe - 1) / e;
  if (Math.abs(cL) > 1 || Math.abs(cR) > 1) return null;
  const thL = Math.acos(cL), thR = 2 * Math.PI - Math.acos(cR);
  const E = (th: number) => 2 * Math.atan2(Math.sqrt(1 - e) * Math.sin(th / 2), Math.sqrt(1 + e) * Math.cos(th / 2));
  const M = (th: number) => { const x = E(th); return x - e * Math.sin(x); };
  const Mre = M(thR) < M(thL) ? M(thR) + 2 * Math.PI : M(thR);
  return { dKm: (thR - thL) * R, tS: (Mre - M(thL)) / Math.sqrt(MU / (a * a * a)) };
}

/** ν, przy którym punkt wejścia leży w odległości dKm (bisekcja; odległość rośnie z ν przy stałym kącie). */
function nuForReentry(dKm: number, phiDeg: number, rRe: number): number | null {
  let lo = 1e-4, hi = 1.98;
  const D = (nu: number) => reentryGeometry(nu, phiDeg, rRe)?.dKm ?? 0;
  if (D(hi) < dKm) return null;
  for (let i = 0; i < 34; i++) { const m = (lo + hi) / 2; if (D(m) < dKm) lo = m; else hi = m; }
  const nu = (lo + hi) / 2;
  // przy płaskim kącie orbita sięga warstwy dopiero przy dużym ν — wtedy wejście leży od razu daleko (skok D od 0);
  // bisekcja zbiega wówczas do progu, a nie do rozwiązania: odrzucamy
  return Math.abs(D(nu) - dKm) <= 0.01 * dKm ? nu : null;
}

/** Czas lotu do wejścia w odległości dKm przy kącie φ (Infinity, gdy nieosiągalne). */
const timeAtAngle = (dKm: number, phiDeg: number, rRe: number) => {
  const nu = nuForReentry(dKm, phiDeg, rRe);
  return nu === null ? Infinity : reentryGeometry(nu, phiDeg, rRe)?.tS ?? Infinity;
};

/** Kąt φ, przy którym czas lotu = tTarget (bisekcja; czas rośnie z kątem przy stałej odległości wejścia). */
function angleForTime(dKm: number, tTarget: number, rRe: number, phiLo: number, phiHi: number): number {
  let lo = phiLo;
  const hi0 = phiHi;
  while (lo < hi0 && !Number.isFinite(timeAtAngle(dKm, lo, rRe))) lo += 1; // najniższy wykonalny kąt dla tej odległości
  let hi = hi0;
  if (timeAtAngle(dKm, lo, rRe) >= tTarget) return lo;
  if (timeAtAngle(dKm, hi, rRe) <= tTarget) return hi;
  for (let i = 0; i < 26; i++) { const m = (lo + hi) / 2; if (timeAtAngle(dKm, m, rRe) < tTarget) lo = m; else hi = m; }
  return (lo + hi) / 2;
}

/**
 * Zbudowanie cząstki z parametrów startu: elementy orbity, chwila i miejsce ponownego wejścia.
 * inertial = false: v to prędkość względem gruntu (obrót Ziemi dodawany); true: v zadane w układzie inercjalnym.
 */
export function makeParticle(crater: V3, azDeg: number, phiDeg: number, v: number, t0: number, op: OrbitParams, rangeKm: number, inertial = false): EjectaParticle | null {
  const st = launchState(crater, azDeg, phiDeg, v, t0, op, inertial);
  const el = elements(st.r, st.v);
  const vGround = norm(add(st.v, scale(cross([0, op.omega, 0], st.r), -1)));
  const base = { t0, hyper: el.hyper, a: el.a, e: el.e, n: el.n, M0: el.M0, P: el.P, Q: el.Q, rangeKm, speed: vGround };
  if (el.hyper) return { ...base, tRe: Infinity, reLat: NaN, reLon: NaN };
  if (el.a * (1 + el.e) < op.rRe) return null; // nie opuszcza atmosfery
  const cosE = (1 - op.rRe / el.a) / el.e;
  if (cosE < -1 || cosE > 1) return null;
  const Ere = 2 * Math.PI - Math.acos(cosE);
  const tRe = t0 + (Ere - el.e * Math.sin(Ere) - el.M0) / el.n;
  const p: EjectaParticle = { ...base, tRe, reLat: 0, reLon: 0 };
  const re = rotY(inertialAt(p, tRe - t0), -op.omega * tRe);
  const ll = v3ToLl(re);
  p.reLat = ll.lat; p.reLon = ll.lon;
  return p;
}

export function sampleEjecta(ctx: SimContext, count: number, seed = 66052): EjectaParticle[] {
  const r = ctx.reg, op = orbitParams(ctx);
  const rand = mulberry32(seed);
  const crater = llToV3(ctx.crater.lat, ctx.crater.lon);
  const escapeFrac = r.num('ejecta.escape_fraction') / 100;
  const phiMax = r.num('ejecta.launch_angle_max_pred');
  const upWeight = r.num('ejecta.uprange_far_weight_pred');
  const tWin = r.num('ejecta.launch_window_pred');
  const vEsc = Math.sqrt((2 * MU) / R);
  // od ~800 km: bliższe wyrzuty to kurtyna przy kraterze (zbliżenie 3D), na globie zlewałyby się w jedną plamę
  const dMin = 800, dMax = Math.PI * R * 0.985;
  // kąt „frontu” na siatce odległości (raz): przy nim czas lotu = pierwsze dotarcie z literatury
  const K = 40, grid = Array.from({ length: K }, (_, i) => Math.exp(Math.log(dMin) + (i / (K - 1)) * (Math.log(dMax) - Math.log(dMin))));
  const phiGrid = grid.map((d) => angleForTime(d, Math.max(30, ejectaArrival(ctx, d).t - tWin / 2), op.rRe, 3, phiMax));
  const phiFrontAt = (d: number) => {
    const u = ((Math.log(d) - Math.log(dMin)) / (Math.log(dMax) - Math.log(dMin))) * (K - 1);
    const i = Math.min(K - 2, Math.max(0, Math.floor(u)));
    return phiGrid[i]! + (u - i) * (phiGrid[i + 1]! - phiGrid[i]!);
  };
  const out: EjectaParticle[] = [];
  const nEsc = Math.round(count * escapeFrac);
  // uciekające (ułamek z rejestru): prędkość ponad ucieczkową, kierunek z przewagą „z biegiem lotu”
  for (let guard = 0; out.length < nEsc && guard < nEsc * 5; guard++) {
    const az = ctx.downrangeAzDeg + (rand() - 0.5) * 180;
    const p = makeParticle(crater, az, 20 + rand() * 45, vEsc * (1.01 + 0.25 * rand()), rand() * tWin, op, Infinity);
    if (p) out.push(p);
  }
  let guard = 0;
  while (out.length < count && guard++ < count * 20) {
    const t0 = rand() * tWin;
    const d = Math.exp(Math.log(dMin) + rand() * (Math.log(dMax) - Math.log(dMin)));
    const az = rand() * 360;
    const rel = Math.abs(angleDiffDeg(az, ctx.downrangeAzDeg));
    // gęstość względem kierunku lotu: łagodna przewaga z biegiem lotu; dalej niż 3000 km sektor „pod bieg” słabo obsadzony
    const w = d <= 3000 ? 0.75 + 0.25 * Math.cos((rel * Math.PI) / 180) : rel <= 90 ? 1 : 1 - (1 - upWeight) * Math.min(1, (rel - 90) / 60);
    if (rand() > w) continue;
    const phiFront = phiFrontAt(d);
    const phi = phiFront + rand() ** 1.6 * (phiMax - phiFront);
    const nu = nuForReentry(d, phi, op.rRe);
    if (nu === null) continue;
    // rozkład prędkości zadany inercjalnie (tak liczony jest front); Ziemia obraca się pod cząstką w locie
    const p = makeParticle(crater, az, phi, Math.sqrt((nu * MU) / R), t0, op, d, true);
    if (p) out.push(p);
  }
  return out;
}

/** Wiek rozbłysku w „sekundach ekranu” (deterministycznie z t i trybu odtwarzania): ujemny przed wejściem. */
export function flashScreenAge(t: number, tRe: number, mode: PlayMode, dps: number): number {
  if (!Number.isFinite(tRe)) return -1;
  if (mode === 'realtime') return t - tRe;
  return t <= 0 ? -1 : Math.log10(t / tRe) / Math.max(1e-6, dps);
}

/** Czas życia rozbłysku ponownego wejścia [s ekranu] — symbol, wspólny dla mapy i globu. */
export const FLASH_LIFE_S = 0.4;

/** Jasność rozbłysku 0…1 od jego wieku w sekundach ekranu: szybkie zapalenie, potem kwadratowe wygaszanie. */
export function flashLevel(age: number): number {
  if (age < 0 || age >= FLASH_LIFE_S) return 0;
  return age < 0.06 ? age / 0.06 : (1 - (age - 0.06) / (FLASH_LIFE_S - 0.06)) ** 2;
}

/** Zakres [lo, hi) w `order` (sortByReentry): cząstki, których rozbłysk świeci w chwili t. */
export function litFlashRange(ps: EjectaParticle[], order: Int32Array, t: number, mode: PlayMode, dps: number): [number, number] {
  const [tFrom, tTo] = flashWindow(t, FLASH_LIFE_S, mode, dps);
  return reentryWindow(ps, order, tFrom, tTo);
}

