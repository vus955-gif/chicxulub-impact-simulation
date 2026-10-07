import { describe, it, expect } from 'vitest';
import { sampleGrid, gridFromBuffer } from '../src/model/sim/grid';

describe('EquirectGrid', () => {
  // 4×2: komórki 90°×90°; wiersz N: 1 2 3 4, wiersz S: 5 6 NaN 8
  const g = { w: 4, h: 2, data: new Float32Array([1, 2, 3, 4, 5, 6, NaN, 8]) };
  it('cell centre returns the cell value', () => {
    expect(sampleGrid(g, 45, -135)).toBeCloseTo(1, 9);
    expect(sampleGrid(g, -45, 135)).toBeCloseTo(8, 9);
  });
  it('wraps around the date line', () => {
    expect(sampleGrid(g, 45, 180)).toBeCloseTo(2.5, 9); // środek między kolumną 4 (135°) a 1 (−135°)
  });
  it('ignores NaN corners instead of propagating them', () => {
    expect(Number.isFinite(sampleGrid(g, -45, 45))).toBe(true);
  });
  it('rejects buffers of the wrong size', () => {
    expect(() => gridFromBuffer(new ArrayBuffer(12), 4, 2, 'f32')).toThrow('4×2');
  });
});
