/**
 * MODEL PREDYKCYJNY PROJEKTU (luka: głębokość wody w punkcie zero nieustalona; PaleoDEM pokazuje w tym miejscu ląd).
 * Rampa pogłębiająca się ku N/NE (Gulick i in. 2008; profil z paleobatymetrii Range i in. 2022, rys. S1),
 * płytka platforma na S/SW. Stosowana tylko w promieniu RAMP_MAX_KM od krateru; dalej obowiązuje mapa PaleoDEM.
 */
import type { SimContext } from '../sim/context';

export const RAMP_MAX_KM = 300;

const interp = (d: number, knots: Array<[number, number]>) => {
  if (d <= knots[0]![0]) return knots[0]![1];
  for (let i = 1; i < knots.length; i++) {
    const [d0, v0] = knots[i - 1]!, [d1, v1] = knots[i]!;
    if (d <= d1) return v0 + ((d - d0) / (d1 - d0)) * (v1 - v0);
  }
  return knots[knots.length - 1]![1];
};

/** Głębokość wody [m] w odległości d [km] i azymucie az [°] od krateru; undefined poza zasięgiem rampy. */
export function waterDepthM(ctx: SimContext, dKm: number, azDeg: number): number | undefined {
  if (dKm > RAMP_MAX_KM) return undefined;
  const r = ctx.reg;
  const z0 = r.num('tsunami.depth_impact_point');
  const north = interp(dKm, [[0, z0], [50, r.num('tsunami.depth_50km_north')], [150, r.num('tsunami.depth_150km')]]);
  const south = interp(dKm, [[0, z0], [50, r.num('target.water_depth_south')]]);
  const wN = Math.max(0, Math.cos(((azDeg - 22.5) * Math.PI) / 180)); // największa głębokość ku NNE
  return wN * north + (1 - wN) * south;
}
