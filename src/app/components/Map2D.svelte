<script lang="ts">
  import { untrack } from 'svelte';
  import { geoEqualEarth, geoPath, geoCircle, geoGraticule10, type GeoProjection } from 'd3-geo';
  import { ui } from '../state.svelte';
  import type { AppData } from '../data';
  import { activeItems, hasRing, placeLabels, type Box, type LegendItem, type LineStyle } from '../legend';
  import { tsunamiReachKm } from '../data';
  import MapLegend from './MapLegend.svelte';
  import { L, tx, siteName } from '../i18n';
  import { formatNumber, CERTAINTY_MARK } from '../../model/registry/format';
  import { flashScreenAge, flashWindow, reentryWindow, sortByReentry } from '../../model/sim/ejecta-orbits';
  import { darknessAt } from '../../model/predictive/darkness';
  import { gcDistanceKm, destination, ANTIPODE_KM, R_KM } from '../../model/sim/geo';
  import { bolideProgress, flashIntensity, washOpacity, type FlashTimes } from '../impact-flash';
  import { formatClock } from '../../time/axis';
  import Value from './Value.svelte';

  let { data }: { data: AppData } = $props();

  let wrap: HTMLDivElement;
  let baseCanvas: HTMLCanvasElement;
  let overCanvas: HTMLCanvasElement;
  let coastCanvas: HTMLCanvasElement;
  let w = $state(800), h = $state(450);
  let projection: GeoProjection | null = null;

  // tekstura źródłowa (piksele) — raz
  let texPixels: ImageData | null = null;
  function texture(): ImageData {
    if (texPixels) return texPixels;
    const c = document.createElement('canvas');
    c.width = data.texture.naturalWidth; c.height = data.texture.naturalHeight;
    const g = c.getContext('2d')!;
    g.drawImage(data.texture, 0, 0);
    texPixels = g.getImageData(0, 0, c.width, c.height);
    return texPixels;
  }

  // dane pomocnicze nakładki (połowa rozdzielczości)
  const S = 2;
  let ow = 0, oh = 0, gridIdx: Int32Array = new Int32Array(0), distKm: Float32Array = new Float32Array(0);
  let small: HTMLCanvasElement | null = null;
  let overImg: ImageData | null = null;
  // rozbłyski ponownego wejścia wyrzutów: pozycje rzutowane raz (przy zmianie rozmiaru), duszek poświaty
  let flashXY = new Float32Array(0);
  const FLASH_LIFE = 0.4;
  const flashOrder = $derived(sortByReentry(data.ejecta));
  const flashSprite = (() => {
    const c = document.createElement('canvas'); c.width = c.height = 32;
    const g = c.getContext('2d')!, gr = g.createRadialGradient(16, 16, 0, 16, 16, 16);
    gr.addColorStop(0, 'rgba(255,252,240,1)'); gr.addColorStop(0.25, 'rgba(255,230,170,0.8)'); gr.addColorStop(0.6, 'rgba(255,140,60,0.25)'); gr.addColorStop(1, 'rgba(255,90,30,0)');
    g.fillStyle = gr; g.fillRect(0, 0, 32, 32); return c;
  })();

  function rebuild() {
    const dpr = Math.min(2, window.devicePixelRatio || 1);
    const W = Math.max(50, Math.floor(w)), H = Math.max(50, Math.floor(h));
    for (const c of [baseCanvas, coastCanvas, overCanvas]) { c.width = W * dpr; c.height = H * dpr; c.style.width = `${W}px`; c.style.height = `${H}px`; }
    projection = geoEqualEarth().fitExtent([[8, 8], [W - 8, H - 8]], { type: 'Sphere' });
    // podkład: reprojekcja tekstury piksel po pikselu (odwrotne odwzorowanie)
    const tex = texture();
    const bctx = baseCanvas.getContext('2d')!;
    bctx.setTransform(1, 0, 0, 1, 0, 0);
    const img = bctx.createImageData(baseCanvas.width, baseCanvas.height);
    const proj = projection;
    for (let y = 0; y < baseCanvas.height; y++) for (let x = 0; x < baseCanvas.width; x++) {
      const ll = proj.invert!([(x + 0.5) / dpr, (y + 0.5) / dpr]);
      if (!ll || !Number.isFinite(ll[0])) continue;
      const [px, py] = proj(ll)!;
      if (Math.abs(px - (x + 0.5) / dpr) > 0.75 || Math.abs(py - (y + 0.5) / dpr) > 0.75) continue; // poza elipsą
      const tx = Math.min(tex.width - 1, Math.floor(((ll[0] + 180) / 360) * tex.width));
      const ty = Math.min(tex.height - 1, Math.floor(((90 - ll[1]) / 180) * tex.height));
      const si = (ty * tex.width + tx) * 4, di = (y * baseCanvas.width + x) * 4;
      img.data[di] = tex.data[si]!; img.data[di + 1] = tex.data[si + 1]!; img.data[di + 2] = tex.data[si + 2]!; img.data[di + 3] = 255;
    }
    bctx.putImageData(img, 0, 0);
    bctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    const path = geoPath(proj, bctx);
    bctx.beginPath(); path(geoGraticule10()); bctx.strokeStyle = 'rgba(255,255,255,0.07)'; bctx.lineWidth = 0.6; bctx.stroke();
    bctx.beginPath(); path({ type: 'Sphere' }); bctx.strokeStyle = 'rgba(255,255,255,0.25)'; bctx.lineWidth = 1; bctx.stroke();
    // siatka nakładki
    ow = Math.ceil(W / S); oh = Math.ceil(H / S);
    gridIdx = new Int32Array(ow * oh).fill(-1); distKm = new Float32Array(ow * oh);
    const g = data.tsunamiTT;
    for (let y = 0; y < oh; y++) for (let x = 0; x < ow; x++) {
      const ll = proj.invert!([x * S + S / 2, y * S + S / 2]);
      if (!ll || !Number.isFinite(ll[0])) continue;
      const [px, py] = proj(ll)!;
      if (Math.abs(px - (x * S + S / 2)) > 1 || Math.abs(py - (y * S + S / 2)) > 1) continue;
      const r = Math.min(g.h - 1, Math.floor(((90 - ll[1]) / 180) * g.h)), c = Math.min(g.w - 1, Math.floor(((ll[0] + 180) / 360) * g.w));
      gridIdx[y * ow + x] = r * g.w + c;
      distKm[y * ow + x] = gcDistanceKm(data.ctx.crater, { lat: ll[1], lon: ll[0] });
    }
    small = document.createElement('canvas'); small.width = ow; small.height = oh;
    flashXY = new Float32Array(data.ejecta.length * 2).fill(NaN);
    data.ejecta.forEach((p, i) => { if (p.hyper) return; const q = proj([p.reLon, p.reLat]); if (q) { flashXY[i * 2] = q[0]; flashXY[i * 2 + 1] = q[1]; } });
    // kierunek nadejścia bolidu na ekranie (jednostkowy wektor od krateru ku azymutowi nadejścia)
    const c0 = data.ctx.crater, from = destination(c0, data.ctx.downrangeAzDeg - 180, 400);
    const a = proj([c0.lon, c0.lat]), b = proj([from.lon, from.lat]);
    if (a && b) { const n = Math.hypot(b[0] - a[0], b[1] - a[1]) || 1; approachDir = [(b[0] - a[0]) / n, (b[1] - a[1]) / n]; }
  }

  // ── przelot bolidu i błysk uderzenia: SYMBOL (rozmiar umowny), przebieg w czasie z rejestru ──
  let approachDir: [number, number] = [Math.SQRT1_2, -Math.SQRT1_2];
  const reducedMotion = typeof matchMedia === 'function' && matchMedia('(prefers-reduced-motion: reduce)').matches;
  const fxTimes = $derived<FlashTimes>({
    tEntry: data.reg.num('impactor.entry_duration'),
    tMaxRad: data.reg.num('fireball.t_max_radiation_eiep'),
    radDurS: data.reg.seconds('fireball.radiation_duration_eiep'),
  });
  const fxPhase = $derived(bolideProgress(ui.t, fxTimes.tEntry) !== null ? 'bolide' : flashIntensity(ui.t, fxTimes) > 0 ? 'flash' : null);

  function drawImpactFx(octx: CanvasRenderingContext2D, cx: number, cy: number, t: number) {
    const prog = bolideProgress(t, fxTimes.tEntry);
    if (prog !== null) {
      const L = 110; // px — długość symbolicznego toru (w skali mapy cały przelot to ~1 px)
      const [dx, dy] = approachDir;
      const sx = cx + dx * L, sy = cy + dy * L, hx = cx + dx * L * (1 - prog), hy = cy + dy * L * (1 - prog);
      octx.save();
      octx.setLineDash([3, 4]); octx.strokeStyle = 'rgba(255,226,176,0.35)'; octx.lineWidth = 1;
      octx.beginPath(); octx.moveTo(hx, hy); octx.lineTo(cx, cy); octx.stroke(); octx.setLineDash([]);
      octx.beginPath(); octx.arc(cx, cy, 9, 0, Math.PI * 2); octx.strokeStyle = 'rgba(255,226,176,0.6)'; octx.stroke();
      octx.globalCompositeOperation = 'lighter';
      const trail = octx.createLinearGradient(sx, sy, hx, hy);
      trail.addColorStop(0, 'rgba(255,150,60,0)'); trail.addColorStop(1, `rgba(255,210,140,${0.35 + 0.5 * prog})`);
      octx.strokeStyle = trail; octx.lineWidth = 2 + 2 * prog; octx.lineCap = 'round';
      octx.beginPath(); octx.moveTo(sx, sy); octx.lineTo(hx, hy); octx.stroke();
      const R = 5 + 11 * prog; // świecenie rośnie w gęstszej atmosferze
      const g = octx.createRadialGradient(hx, hy, 0, hx, hy, R);
      g.addColorStop(0, 'rgba(255,255,245,1)'); g.addColorStop(0.35, 'rgba(255,214,140,0.85)'); g.addColorStop(1, 'rgba(255,120,40,0)');
      octx.fillStyle = g; octx.beginPath(); octx.arc(hx, hy, R, 0, Math.PI * 2); octx.fill();
      octx.restore();
      return;
    }
    const I = flashIntensity(t, fxTimes);
    if (I <= 0) return;
    octx.save();
    octx.globalCompositeOperation = 'lighter';
    const wa = reducedMotion ? 0 : washOpacity(t);
    if (wa > 0) { // rozbłysk całego widoku przy kontakcie — płynne wygaszanie, bez migotania
      const big = Math.hypot(w, h);
      const gw = octx.createRadialGradient(cx, cy, 0, cx, cy, big);
      gw.addColorStop(0, `rgba(255,244,220,${wa})`); gw.addColorStop(1, `rgba(255,214,170,${wa * 0.35})`);
      octx.fillStyle = gw; octx.fillRect(0, 0, w, h);
    }
    const R = 16 + 58 * I;
    const g = octx.createRadialGradient(cx, cy, 0, cx, cy, R);
    g.addColorStop(0, `rgba(255,255,240,${0.95 * I})`);
    g.addColorStop(0.18, `rgba(255,228,150,${0.8 * I})`);
    g.addColorStop(0.5, `rgba(255,140,50,${0.4 * I})`);
    g.addColorStop(1, 'rgba(255,80,20,0)');
    octx.fillStyle = g; octx.beginPath(); octx.arc(cx, cy, R, 0, Math.PI * 2); octx.fill();
    // promienie rozbłysku (słabe, cienkie)
    octx.strokeStyle = `rgba(255,236,190,${0.35 * I})`; octx.lineWidth = 1;
    for (let k = 0; k < 4; k++) {
      const ang = (k * Math.PI) / 4 + Math.PI / 8, len = R * (k % 2 ? 1.1 : 1.6);
      octx.beginPath(); octx.moveTo(cx - Math.cos(ang) * len, cy - Math.sin(ang) * len); octx.lineTo(cx + Math.cos(ang) * len, cy + Math.sin(ang) * len); octx.stroke();
    }
    octx.restore();
  }

  const css = (v: string) => getComputedStyle(document.documentElement).getPropertyValue(v).trim() || '#fff';
  const deg = (km: number) => (km / R_KM) * (180 / Math.PI);
  /** preferowany azymut podpisu (rozkłada podpisy wokół krateru); dalsze próby co 14° w obie strony */
  const LABEL_BEARING: Record<string, number> = {
    'front:P': 20, 'front:S': 40, 'front:R': 60, 'front:G': 80, 'front:lamb': 100, 'front:ejecta': 120, fires: 340, crater: 0,
    'bio:sterile': 200, 'bio:thermal': 215, 'bio:trees90': 230, 'bio:trees30': 245, 'bio:liquefaction': 170, 'bio:slopes': 185,
  };
  const flashesNow = $derived.by(() => {
    const [tf, tt] = flashWindow(ui.t, FLASH_LIFE, ui.mode, ui.dps);
    const [lo, hi] = reentryWindow(data.ejecta, flashOrder, tf, tt);
    return hi > lo;
  });
  const items = $derived(activeItems(data.ctx, { t: ui.t, layers: ui.layers, thermal: ui.thermal, coast: ui.coast }, { tsunamiReached: ui.t > 0 && tsunamiReachKm(data, ui.t) > 0, flashesNow }));
  let legW = $state(0), legH = $state(0);
  const legendBox = $derived<Box | null>(legW > 0 ? { x: w - legW - 14, y: h - legH - 34, w: legW + 8, h: legH + 8 } : null);

  // dymek po najechaniu na linię: najbliższy okrąg w promieniu kilku pikseli
  let tip = $state<{ x: number; y: number; it: LegendItem } | null>(null);
  function onMove(ev: MouseEvent) {
    if (!projection) return;
    const r = overCanvas.getBoundingClientRect(), x = ev.clientX - r.left, y = ev.clientY - r.top;
    const a = projection.invert!([x, y]), b = projection.invert!([x + 1, y]);
    if (!a || !b || !Number.isFinite(a[0])) { ui.hover = null; tip = null; return; }
    const d = gcDistanceKm(data.ctx.crater, { lat: a[1], lon: a[0] });
    const tol = 7 * Math.max(1, gcDistanceKm({ lat: a[1], lon: a[0] }, { lat: b[1], lon: b[0] }));
    let best: LegendItem | null = null, bestD = tol;
    for (const it of items) {
      if (it.radiusKm === undefined || it.key === 'coast') continue;
      for (const rr of [it.radiusKm, it.innerKm ?? -1]) { const dd = Math.abs(d - rr); if (rr > 0 && dd < bestD) { bestD = dd; best = it; } }
    }
    if (!best) best = items.find((it) => it.kind === 'disc' && it.radiusKm !== undefined && d <= it.radiusKm) ?? null;
    ui.hover = best?.key ?? null;
    tip = best ? { x, y, it: best } : null;
  }
  function onLeave() { ui.hover = null; tip = null; }

  function drawOverlay() {
    if (!projection || !small) return;
    const t = ui.t, dpr = overCanvas.width / Math.max(1, Math.floor(w));
    const octx = overCanvas.getContext('2d')!;
    octx.setTransform(1, 0, 0, 1, 0, 0);
    octx.clearRect(0, 0, overCanvas.width, overCanvas.height);
    // pola rastrowe: tsunami i zaciemnienie
    const sctx = small.getContext('2d')!;
    if (!overImg || overImg.width !== ow || overImg.height !== oh) overImg = sctx.createImageData(ow, oh);
    const img = overImg;
    img.data.fill(0);
    const TT = data.tsunamiTT.data, AMP = data.tsunamiAmp.data;
    const showTs = ui.layers.tsunami && t > 0, showDark = ui.layers.atmo && t > 0;
    const envelope = ui.envelope; // odczyt stanu poza pętlą pikseli (każdy odczyt $state to rejestracja zależności)
    const band = Math.max(300, 0.12 * t);
    const lut = new Float32Array(129);
    if (showDark) for (let i = 0; i <= 128; i++) lut[i] = darknessAt(data.ctx, t, (i / 128) * ANTIPODE_KM, ui.fires).lightFraction;
    for (let i = 0; i < gridIdx.length; i++) {
      const gi = gridIdx[i]!;
      if (gi < 0) continue;
      let r = 0, g = 0, b = 0, a = 0;
      if (showDark) {
        const light = lut[Math.min(128, Math.round((distKm[i]! / ANTIPODE_KM) * 128))]!;
        a = (1 - light) * 0.6; // krycie ograniczone, by paleogeografia pozostała czytelna
      }
      if (showTs) {
        const tt = TT[gi]!;
        if (Number.isFinite(tt) && tt <= t) {
          let ta: number;
          if (envelope) { const amp = AMP[gi]!; ta = Number.isFinite(amp) ? Math.min(0.9, Math.max(0.12, (Math.log10(Math.max(amp, 0.05)) + 1) / 3.2)) : 0.15; }
          else ta = t - tt < band ? 0.25 + 0.65 * (1 - (t - tt) / band) : 0.14;
          r = 43 * ta + r * (1 - ta); g = 179 * ta + g * (1 - ta); b = 201 * ta + b * (1 - ta); a = ta + a * (1 - ta);
        }
      }
      if (a > 0) { const k = i * 4; img.data[k] = r / Math.max(a, 1e-6); img.data[k + 1] = g / Math.max(a, 1e-6); img.data[k + 2] = b / Math.max(a, 1e-6); img.data[k + 3] = Math.round(a * 255); }
    }
    sctx.putImageData(img, 0, 0);
    octx.imageSmoothingEnabled = true;
    octx.drawImage(small, 0, 0, ow * S * dpr, oh * S * dpr);

    // wektory: pola (wypełnienia), linie z ciemną obwódką, potem podpisy bez nachodzenia
    octx.setTransform(dpr, 0, 0, dpr, 0, 0);
    const proj = projection;
    const path = geoPath(proj, octx);
    const c0: [number, number] = [data.ctx.crater.lon, data.ctx.crater.lat];
    const circle = (km: number) => geoCircle().center(c0).radius(Math.max(0.01, deg(km))).precision(1)();
    const hover = ui.hover;
    const alphaOf = (key: string) => (hover === null || hover === key ? 1 : 0.25);
    const color = (c: string) => (c.startsWith('--') ? css(c) : c);
    const ring = (km: number, st: LineStyle, key: string, widthScale = 1) => {
      if (km <= 0 || st.width <= 0) return;
      const wdt = st.width * widthScale * (hover === key ? 1.7 : 1);
      octx.globalAlpha = alphaOf(key);
      octx.beginPath(); path(circle(km));
      octx.setLineDash([]); octx.strokeStyle = 'rgba(4,7,11,0.62)'; octx.lineWidth = wdt + 3; octx.stroke();
      octx.setLineDash(st.dash); octx.strokeStyle = color(st.color); octx.lineWidth = wdt; octx.stroke();
      octx.setLineDash([]); octx.globalAlpha = 1;
    };
    const fillAnnulus = (outer: number, inner: number, fill: string, key: string) => {
      octx.globalAlpha = alphaOf(key);
      octx.beginPath(); path(circle(outer)); if (inner > 0) path(circle(inner));
      octx.fillStyle = fill; octx.fill('evenodd'); octx.globalAlpha = 1;
    };
    // 1) wypełnienia
    for (const it of items) {
      if (it.radiusKm === undefined) continue;
      if (it.key === 'ir') fillAnnulus(it.radiusKm, Math.max(1, it.innerKm ?? 0), color(it.style.color) + '30', it.key);
      else if (it.key === 'front:fireball') fillAnnulus(it.radiusKm, 0, color(it.style.color) + '66', it.key);
      else if (it.key === 'bio:sterile') fillAnnulus(it.radiusKm, 0, 'rgba(0,0,0,0.38)', it.key);
      else if (it.kind === 'band' && it.innerKm !== undefined && it.innerKm > 0) fillAnnulus(it.radiusKm, it.innerKm, color(it.style.color) + '16', it.key);
    }
    // 2) linie
    for (const it of items) {
      if (it.radiusKm === undefined || it.key === 'ir' || it.key === 'coast' || it.key === 'front:fireball') continue;
      if (it.kind === 'band' && it.innerKm !== undefined && it.innerKm > 0) ring(it.innerKm, { ...it.style, dash: [] }, it.key, 0.6);
      ring(it.radiusKm, it.style, it.key);
    }
    // 3) rozbłyski ponownego wejścia wyrzutów
    if (ui.layers.ejecta && t > 0) {
      octx.save(); octx.globalCompositeOperation = 'lighter';
      const ps = data.ejecta;
      const [tf, tt] = flashWindow(t, FLASH_LIFE, ui.mode, ui.dps);
      const [lo, hi] = reentryWindow(ps, flashOrder, tf, tt);
      const fa = alphaOf('flash');
      for (let k = lo; k < hi; k++) {
        const i = flashOrder[k]!;
        const age = Math.max(0, flashScreenAge(t, ps[i]!.tRe, ui.mode, ui.dps));
        const x = flashXY[i * 2]!, y = flashXY[i * 2 + 1]!;
        if (!Number.isFinite(x)) continue;
        const I = age < 0.06 ? age / 0.06 : (1 - (age - 0.06) / (FLASH_LIFE - 0.06)) ** 2;
        const r = 3 + 6 * I;
        octx.globalAlpha = 0.75 * I * fa; octx.drawImage(flashSprite, x - r, y - r, 2 * r, 2 * r);
      }
      octx.restore();
    }
    const pt = projection(c0);
    if (pt) { octx.fillStyle = '#ffe2b0'; octx.beginPath(); octx.arc(pt[0], pt[1], 3, 0, Math.PI * 2); octx.fill(); }
    if (pt) drawImpactFx(octx, pt[0], pt[1], t);
    // 4) stanowiska (ich podpisy rezerwują miejsce przed podpisami linii)
    octx.font = '10.5px Segoe UI, sans-serif';
    const taken: Box[] = [];
    if (legendBox) taken.push(legendBox);
    const siteLabels: Array<{ text: string; x: number; y: number; sel: boolean }> = [];
    for (const s of data.sites) {
      const p = projection([s.paleoLon, s.paleoLat]);
      if (!p) continue;
      const sel = ui.site === s.id;
      octx.beginPath(); octx.arc(p[0], p[1], sel ? 4.5 : 3, 0, Math.PI * 2);
      octx.fillStyle = sel ? '#ffffff' : '#0b0e14'; octx.fill(); octx.strokeStyle = '#ffffff'; octx.lineWidth = 1.2; octx.stroke();
      if (sel || w > 900) {
        const text = siteName(s).split(' (')[0]!;
        siteLabels.push({ text, x: p[0] + 6, y: p[1] - 5, sel });
        taken.push({ x: p[0] + 5, y: p[1] - 15, w: octx.measureText(text).width + 2, h: 13 });
      }
    }
    for (const l of siteLabels) {
      octx.lineWidth = 3; octx.strokeStyle = 'rgba(4,7,11,0.8)'; octx.strokeText(l.text, l.x, l.y);
      octx.fillStyle = l.sel ? '#ffffff' : 'rgba(255,255,255,0.85)'; octx.fillText(l.text, l.x, l.y);
    }
    // 5) podpisy linii: kandydaci wzdłuż okręgu, pierwszy wolny
    octx.font = '600 10.5px Segoe UI, sans-serif';
    const labelled = items.filter(hasRing);
    const cand = labelled.map((it, n) => {
      const base = LABEL_BEARING[it.key] ?? (n * 37) % 360;
      const pts: Array<[number, number]> = [];
      for (let k = 0; k < 16; k++) {
        const b = base + (k % 2 ? 1 : -1) * Math.ceil(k / 2) * 14;
        const g = destination(data.ctx.crater, b, it.radiusKm!), q = proj([g.lon, g.lat]);
        if (q && Number.isFinite(q[0])) pts.push([q[0], q[1]]);
      }
      return { key: it.key, w: octx.measureText(tx(it.tag)).width + 10, h: 16, candidates: pts };
    });
    const placed = placeLabels(cand, { x: 4, y: 4, w: w - 8, h: h - 30 }, taken);
    for (const it of labelled) {
      const b = placed.get(it.key);
      if (!b) continue;
      octx.globalAlpha = alphaOf(it.key);
      octx.fillStyle = 'rgba(8,12,18,0.86)'; octx.strokeStyle = color(it.style.color); octx.lineWidth = 1;
      octx.beginPath(); octx.roundRect(b.x, b.y, b.w, b.h, 4); octx.fill(); octx.stroke();
      octx.fillStyle = color(it.style.color); octx.textBaseline = 'middle'; octx.fillText(tx(it.tag), b.x + 5, b.y + b.h / 2 + 0.5);
      octx.textBaseline = 'alphabetic'; octx.globalAlpha = 1;
    }
    // sonda
    if (ui.probe) {
      const p = projection([ui.probe.lon, ui.probe.lat]);
      if (p) { octx.strokeStyle = '#fff'; octx.lineWidth = 1.5; octx.beginPath(); octx.moveTo(p[0] - 7, p[1]); octx.lineTo(p[0] + 7, p[1]); octx.moveTo(p[0], p[1] - 7); octx.lineTo(p[0], p[1] + 7); octx.stroke(); }
    }
  }

  function onClick(ev: MouseEvent) {
    if (!projection) return;
    const r = overCanvas.getBoundingClientRect();
    const ll = projection.invert!([ev.clientX - r.left, ev.clientY - r.top]);
    if (!ll || !Number.isFinite(ll[0])) return;
    ui.probe = { lat: ll[1], lon: ll[0] }; ui.site = null;
  }

  /** dzisiejsze linie brzegowe (orientacja) — osobna warstwa, rysowana tylko przy zmianie rozmiaru lub przełącznika */
  function drawCoast() {
    if (!projection) return;
    const dpr = coastCanvas.width / Math.max(1, Math.floor(w));
    const c = coastCanvas.getContext('2d')!;
    c.setTransform(1, 0, 0, 1, 0, 0); c.clearRect(0, 0, coastCanvas.width, coastCanvas.height);
    if (!ui.coast) return;
    c.setTransform(dpr, 0, 0, dpr, 0, 0);
    const path = geoPath(projection, c);
    c.beginPath();
    path({ type: 'MultiLineString', coordinates: data.coastlines.map((l) => { const pts: [number, number][] = []; for (let i = 0; i < l.length; i += 2) pts.push([l[i]!, l[i + 1]!]); return pts; }) });
    c.strokeStyle = 'rgba(255,255,255,0.42)'; c.lineWidth = 0.7; c.stroke();
  }

  // reprojekcja podkładu tylko przy zmianie rozmiaru — untrack, żeby zegar T (czytany w drawOverlay) jej nie wyzwalał
  $effect(() => { void w; void h; untrack(() => { rebuild(); drawCoast(); drawOverlay(); }); });
  $effect(() => { void ui.coast; untrack(drawCoast); });
  $effect(() => {
    // zależności: czas, warstwy, scenariusze, sonda
    void ui.t; void ui.envelope; void ui.thermal; void ui.fires; void ui.probe; void ui.site; void ui.mode; void ui.dps; void ui.hover; void items; void legendBox;
    for (const k in ui.layers) void ui.layers[k as keyof typeof ui.layers];
    drawOverlay();
  });
