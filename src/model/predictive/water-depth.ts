/**
 * MODEL PREDYKCYJNY PROJEKTU (luka: głębokość wody w punkcie zero nieustalona; PaleoDEM pokazuje w tym miejscu ląd).
 * Rampa pogłębiająca się ku N/NE (Gulick i in. 2008; profil z paleobatymetrii Range i in. 2022, rys. S1),
 * płytka platforma na S/SW. Stosowana tylko w promieniu RAMP_MAX_KM od krateru; dalej obowiązuje mapa PaleoDEM.
 */
import type { SimContext } from '../sim/context';
import { interpKnots } from '../sim/interp';

export const RAMP_MAX_KM = 300;

/** Głębokość wody [m] w odległości d [km] i azymucie az [°] od krateru; undefined poza zasięgiem rampy. */
export function waterDepthM(ctx: SimContext, dKm: number, azDeg: number): number | undefined {
  if (dKm > RAMP_MAX_KM) return undefined;
  const r = ctx.reg;
  const z0 = r.num('tsunami.depth_impact_point');
  const north = interpKnots(dKm, [[0, z0], [50, r.num('tsunami.depth_50km_north')], [150, r.num('tsunami.depth_150km')]]);
  const south = interpKnots(dKm, [[0, z0], [50, r.num('target.water_depth_south')]]);
  const wN = Math.max(0, Math.cos(((azDeg - 22.5) * Math.PI) / 180)); // największa głębokość ku NNE
  return wN * north + (1 - wN) * south;
}
