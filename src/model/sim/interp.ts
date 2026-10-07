/**
 * Interpolacja odcinkowo liniowa po węzłach [x, y] (x rosnące); poza zakresem — wartość skrajnego węzła.
 * xScale 'log': liniowo w log x (wielkości rozciągnięte na rzędy wielkości, np. odległość, czas).
 */
export function interpKnots(x: number, knots: ReadonlyArray<readonly [number, number]>, xScale: 'lin' | 'log' = 'lin'): number {
  if (x <= knots[0]![0]) return knots[0]![1];
  const f = xScale === 'log' ? Math.log : (v: number) => v;
  for (let i = 1; i < knots.length; i++) {
    const [x0, y0] = knots[i - 1]!, [x1, y1] = knots[i]!;
    if (x <= x1) return y0 + ((f(x) - f(x0)) / (f(x1) - f(x0))) * (y1 - y0);
  }
  return knots[knots.length - 1]![1];
}
