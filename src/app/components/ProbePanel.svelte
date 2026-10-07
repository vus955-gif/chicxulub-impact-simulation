<script lang="ts">
  import { ui } from '../state.svelte';
  import type { AppData } from '../data';
  import { probe } from '../../model/sim/probe';
  import { formatClock } from '../../time/axis';
  import { formatNumber, CERTAINTY_MARK } from '../../model/registry/format';
  import Value from './Value.svelte';
  import { bioZones, bioArrivalS } from '../../model/sim/biosphere';
  import { siteComparisons, ratio } from '../site-compare';
  import { LAYER_OF } from '../phenomena';
  import { L, tx, certLabel, siteName, obsText } from '../i18n';

  let { data }: { data: AppData } = $props();

  const site = $derived(ui.site ? data.sites.find((s) => s.id === ui.site) : undefined);
  const point = $derived(site ? { lat: site.paleoLat, lon: site.paleoLon } : ui.probe);
  const report = $derived(point ? probe(data.ctx, { elev: data.elev, tsunamiTT: data.tsunamiTT, tsunamiAmp: data.tsunamiAmp }, point, { thermal: ui.thermal, fires: ui.fires }) : null);
  const sector = (a: number) => (a <= 30 ? L('z biegiem impaktora', 'downrange of the impactor') : a <= 90 ? L('w bok od kierunku lotu', 'to the side of the flight path') : a < 120 ? L('w bok, ku tyłowi', 'to the side, towards the rear') : L('pod bieg impaktora', 'uprange of the impactor'));
  const litDepth = $derived(site ? data.reg.opt(`paleo.water_depth_${site.id}`) : undefined);
  const mapConflict = $derived(!!(litDepth && report && report.mapIsOcean === false));
  const zones = $derived(bioZones(data.ctx));
  const bioHere = $derived(report ? zones
    .map((z) => ({ z, t: bioArrivalS(data.ctx, z, report.distanceKm), sure: z.radiusLowKm === undefined || report.distanceKm <= z.radiusLowKm }))
    .filter((x): x is { z: (typeof zones)[number]; t: number; sure: boolean } => x.t !== undefined)
    .sort((a, b) => a.t - b.t) : []);
  const compare = $derived(site && report ? siteComparisons(site.id, report, data.reg) : []);
  const fmtCmp = (v: { value: number; unit: string; kind: 'time' | 'number' }) => (v.kind === 'time' ? formatClock(v.value).replace('T+ ', '') : `${formatNumber(v.value, 3)} ${v.unit}`);
  const until = (t: number) => {
    const d = t - ui.t;
    return d <= 0 ? '✓' : `${L('za', 'in')} ${formatClock(d).replace('T+ ', '')}`;
  };
  function pick(e: Event) {
    const v = (e.target as HTMLSelectElement).value;
    if (v === '__map') { ui.site = null; } else { ui.site = v; ui.probe = null; }
  }
</script>

