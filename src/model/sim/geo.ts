/** Geometria na kuli (R = 6371 km). Współrzędne w stopniach; układ paleo (PALEOMAP). */
export const R_KM = 6371;
export const CIRCUMFERENCE_KM = 2 * Math.PI * R_KM;
export const ANTIPODE_KM = Math.PI * R_KM;

export interface LatLon { lat: number; lon: number }

const D2R = Math.PI / 180, R2D = 180 / Math.PI;

/** Odległość po wielkim kole [km] (wzór haversine). */
export function gcDistanceKm(a: LatLon, b: LatLon): number {
  const dLat = (b.lat - a.lat) * D2R, dLon = (b.lon - a.lon) * D2R;
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(a.lat * D2R) * Math.cos(b.lat * D2R) * Math.sin(dLon / 2) ** 2;
  return 2 * R_KM * Math.asin(Math.min(1, Math.sqrt(h)));
}

/** Azymut początkowy z a do b [°, 0 = N, zgodnie z ruchem wskazówek zegara]. */
export function azimuthDeg(a: LatLon, b: LatLon): number {
  const φ1 = a.lat * D2R, φ2 = b.lat * D2R, Δλ = (b.lon - a.lon) * D2R;
  const y = Math.sin(Δλ) * Math.cos(φ2);
  const x = Math.cos(φ1) * Math.sin(φ2) - Math.sin(φ1) * Math.cos(φ2) * Math.cos(Δλ);
  return (Math.atan2(y, x) * R2D + 360) % 360;
}

/** Punkt odległy o distKm w kierunku bearingDeg od a. */
export function destination(a: LatLon, bearingDeg: number, distKm: number): LatLon {
  const δ = distKm / R_KM, θ = bearingDeg * D2R, φ1 = a.lat * D2R, λ1 = a.lon * D2R;
  const φ2 = Math.asin(Math.sin(φ1) * Math.cos(δ) + Math.cos(φ1) * Math.sin(δ) * Math.cos(θ));
  const λ2 = λ1 + Math.atan2(Math.sin(θ) * Math.sin(δ) * Math.cos(φ1), Math.cos(δ) - Math.sin(φ1) * Math.sin(φ2));
  return { lat: φ2 * R2D, lon: ((λ2 * R2D + 540) % 360) - 180 };
}

/** Najmniejsza bezwzględna różnica kątów [0, 180]. */
export function angleDiffDeg(a: number, b: number): number {
  const d = Math.abs((((a - b) % 360) + 360) % 360);
  return d > 180 ? 360 - d : d;
}
