/** Podgląd rysunków raportu jako PNG (bez przeglądarki) — narzędzie kontroli wizualnej. */
import { readFileSync, writeFileSync } from 'node:fs';
import { Resvg } from '@resvg/resvg-js';
import { loadRegistry } from '../src/model/registry/load';
import { FIGURES } from '../src/report/figures';

const LIGHT = `
.fig-small{font-size:11px;fill:#4a4a50}.fig-label{font-size:12px;fill:#1d1d1f;font-weight:600}
.grid{stroke:#dddad2;stroke-width:1}.lane{stroke:#eeebe4;stroke-width:8;stroke-linecap:round}.frame{stroke:#dddad2}
.ink{color:#1d1d1f}
.ph-crater{color:#8b6f47}.ph-thermal{color:#d55e00}.ph-ejecta{color:#e69f00}.ph-seismic{color:#cc79a7}
.ph-air{color:#3a9ad9}.ph-tsunami{color:#0072b2}.ph-atmo{color:#6f6f6f}.ph-bio{color:#009e73}
.cert-fact{fill:#2e7d32}.cert-extrapolation{fill:#1565c0}.cert-speculation{fill:#7a7a7a}.cert-contested{fill:#c62828}
.x-water{fill:#9cc7e8}.x-sed{fill:#e8d8a8}.x-crust{fill:#c9b6a8}.x-mantle{fill:#8b8f6c}.x-melt{fill:#d9472b}.x-imp{fill:#2d2a26}
text{font-family:Segoe UI, Arial, sans-serif}`;

const reg = loadRegistry('research');
const ak135 = JSON.parse(readFileSync('data/derived/ak135-first-arrivals.json', 'utf8'));
for (const [name, fn] of Object.entries(FIGURES)) {
  let svg = fn({ reg, ak135 });
  svg = svg.replace(/^<svg /, '<svg xmlns="http://www.w3.org/2000/svg" ').replace(/>/, `><style>${LIGHT}</style><rect width="100%" height="100%" fill="#ffffff"/>`);
  const png = new Resvg(svg, { fitTo: { mode: 'width', value: 1520 }, font: { loadSystemFonts: true } }).render().asPng();
  writeFileSync(`research/_podglad_rysunkow/${name}.png`, png);
  console.log(`${name}.png ${png.length} B`);
}