<section class="panel scroll" aria-label={L('Sonda', 'Probe')}>
  <h2>{L('Sonda', 'Probe')}</h2>
  <select class="pick" value={ui.site ?? '__map'} onchange={pick}>
    <option value="__map">{ui.probe ? L('punkt wskazany na mapie', 'point picked on the map') : L('— kliknij na mapie lub wybierz stanowisko —', '— click the map or choose a site —')}</option>
    {#each data.sites as s (s.id)}<option value={s.id}>{siteName(s)}</option>{/each}
  </select>

  {#if report}
    <div class="head">
      <div><b>{site ? siteName(site) : L('Punkt na mapie', 'Point on the map')}</b></div>
      <div class="small">paleo {formatNumber(report.point.lat, 3)}°, {formatNumber(report.point.lon, 3)}° · {formatNumber(report.distanceKm, 3)} {L('km od krateru', 'km from the crater')} · {sector(report.azRelDownrangeDeg)}</div>
      {#if report.waterDepthPredictive}
        <div class="small">{L('głębokość wody (rampa wokół krateru)', 'water depth (ramp around the crater)')}: <Value value={report.waterDepthM!} unit="m" certainty="predictive" title={L('Rampa głębokości wokół punktu zero', 'Depth ramp around ground zero')} method="predictive:water-depth"
          note={L('Model predykcyjny projektu: PaleoDEM pokazuje w okolicy krateru ląd, literatura — płytkie morze pogłębiające się ku NNE.', 'Project predictive model: PaleoDEM shows land around the crater, the literature a shallow sea deepening towards NNE.')} /></div>
      {:else if report.elevationM !== undefined}
        <div class="small">{L('mapa PaleoDEM', 'PaleoDEM map')}: {report.mapIsOcean ? L(`ocean, ${formatNumber(-report.elevationM, 2)} m głębokości`, `ocean, ${formatNumber(-report.elevationM, 2)} m deep`) : L(`ląd, ${formatNumber(report.elevationM, 2)} m n.p.m.`, `land, ${formatNumber(report.elevationM, 2)} m a.s.l.`)}</div>
      {/if}
      {#if mapConflict && litDepth}
        <div class="warn small">⚠ {L('Stanowisko morskie (głębokość wg literatury', 'Marine site (depth from the literature')}: <Value value={litDepth.value as number} unit={litDepth.unit} certainty={litDepth.certainty} paramId={litDepth.id} />), {L('a mapa PaleoDEM pokazuje tu ląd — ograniczenie rozdzielczości i linii brzegowych mapy.', 'but the PaleoDEM map shows land here — a limit of the map’s resolution and coastlines.')}</div>
      {/if}
    </div>

    <ol class="events">
      {#each report.events as e (e.kind)}
        <li class:past={e.t <= ui.t} class={`ph-${LAYER_OF[e.kind]}`}>
          <div class="evh">
            <span class="dot"></span><span class="lbl">{tx(e.label)}</span>
            <button class="t" title={L('Przejdź do tej chwili', 'Jump to this moment')} onclick={() => { ui.t = e.t; ui.playing = false; }}>{formatClock(e.t)}</button>
            <span class="st">{until(e.t)}</span>
            <span class={`mk mk-${e.certainty}`} title={certLabel(e.certainty)}>{CERTAINTY_MARK[e.certainty]}</span>
          </div>
          {#each e.values as v}
            <div class="val small">{tx(v.label)}: <Value value={typeof v.value === 'object' ? tx(v.value) : v.value} unit={v.unit} certainty={e.certainty} sourceIds={e.sourceIds}
              title={`${tx(e.label)}: ${tx(v.label)}`} method={tx(e.method)} note={e.note ? tx(e.note) : undefined} /></div>
          {/each}
          {#if e.note}<div class="note small muted">{tx(e.note)}</div>{/if}
        </li>
      {/each}
    </ol>

    <h2 class="mt">{L('Skutki dla biosfery w tym miejscu', 'Effects on the biosphere here')}</h2>
    {#if bioHere.length === 0}
      <p class="small muted">{L('Poza strefami bezpośrednich zniszczeń z modelu (wiatr, promieniowanie kuli ognia, wstrząsy). Dalsze skutki tu: impuls IR i pożary (wyżej, zależnie od scenariusza), opad sferul, zaciemnienie, tsunami na wybrzeżach.',
        'Outside the model’s zones of direct destruction (wind, fireball radiation, shaking). Other effects here: IR pulse and fires (above, depending on the scenario), spherule fall, darkness, tsunami on the coasts.')}</p>
    {:else}
      <ol class="events">
        {#each bioHere as b (b.z.key)}
          <li class:past={b.t <= ui.t} class="ph-bio">
            <div class="evh">
              <span class="dot"></span>
              <span class="lbl">{tx(b.z.label)}{#if !b.sure} <span class="muted">({L('możliwe — w paśmie niepewności', 'possible — within the uncertainty band')})</span>{/if}</span>
              <button class="t" title={L('Przejdź do tej chwili', 'Jump to this moment')} onclick={() => { ui.t = b.t; ui.playing = false; }}>{formatClock(b.t)}</button>
              <span class="st">{until(b.t)}</span>
              <span class={`mk mk-${b.z.certainty}`} title={certLabel(b.z.certainty)}>{CERTAINTY_MARK[b.z.certainty]}</span>
            </div>
            <div class="val small">{L('zasięg strefy', 'zone extent')}: <Value value={b.z.radiusLowKm !== undefined ? `${formatNumber(b.z.radiusLowKm, 3)}–${formatNumber(b.z.radiusKm, 3)}` : b.z.radiusKm} unit="km" certainty={b.z.certainty}
              sourceIds={b.z.sourceIds} title={tx(b.z.label)} method={tx(b.z.method)} note={b.z.note ? tx(b.z.note) : undefined} /></div>
          </li>
        {/each}
      </ol>
    {/if}

    {#if compare.length}
      <h2 class="mt">{L('Model a literatura o stanowisku', 'Model vs literature for this site')}</h2>
      <table class="cmp small">
        <thead><tr><th></th><th>model</th><th>{L('literatura', 'literature')}</th><th title={L('stosunek model / literatura', 'ratio model / literature')}>×</th></tr></thead>
        <tbody>
          {#each compare as c (c.label.pl)}
            {@const lp = data.reg.param(c.litParamId)}
            {@const q = ratio(c)}
            <tr>
              <td>{tx(c.label)}{#if c.note}<div class="muted">{tx(c.note)}</div>{/if}</td>
              <td class="num">{c.model ? fmtCmp(c.model) : '—'}</td>
              <td class="num"><Value value={fmtCmp(c.lit)} certainty={lp.certainty} paramId={c.litParamId} /></td>
              <td class="num">{q !== null ? formatNumber(q, 2) : ''}</td>
            </tr>
          {/each}
        </tbody>
      </table>
    {/if}

    {#if site}
      <h2 class="mt">{L('Zapis geologiczny stanowiska', 'Geological record of the site')}</h2>
      <ul class="obs small">
        {#each site.observations as o}
          <li>{obsText(o)} <Value value={certLabel(o.certainty)} certainty={o.certainty} sourceIds={o.sources} title={siteName(site)} /></li>
        {/each}
      </ul>
    {/if}
  {:else}
    <p class="small muted">{L('Wybierz stanowisko granicy K-Pg albo kliknij dowolne miejsce na mapie, aby zobaczyć, co i kiedy tam dociera.', 'Choose a K-Pg boundary site or click anywhere on the map to see what arrives there and when.')}</p>
  {/if}
</section>

<style>
  .panel { padding: 10px 12px; background: var(--panel); border-left: 1px solid var(--line); border-top: 1px solid var(--line); }
  .pick { width: 100%; margin-bottom: 8px; }
  .head { display: grid; gap: 3px; margin-bottom: 8px; }
  .warn { color: #ffc27a; background: #2a2010; border: 1px solid #5a4420; border-radius: 6px; padding: 4px 6px; }
  .events { list-style: none; margin: 0; padding: 0; display: grid; gap: 6px; }
  .events li { border-left: 2px solid currentColor; padding-left: 8px; opacity: .75; }
  .events li.past { opacity: 1; }
  .evh { display: grid; grid-template-columns: 9px 1fr auto auto 14px; gap: 6px; align-items: center; }
  .dot { width: 8px; height: 8px; border-radius: 50%; background: currentColor; }
  .lbl { color: var(--ink); }
  .t { font-family: var(--mono); font-size: 11px; padding: 0 5px; }
  .st { font-size: 11px; color: var(--ink2); min-width: 52px; text-align: right; }
  .val { color: var(--ink2); margin-left: 15px; }
  .note { margin-left: 15px; }
  .obs { padding-left: 16px; } .obs li { margin: 3px 0; }
  .mt { margin-top: 12px; }
  .cmp { width: 100%; border-collapse: collapse; }
  .cmp th { text-align: right; font-weight: 600; color: var(--muted); padding: 2px 4px; }
  .cmp th:first-child { text-align: left; }
  .cmp td { padding: 3px 4px; border-top: 1px solid var(--line); vertical-align: top; }
  .cmp td.num { text-align: right; white-space: nowrap; font-variant-numeric: tabular-nums; }
</style>
