<script lang="ts">
  import { scaleLinear } from 'd3-scale';
  import { ui } from '../../app/state.svelte';
  import type { AppData } from '../../app/data';
  import { craterAt, craterKeyframes, craterWaterAt } from '../../model/predictive/crater-kinematics';
  import { waterDepthM } from '../../model/predictive/water-depth';
  import { frontsAt } from '../../model/sim/fronts';
  import { flashIntensity } from '../../app/impact-flash';
  import { kelvinToRgb, plumeTemperatureK } from '../color';
  import { formatClock } from '../../time/axis';
  import { formatNumber } from '../../model/registry/format';
  import Value from '../../app/components/Value.svelte';
  import { L, tx } from '../../app/i18n';
  import type { Txt } from '../../model/registry/types';

  let { data }: { data: AppData } = $props();
  const reg = $derived(data.reg);
  const k = $derived(craterKeyframes(data.reg));

  let w = $state(900), h = $state(560);
  const XMAX = 160, YMAX = 28, YMIN = -42;
  const M = { l: 44, r: 14, t: 14, b: 30 };
  const sx = $derived(scaleLinear().domain([-XMAX, XMAX]).range([M.l, Math.max(M.l + 10, w - M.r)]));
  const sy = $derived(scaleLinear().domain([YMAX, YMIN]).range([M.t, Math.max(M.t + 10, h - M.b)]));
  const ve = $derived(((sy(0) - sy(-1)) / (sx(1) - sx(0))));

  // płaszczyzna przekroju = płaszczyzna toru impaktora: x < 0 ku SW (z biegiem lotu), x > 0 ku NE (skąd nadleciał)
  const azDown = $derived(data.ctx.downrangeAzDeg), azUp = $derived((data.ctx.downrangeAzDeg + 180) % 360);
  const N = 321;
  const xs = Array.from({ length: N }, (_, i) => -XMAX + (2 * XMAX * i) / (N - 1));
  const wd0 = $derived(xs.map((x) => (waterDepthM(data.ctx, Math.abs(x), x < 0 ? azDown : azUp) ?? 0) / 1000));

  const t = $derived(ui.t);
  const st = $derived(craterAt(k, t));
  const ground = $derived(xs.map((x, i) => -wd0[i]! + st.surface(Math.abs(x))));
  const hz = (d0: number) => xs.map((x, i) => Math.min(ground[i]!, -wd0[i]! + st.horizon(d0, Math.abs(x))));
  const sedBase = $derived(hz(k.Hs));
  const moho = $derived(hz(k.Hc));
  const h10 = $derived(hz(10));
  const h20 = $derived(hz(20));

  const P = (x: number, y: number) => `${sx(x).toFixed(1)},${sy(y).toFixed(1)}`;
  const line = (ys: number[]) => 'M' + xs.map((x, i) => P(x, ys[i]!)).join('L');
  /** wielokąt między górną i dolną krzywą, tylko tam, gdzie mask(i) — rozbity na segmenty */
  function band(top: number[], bot: number[], mask: (i: number) => boolean): string {
    let d = '', seg: number[] = [];
    const flush = () => {
      if (seg.length > 1) d += 'M' + seg.map((i) => P(xs[i]!, top[i]!)).join('L') + 'L' + seg.slice().reverse().map((i) => P(xs[i]!, bot[i]!)).join('L') + 'Z';
      seg = [];
    };
    for (let i = 0; i < N; i++) { if (mask(i) && top[i]! - bot[i]! > 1e-4) seg.push(i); else flush(); }
    flush();
    return d;
  }
  const bottom = xs.map(() => YMIN);

  const crustPath = $derived(band(ground, bottom, () => true));
  const mantlePath = $derived(band(moho, bottom, () => true));
  const sedPath = $derived(band(ground, sedBase, (i) => st.sedimentPresent(Math.abs(xs[i]!))));
  const meltTop = $derived(ground);
  const meltBot = $derived(xs.map((x, i) => ground[i]! - st.melt(Math.abs(x))));
  const meltPath = $derived(band(meltTop, meltBot, () => true));

  // woda: wypchnięta podczas formowania krateru, powraca wg czasów z rejestru (△)
  const floorBelowSea = $derived(wd0[(N - 1) / 2]! + k.Df);
  const cw = $derived(craterWaterAt(k, t, floorBelowSea));
  const waterTop = $derived(xs.map((x) => {
    const r = Math.abs(x);
    if (t <= 0) return 0;
    if (t < k.tF) return r > Math.min(k.Rf, 1.3 * st.cavityRadius) ? 0 : NaN;
    if (cw.basinLevel === null) return r > cw.inflowRadius ? 0 : NaN;
    return r >= k.Rf ? 0 : cw.basinLevel;
  }));
  const waterPath = $derived(band(waterTop.map((v) => (Number.isFinite(v) ? v : -999)), ground, (i) => Number.isFinite(waterTop[i]!)));

  // krater przejściowy jako kontur odniesienia (po jego maksimum)
  const transientRef = $derived.by(() => {
    const s = craterAt(k, k.tTr);
    return line(xs.map((x, i) => -wd0[i]! + s.surface(Math.abs(x))));
  });

  // front fali uderzeniowej / P w skorupie (promień z modelu frontów)
  const rP = $derived(frontsAt(data.ctx, t).find((f) => f.kind === 'P')?.radiusKm);
  const shockPath = $derived.by(() => {
    if (rP === undefined || rP <= 0.5 || rP > 260) return '';
    const pts: string[] = [];
    for (let a = 0; a <= 180; a += 3) { const th = (a * Math.PI) / 180; pts.push(P(Math.cos(th) * rP, -wd0[(N - 1) / 2]! - Math.sin(th) * rP)); }
    return 'M' + pts.join('L');
  });

  // impaktor w płaszczyźnie przekroju: nadlot z NE pod kątem z rejestru; po kontakcie wnika i odparowuje (symbol)
  const dImp = $derived(reg.num('impactor.diameter')), v = $derived(reg.num('impactor.velocity')), ang = $derived((reg.num('impactor.angle') * Math.PI) / 180);
  const tPen = $derived(dImp / (v * Math.sin(ang)));
  const impactor = $derived.by(() => {
    if (t >= tPen) return null;
    const s = -v * t; // droga po torze od punktu kontaktu [km] (ujemna po kontakcie)
    const cx = Math.cos(ang) * (s + dImp / 2), cy = Math.sin(ang) * (s + dImp / 2);
    return { cx, cy, alpha: t <= 0 ? 1 : 1 - t / tPen };
  });

  // pióropusz par i błysk: kolor z temperatury (kotwice z rejestru), zasięg z prędkości górnej części pióropusza
  const T0 = $derived(reg.num('fireball.plume_initial_temperature')), Ttr = $derived(reg.num('fireball.transparency_temperature'));
  const tMaxRad = $derived(reg.num('fireball.t_max_radiation_eiep'));
  const vPlume = $derived(reg.num('fireball.plume_upper_velocity'));
  const plume = $derived.by(() => {
    if (t <= 0 || t > 900) return null;
    const rad = Math.min(90, vPlume * t);
    const [r, g, b] = kelvinToRgb(plumeTemperatureK(t, T0, Ttr, tMaxRad));
    const a = t < 60 ? 0.8 : 0.8 * Math.max(0, 1 - (t - 60) / 840);
    return { rad, color: `rgb(${r},${g},${b})`, a };
  });
  const flash = $derived(flashIntensity(t, { tEntry: reg.num('impactor.entry_duration'), tMaxRad, radDurS: reg.num('fireball.radiation_duration_eiep') * 60 }));

  // kurtyna ejecta: stożek ~45° od krawędzi rosnącej jamy (symbol), wygasa po maksimum wypiętrzenia
  const curtain = $derived.by(() => {
    if (t <= 0.2 || t >= k.tU) return null;
    const R = st.cavityRadius, gR = -wd0[(N - 1) / 2]! + st.surface(R);
    const Lc = Math.min(XMAX, 3 * t);
    const a = t < k.tTr ? 0.65 : 0.65 * (1 - (t - k.tTr) / (k.tU - k.tTr));
    const side = (sg: number) => `M${P(sg * R, gR)}L${P(sg * (R + Lc * Math.SQRT1_2), gR + Lc * Math.SQRT1_2)}L${P(sg * (R + Lc * Math.SQRT1_2 + 6), gR + Lc * Math.SQRT1_2 - 2)}L${P(sg * (R + 4), gR)}Z`;
    return { d: side(-1) + side(1), a };
  });

  const PHASE: Record<string, Txt> = {
    pre: { pl: 'przed kontaktem', en: 'before contact' }, excavation: { pl: 'wykop krateru przejściowego', en: 'excavation of the transient crater' },
    uplift: { pl: 'wypiętrzanie dna', en: 'floor uplift' }, collapse: { pl: 'zapadanie wypiętrzenia → pierścień szczytowy', en: 'uplift collapse → peak ring' },
    modification: { pl: 'modyfikacja: zapadanie ścian, tarasy', en: 'modification: wall collapse, terraces' }, final: { pl: 'krater końcowy', en: 'final crater' },
  };

  // kolumna M0077A (pierścień szczytowy): osady 1. doby — geometria z rdzenia (●), czasy z rejestru
  const UNITS = $derived([
    { label: { pl: 'stop impaktowy (Unit 3)', en: 'impact melt (Unit 3)' }, top: 'crust.m0077a_impact_melt_top', bot: 'crust.m0077a_impact_melt_bottom', t0: 'crater.t_melt_emplacement_peak_ring', t1: 'crater.t_melt_cap_peak_ring', color: '#e0612f' },
    { label: { pl: 'suewit dolny, niewarstwowany', en: 'lower non-bedded suevite' }, top: 'crust.m0077a_graded_suevite_bottom', bot: 'crust.m0077a_suevite_bottom', t0: 'crater.t_melt_cap_peak_ring', t1: 'crater.t_first_seawater_peak_ring', color: '#9c8f86' },
    { label: { pl: 'suewit z gradacją (resurge)', en: 'graded suevite (resurge)' }, top: 'crust.m0077a_graded_suevite_top', bot: 'crust.m0077a_graded_suevite_bottom', t0: 'crater.t_first_seawater_peak_ring', t1: 'crater.t_resurge_settling', color: '#b9ab97' },
    { label: { pl: 'suewit warstwowany (sejsze)', en: 'bedded suevite (seiches)' }, top: 'crust.m0077a_bedded_suevite_top', bot: 'crust.m0077a_bedded_suevite_bottom', t0: 'crater.t_resurge_settling', t1: 'crater.t_tsunami_return', color: '#d8cdb8' },
  ].map((u) => ({ ...u, topM: reg.num(u.top), botM: reg.num(u.bot), t0s: reg.num(u.t0), t1s: reg.num(u.t1) })));
  const colTop = $derived(Math.min(...UNITS.map((u) => u.topM)));
  const colBot = $derived(Math.max(...UNITS.map((u) => u.botM)));
  const colH = 170;
  const my = (m: number) => ((m - colTop) / (colBot - colTop)) * colH;
  const grown = (u: { topM: number; botM: number; t0s: number; t1s: number }) => {
    const f = Math.min(1, Math.max(0, (t - u.t0s) / (u.t1s - u.t0s)));
    return u.botM - f * (u.botM - u.topM); // aktualny strop jednostki (głębokość) — rośnie od spągu
  };
  const tsunamiT = $derived(reg.num('crater.t_tsunami_return'));
  const m0077R = $derived(reg.num('crust.m0077a_radial_distance'));
  const yTicks = [20, 10, 0, -10, -20, -30, -40];
  const xTicks = [-150, -100, -50, 0, 50, 100, 150];
