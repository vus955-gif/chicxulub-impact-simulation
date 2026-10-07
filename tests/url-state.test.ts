import { describe, it, expect } from 'vitest';
import { encodeState, decodeState, PHENOMENA, type UrlState } from '../src/app/url-state';

const s: UrlState = {
  t: 1212.49, view: 'map2d',
  layers: Object.fromEntries(PHENOMENA.map((k, i) => [k, i % 2 === 0])) as UrlState['layers'],
  probe: { lat: 51.7, lon: -79.26 }, site: 'tanis', thermal: 'goldin', fires: 'global', envelope: true, mode: 'adaptive', dps: 0.5, coast: false, lang: 'en',
};

describe('url state', () => {
  it('round-trips all fields (t to 4 significant digits, probe to 0.01°)', () => {
    const d = decodeState(encodeState(s));
    expect(d.t).toBe(1212);
    expect(d.view).toBe('map2d');
    expect(d.layers).toEqual(s.layers);
    expect(d.probe).toEqual({ lat: 51.7, lon: -79.26 });
    expect(d.site).toBe('tanis');
    expect([d.thermal, d.fires, d.envelope, d.mode, d.dps, d.coast, d.lang]).toEqual(['goldin', 'global', true, 'adaptive', 0.5, false, 'en']);
  });
  it('ignores malformed or malicious input without throwing', () => {
    expect(decodeState('#t=abc&v=<script>&p=999,1&s=../../x&th=evil&d=1e9')).toEqual({});
    expect(decodeState('%%%')).toEqual({});
  });
});