</script>

<div class="map" bind:this={wrap} bind:clientWidth={w} bind:clientHeight={h}>
  <canvas bind:this={baseCanvas}></canvas>
  <canvas bind:this={coastCanvas}></canvas>
  <canvas bind:this={overCanvas} class="over" onclick={onClick} onmousemove={onMove} onmouseleave={onLeave} aria-label={L('Mapa paleogeograficzna — kliknij, aby ustawić sondę', 'Palaeogeographic map — click to place the probe')}></canvas>
  {#if tip}
    <div class="tip small" style={`left:${Math.min(tip.x + 14, w - 290)}px;top:${tip.y + 14}px`}>
      <b>{tx(tip.it.title)}</b> <span class={`mk mk-${tip.it.certainty}`}>{CERTAINTY_MARK[tip.it.certainty]}</span>
      <div>{tx(tip.it.desc)}</div>
      {#if tip.it.radiusKm !== undefined}<div class="muted">{tip.it.innerKm !== undefined && tip.it.innerKm > 0 ? `${formatNumber(tip.it.innerKm, 3)}–${formatNumber(tip.it.radiusKm, 3)} km` : `${formatNumber(tip.it.radiusKm, 3)} km`} {L('od krateru', 'from the crater')}</div>{/if}
    </div>
  {/if}
  <div class="legwrap" bind:clientWidth={legW} bind:clientHeight={legH}><MapLegend {items} /></div>
  {#if fxPhase === 'bolide'}
    <div class="fxnote small">
      <b>{L('Przelot przez atmosferę', 'Atmospheric entry')}</b> · <Value value={fxTimes.tEntry} unit="s" paramId="impactor.entry_duration" certainty={data.reg.param('impactor.entry_duration').certainty} />
      {L('od 100 km do powierzchni · nadejście z azymutu', 'from 100 km to the surface · approach from azimuth')} <Value value={data.reg.num('impactor.approach_azimuth')} unit="°" paramId="impactor.approach_azimuth" certainty={data.reg.param('impactor.approach_azimuth').certainty} />
      <div class="muted">{L('tor i bolid to symbol — w skali tej mapy cały przelot mieści się w ~1 pikselu', 'the track and bolide are a symbol — at this map scale the whole entry fits in ~1 pixel')}</div>
    </div>
  {:else if fxPhase === 'flash'}
    <div class="fxnote small">
      <b>{L('Błysk uderzenia i kula ognia', 'Impact flash and fireball')}</b> · {L('maksimum promieniowania', 'radiation maximum')} <Value value={fxTimes.tMaxRad} unit="s" paramId="fireball.t_max_radiation_eiep" certainty={data.reg.param('fireball.t_max_radiation_eiep').certainty} />,
      {L('gaśnie do', 'fades by')} {formatClock(fxTimes.radDurS)}
      <div class="muted">{L('jasność zmienia się zgodnie z tymi czasami (EIEP); rozmiar poświaty jest umowny — zasięg kuli ognia pokazuje warstwa termiczna', 'brightness follows these times (EIEP); the glow size is symbolic — the fireball extent is shown by the thermal layer')}</div>
    </div>
  {/if}
  <div class="note small">{L('Odwzorowanie równopowierzchniowe Equal Earth · paleogeografia PaleoDEM (Scotese & Wright 2018), układ PALEOMAP 65 Ma · kliknij, aby ustawić sondę', 'Equal Earth equal-area projection · PaleoDEM palaeogeography (Scotese & Wright 2018), PALEOMAP 65 Ma frame · click to place the probe')}</div>
</div>

<style>
  .map { position: relative; width: 100%; height: 100%; overflow: hidden; background: #05070c; }
  canvas { position: absolute; left: 0; top: 0; }
  .over { cursor: crosshair; }
  .legwrap { position: absolute; right: 10px; bottom: 30px; z-index: 3; }
  .tip { position: absolute; z-index: 4; max-width: 280px; padding: 6px 8px; border-radius: 6px; pointer-events: none;
    background: rgba(9, 13, 20, 0.94); border: 1px solid var(--line2); color: var(--ink); line-height: 1.35; }
  .note { position: absolute; left: 10px; bottom: 6px; color: var(--muted); pointer-events: none; }
  .fxnote { position: absolute; left: 10px; top: 8px; max-width: min(520px, calc(100% - 20px)); padding: 6px 9px; border-radius: 6px;
    background: rgba(11, 14, 20, 0.78); border: 1px solid #3a2c1a; color: var(--ink); }
  .fxnote .muted { margin-top: 2px; }
</style>
