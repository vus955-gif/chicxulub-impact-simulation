/** Siatki równoprostokątne: wiersze N→S (środek pierwszego wiersza: 90 − Δ/2), kolumny od −180° (środek: −180 + Δ/2). */
export interface EquirectGrid { w: number; h: number; data: ArrayLike<number> }

export function gridFromBuffer(buf: ArrayBuffer, w: number, h: number, type: 'f32' | 'i16'): EquirectGrid {
  const data = type === 'f32' ? new Float32Array(buf) : new Int16Array(buf);
  if (data.length !== w * h) throw new Error(`Siatka ${w}×${h}: oczekiwano ${w * h} wartości, jest ${data.length}`);
  return { w, h, data };
}

/** Interpolacja dwuliniowa z zawijaniem długości; komórki NaN pomijane (średnia ważona pozostałych narożników). */
export function sampleGrid(g: EquirectGrid, lat: number, lon: number): number {
  const fy = ((90 - lat) / 180) * g.h - 0.5;
  const fx = ((((lon + 180) % 360) + 360) % 360 / 360) * g.w - 0.5;
  const y0 = Math.max(0, Math.min(g.h - 1, Math.floor(fy))), y1 = Math.max(0, Math.min(g.h - 1, y0 + 1));
  const x0 = ((Math.floor(fx) % g.w) + g.w) % g.w, x1 = (x0 + 1) % g.w;
  const ty = Math.max(0, Math.min(1, fy - Math.floor(fy))), tx = fx - Math.floor(fx);
  const corners: Array<[number, number]> = [
    [g.data[y0 * g.w + x0]!, (1 - tx) * (1 - ty)], [g.data[y0 * g.w + x1]!, tx * (1 - ty)],
    [g.data[y1 * g.w + x0]!, (1 - tx) * ty], [g.data[y1 * g.w + x1]!, tx * ty],
  ];
  let s = 0, ws = 0;
  for (const [v, w] of corners) if (Number.isFinite(v)) { s += v * w; ws += w; }
  if (ws > 0) return s / ws;
  return nearestFinite(g, Math.round(fy), Math.round(fx), 3);
}

/** Najbliższa wartość skończona w promieniu maxR komórek (np. punkt na wybrzeżu przy siatce oceanicznej). */
export function nearestFinite(g: EquirectGrid, row: number, col: number, maxR: number): number {
  for (let r = 0; r <= maxR; r++) {
    let best = NaN, bestD = Infinity;
    for (let dy = -r; dy <= r; dy++) for (let dx = -r; dx <= r; dx++) {
      if (Math.max(Math.abs(dy), Math.abs(dx)) !== r) continue;
      const y = row + dy;
      if (y < 0 || y >= g.h) continue;
      const v = g.data[y * g.w + ((((col + dx) % g.w) + g.w) % g.w)]!;
      const d = dy * dy + dx * dx;
      if (Number.isFinite(v) && d < bestD) { best = v; bestD = d; }
    }
    if (Number.isFinite(best)) return best;
  }
  return NaN;
}
