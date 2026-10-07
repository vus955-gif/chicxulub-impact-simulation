/** Ucieczka znaków specjalnych HTML w tekście wstawianym do raportu i rysunków SVG. */
export const esc = (s: string): string =>
  s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