</script>

<div class="sec" bind:clientWidth={w} bind:clientHeight={h}>
  <svg width={w} height={h} role="img" aria-label={L('Przekrój skorupy przez krater w chwili T', 'Cross-section of the crust through the crater at time T')}>
    <defs>
      <pattern id="sedpat" width="10" height="6" patternUnits="userSpaceOnUse">
        <rect width="10" height="6" fill="#8b7b58" /><path d="M0 3H10" stroke="#a8996f" stroke-width="0.8" />
      </pattern>
      <radialGradient id="plumeg">
        <stop offset="0" stop-color={plume?.color ?? '#fff'} stop-opacity="1" />
        <stop offset="0.6" stop-color={plume?.color ?? '#fff'} stop-opacity="0.55" />
        <stop offset="1" stop-color="#ff7a3d" stop-opacity="0" />
      </radialGradient>
      <radialGradient id="flashg">
        <stop offset="0" stop-color="#fffef0" stop-opacity="1" /><stop offset="0.3" stop-color="#ffe196" stop-opacity="0.8" /><stop offset="1" stop-color="#ff7a3d" stop-opacity="0" />
      </radialGradient>
      <clipPath id="plotclip"><rect x={M.l} y={M.t} width={Math.max(0, w - M.l - M.r)} height={Math.max(0, h - M.t - M.b)} /></clipPath>
      <clipPath id="solidclip"><path d={crustPath} /></clipPath>
    </defs>

    <g clip-path="url(#plotclip)">
      <rect x={M.l} y={M.t} width={w - M.l - M.r} height={h - M.t - M.b} fill="#0b111b" />
      {#if plume}
        <ellipse cx={sx(0)} cy={sy(0)} rx={sx(plume.rad) - sx(0)} ry={sy(0) - sy(plume.rad)} fill="url(#plumeg)" opacity={plume.a} />
      {/if}
      {#if flash > 0}
        <ellipse cx={sx(0)} cy={sy(0)} rx={20 + 40 * flash} ry={20 + 40 * flash} fill="url(#flashg)" opacity={flash} style="mix-blend-mode:screen" />
      {/if}
      <path d={waterPath} fill="#1f5a86" fill-opacity="0.85" />
      <path d={crustPath} fill="#4b4656" />
      <path d={mantlePath} fill="#4a2f28" />
      <path d={sedPath} fill="url(#sedpat)" />
      <path d={line(h10)} class="hz" /><path d={line(h20)} class="hz" />
      <path d={line(moho)} fill="none" stroke="#c48a66" stroke-width="1.4" />
      <path d={meltPath} fill="#ff6a2b" fill-opacity="0.9" />
      {#if t >= k.tTr}<path d={transientRef} fill="none" stroke="var(--c-crater)" stroke-dasharray="5 4" stroke-width="1.1" opacity="0.7" />{/if}
      {#if shockPath}<path d={shockPath} fill="none" stroke="var(--c-seismic)" stroke-width="1.6" clip-path="url(#solidclip)" />{/if}
      {#if curtain}<path d={curtain.d} fill="var(--c-ejecta)" fill-opacity={curtain.a} />{/if}
      {#if impactor}
        {#if t < 0}
          <line x1={sx(impactor.cx)} y1={sy(impactor.cy)} x2={sx(impactor.cx + 80 * Math.cos(ang))} y2={sy(impactor.cy + 80 * Math.sin(ang))} stroke="#ffd59a" stroke-opacity="0.55" stroke-width="5" stroke-linecap="round" />
        {/if}
        <ellipse cx={sx(impactor.cx)} cy={sy(impactor.cy)} rx={sx(dImp / 2) - sx(0)} ry={sy(0) - sy(dImp / 2)} fill="#2b2622" stroke="#ffcf8a" stroke-width="1.5" opacity={impactor.alpha} />
      {/if}
      <line x1={M.l} x2={w - M.r} y1={sy(0)} y2={sy(0)} stroke="#6aa6d6" stroke-opacity="0.35" stroke-dasharray="2 4" />
      {#if t >= k.tPR}
        <line x1={sx(-m0077R)} x2={sx(-m0077R)} y1={sy(2)} y2={sy(-2.5)} stroke="#ffffff" stroke-width="1.4" />
        <text x={sx(-m0077R)} y={sy(2) - 4} text-anchor="middle" class="lbl">M0077A</text>
      {/if}
    </g>

    {#each yTicks as y}<text x={M.l - 6} y={sy(y) + 3} text-anchor="end" class="tick">{y > 0 ? '+' : ''}{y}</text>{/each}
    <text x={10} y={M.t + 8} class="tick">km</text>
    {#each xTicks as x}<text x={sx(x)} y={h - M.b + 14} text-anchor="middle" class="tick">{Math.abs(x)}</text>{/each}
    <text x={M.l} y={h - 4} class="tick">← SW · {L('z biegiem lotu', 'downrange')}</text>
    <text x={w - M.r} y={h - 4} text-anchor="end" class="tick">NE · {L('skąd nadleciał', 'where it came from')} →</text>
    <text x={(M.l + w - M.r) / 2} y={h - 4} text-anchor="middle" class="tick">{L('odległość od środka [km]', 'distance from the centre [km]')}</text>
  </svg>

  <div class="hud small">
    <div><b>{L('Przekrój SW–NE przez środek krateru', 'SW–NE cross-section through the crater centre')}</b> · {L('płaszczyzna toru impaktora', 'plane of the impactor trajectory')}</div>
    <div>{L('faza', 'phase')}: <b class="ph-crater">{tx(PHASE[st.phase]!)}</b>{#if st.cavityRadius > 0} · {L('promień jamy', 'cavity radius')} {formatNumber(st.cavityRadius, 3)} km{/if}</div>
    <div class="muted">{L('przewyższenie pionowe', 'vertical exaggeration')} ×{formatNumber(ve, 2)} · {L('kształt między klatkami kluczowymi', 'shape between keyframes')}: <span class="mk-predictive">△ {L('model predykcyjny projektu', 'project predictive model')}</span>; {L('klatki kluczowe (hydrokod ◐) — w panelu „Krater”', 'keyframes (hydrocode ◐) — in the “Crater” panel')}</div>
  </div>

  <div class="legend small">
    <span><i style="background:#1f5a86"></i>{L('woda (rampa △)', 'water (ramp △)')}</span>
    <span><i style="background:#8b7b58"></i>{L('osady węglanowo-ewaporatowe', 'carbonate-evaporite sediments')} <Value value={k.Hs} unit="km" paramId="target.sediment_thickness" certainty={reg.param('target.sediment_thickness').certainty} /></span>
    <span><i style="background:#4b4656"></i>{L('skorupa krystaliczna', 'crystalline crust')}</span>
    <span><i style="background:#4a2f28"></i>{L('płaszcz · Moho', 'mantle · Moho')} <Value value={k.Hc} unit="km" paramId="target.crust_thickness" certainty={reg.param('target.crust_thickness').certainty} /></span>
    <span><i style="background:#ff6a2b"></i>{L('stop impaktowy', 'impact melt')}</span>
    <span><i class="dash"></i>{L('pierwotne głębokości 10 i 20 km', 'original depths of 10 and 20 km')}</span>
    <span><i style="background:var(--c-seismic)"></i>{L('front fali uderzeniowej/P', 'shock / P-wave front')}</span>
    <span><i style="background:var(--c-ejecta)"></i>{L('kurtyna ejecta (symbol)', 'ejecta curtain (symbol)')}</span>
  </div>

  <div class="core small">
    <div class="ch"><b>{L('Rdzeń M0077A', 'Core M0077A')}</b> — {L('osady 1. doby na pierścieniu', 'day-one deposits on the peak ring')}</div>
    <div class="colwrap">
      <div class="col" style={`height:${colH}px`}>
        {#each UNITS as u}
          {@const top = grown(u)}
          {#if top < u.botM}
            <div class="unit" style={`top:${my(top)}px;height:${Math.max(1, my(u.botM) - my(top))}px;background:${u.color}`}></div>
          {/if}
        {/each}
        {#if t >= tsunamiT}<div class="unit ts" style={`top:0;height:2px`}></div>{/if}
      </div>
      <ol class="ul">
        {#each UNITS.slice().reverse() as u}
          <li class:on={t >= u.t0s}><i style={`background:${u.color}`}></i>{tx(u.label)} <span class="muted">{L('do', 'by')}</span> <Value value={formatClock(u.t1s)} certainty={reg.param(u.t1).certainty} paramId={u.t1} /></li>
        {/each}
        <li class:on={t >= tsunamiT}><i style="background:var(--c-tsunami)"></i>{L('warstwa tsunami', 'tsunami layer')} <Value value={formatClock(tsunamiT)} certainty={reg.param('crater.t_tsunami_return').certainty} paramId="crater.t_tsunami_return" /></li>
      </ol>
    </div>
    <div class="muted">{L('miąższości z rdzenia (●); razem', 'thicknesses from the core (●); total')} <Value value={reg.num('crater.day1_infill_thickness')} unit="m" paramId="crater.day1_infill_thickness" certainty={reg.param('crater.day1_infill_thickness').certainty} /></div>
  </div>
</div>

<style>
  .sec { position: relative; width: 100%; height: 100%; overflow: hidden; background: #070a10; }
  svg { position: absolute; inset: 0; display: block; }
  .tick { fill: var(--muted); font-size: 10.5px; }
  .lbl { fill: #fff; font-size: 10.5px; }
  .hz { fill: none; stroke: rgba(255, 255, 255, 0.28); stroke-dasharray: 3 4; stroke-width: 1; }
  .hud { position: absolute; left: 52px; top: 10px; max-width: min(560px, calc(100% - 300px)); padding: 6px 9px; border-radius: 6px; background: rgba(11, 14, 20, 0.8); border: 1px solid var(--line2); color: var(--ink); }
  .legend { position: absolute; left: 52px; bottom: 36px; display: flex; flex-wrap: wrap; gap: 3px 12px; max-width: calc(100% - 330px); padding: 5px 8px; border-radius: 6px; background: rgba(11, 14, 20, 0.78); }
  .legend i { display: inline-block; width: 11px; height: 9px; margin-right: 5px; border-radius: 2px; vertical-align: -1px; }
  .legend i.dash { background: none; border-top: 1px dashed rgba(255,255,255,.6); height: 0; vertical-align: 3px; }
  .core { position: absolute; right: 18px; bottom: 36px; width: 268px; padding: 7px 9px; border-radius: 6px; background: rgba(11, 14, 20, 0.86); border: 1px solid var(--line2); }
  .ch { margin-bottom: 5px; color: var(--ink); }
  .colwrap { display: grid; grid-template-columns: 26px 1fr; gap: 9px; align-items: start; margin-bottom: 4px; }
  .col { position: relative; width: 26px; background: repeating-linear-gradient(0deg, #2a2a33 0 4px, #24242c 4px 8px); border: 1px solid var(--line2); }
  .unit { position: absolute; left: 0; right: 0; }
  .unit.ts { background: var(--c-tsunami); }
  .ul { list-style: none; margin: 0; padding: 0; display: grid; gap: 3px; }
  .ul li { opacity: 0.45; } .ul li.on { opacity: 1; }
  .ul i { display: inline-block; width: 9px; height: 9px; border-radius: 2px; margin-right: 5px; vertical-align: -1px; }
</style>
