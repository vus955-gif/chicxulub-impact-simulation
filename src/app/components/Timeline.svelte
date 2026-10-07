<script lang="ts">
  import { ui } from '../state.svelte';
  import type { AppData } from '../data';
  import { LANES, laneOfGroup } from '../phenomena';
  import { L, certLabel } from '../i18n';
  import { createAxis, formatClock } from '../../time/axis';
  import { nextEvent, prevEvent, type TimelineEvent } from '../../time/events';

  let { data }: { data: AppData } = $props();

  const tEntry = $derived(data.reg.num('impactor.entry_duration'));
  const axis = $derived(createAxis({ tEntry, tMin: 0.01, tMax: 86400, prologShare: 0.05 }));
  let width = $state(900);
  const padL = 150, padR = 16, laneH = 17, top = 6;
  const H = top + LANES.length * laneH + 24;
  const x = (t: number) => padL + axis.tToU(t) * (width - padL - padR);
  const events = $derived(data.events.filter((e) => e.t <= 86400 && e.t >= -tEntry));
  const laneIndex = (e: TimelineEvent) => LANES.findIndex((l) => l.key === laneOfGroup(e.group));

  let dragging = false;
  function tAtPointer(ev: PointerEvent, svg: SVGSVGElement) {
    const r = svg.getBoundingClientRect();
    const u = Math.min(1, Math.max(0, (ev.clientX - r.left - padL) / (r.width - padL - padR)));
    return axis.uToT(u);
  }
  function down(ev: PointerEvent) {
    const svg = ev.currentTarget as SVGSVGElement;
    dragging = true; svg.setPointerCapture(ev.pointerId); ui.playing = false; ui.t = tAtPointer(ev, svg);
  }
  function move(ev: PointerEvent) { if (dragging) ui.t = tAtPointer(ev, ev.currentTarget as SVGSVGElement); }
  function up() { dragging = false; }

  function jumpDecade(dir: 1 | -1) { ui.t = ui.t <= 0 ? (dir > 0 ? 0.01 : -tEntry) : Math.min(86400, Math.max(0.01, ui.t * 10 ** dir)); }
  function onKey(e: KeyboardEvent) {
    if ((e.target as HTMLElement)?.tagName === 'SELECT' || (e.target as HTMLElement)?.tagName === 'INPUT') return;
    if (e.key === ' ') { e.preventDefault(); ui.playing = !ui.playing; }
    else if (e.key === 'ArrowRight') { e.preventDefault(); if (e.shiftKey) jumpDecade(1); else { const n = nextEvent(events, ui.t); if (n) ui.t = n.t; } }
    else if (e.key === 'ArrowLeft') { e.preventDefault(); if (e.shiftKey) jumpDecade(-1); else { const p = prevEvent(events, ui.t); if (p) ui.t = p.t; } }
  }
  const shape = (c: string, cx: number, cy: number) => {
    const r = 4;
    if (c === 'contested') return `M${cx} ${cy - 5} L${cx + 5} ${cy} L${cx} ${cy + 5} L${cx - 5} ${cy} Z`;
    if (c === 'predictive') return `M${cx} ${cy - 5} L${cx + 5} ${cy + 4} L${cx - 5} ${cy + 4} Z`;
    return `M${cx - r} ${cy} a${r} ${r} 0 1 0 ${2 * r} 0 a${r} ${r} 0 1 0 ${-2 * r} 0`;
  };
</script>

<svelte:window onkeydown={onKey} />

<section class="tl">
  <div class="controls">
    <button onclick={() => { ui.t = -tEntry; ui.playing = false; }} title={L('Na początek (przelot)', 'To the start (entry)')}>⏮</button>
    <button class="play" onclick={() => (ui.playing = !ui.playing)} aria-label={ui.playing ? L('Pauza', 'Pause') : L('Odtwórz', 'Play')}>{ui.playing ? '❚❚' : '▶'}</button>
    <button onclick={() => { const p = prevEvent(events, ui.t); if (p) ui.t = p.t; }} title={L('Poprzednie zdarzenie (←)', 'Previous event (←)')}>◀|</button>
    <button onclick={() => { const n = nextEvent(events, ui.t); if (n) ui.t = n.t; }} title={L('Następne zdarzenie (→)', 'Next event (→)')}>|▶</button>
    <span class="clock">{formatClock(ui.t)}</span>
    <span class="sep"></span>
    <label class="small">{L('tryb', 'mode')}
      <select bind:value={ui.mode}><option value="adaptive">{L('adaptacyjny (dekady/s)', 'adaptive (decades/s)')}</option><option value="realtime">{L('czas rzeczywisty', 'real time')}</option></select>
    </label>
    {#if ui.mode === 'adaptive'}
      <label class="small">{L('prędkość', 'speed')}
        <select bind:value={ui.dps}>{#each [0.15, 0.3, 0.5, 1] as v}<option value={v}>{L(`${String(v).replace('.', ',')} dek./s`, `${v} dec./s`)}</option>{/each}</select>
      </label>
    {/if}
    <span class="sep"></span>
    <button onclick={() => (ui.t = 1)}>{L('sekundy', 'seconds')}</button>
    <button onclick={() => (ui.t = 60)}>{L('minuty', 'minutes')}</button>
    <button onclick={() => (ui.t = 3600)}>{L('godziny', 'hours')}</button>
    <span class="hint small muted">{L('spacja · ←/→ zdarzenia · Shift+←/→ dekada', 'space · ←/→ events · Shift+←/→ decade')}</span>
  </div>
  <div class="svgwrap" bind:clientWidth={width}>
    <svg {width} height={H} role="slider" aria-label={L('Oś czasu', 'Timeline')} aria-valuenow={ui.t} tabindex="0"
      onpointerdown={down} onpointermove={move} onpointerup={up} onpointercancel={up}>
      {#each axis.ticks() as k}
        <line x1={x(k.t)} x2={x(k.t)} y1={top} y2={top + LANES.length * laneH} class="grid" />
        <text x={x(k.t)} y={H - 6} text-anchor="middle" class="tick">{ui.lang === 'en' && k.labelEn ? k.labelEn : k.label}</text>
      {/each}
      {#each LANES as l, i}
        <text x={padL - 8} y={top + i * laneH + laneH / 2 + 4} text-anchor="end" class={`lane-label ph-${l.key}`} opacity={ui.layers[l.key] ? 1 : 0.4}>{ui.lang === 'en' ? l.label.en : l.label.pl}</text>
        <line x1={padL} x2={width - padR} y1={top + i * laneH + laneH / 2} y2={top + i * laneH + laneH / 2} class="lane" />
      {/each}
      {#each events as e (e.id)}
        {@const li = laneIndex(e)}
        {#if li >= 0}
          {@const cy = top + li * laneH + laneH / 2}
          <g class={`ph-${LANES[li]!.key}`} opacity={ui.layers[LANES[li]!.key] ? 1 : 0.35}>
            {#if e.range}<line x1={x(Math.max(e.range[0], -tEntry))} x2={x(Math.min(e.range[1], 86400))} y1={cy} y2={cy} stroke="currentColor" stroke-opacity="0.5" stroke-width="2" />{/if}
            <path d={shape(e.certainty, x(e.t), cy)} fill={e.certainty === 'fact' ? 'currentColor' : e.certainty === 'extrapolation' ? 'currentColor' : 'none'}
              fill-opacity={e.certainty === 'extrapolation' ? 0.45 : 1} stroke="currentColor" stroke-width="1.4" class="ev"
              role="button" tabindex="-1" aria-label={ui.lang === 'en' && e.labelEn ? e.labelEn : e.label}
              onpointerdown={(ev) => { ev.stopPropagation(); ui.playing = false; ui.t = e.t; }}>
              <title>{ui.lang === 'en' && e.labelEn ? e.labelEn : e.label} — {formatClock(e.t)} ({certLabel(e.certainty)})</title>
            </path>
          </g>
        {/if}
      {/each}
      <line x1={x(ui.t)} x2={x(ui.t)} y1={0} y2={top + LANES.length * laneH + 2} class="head" />
      <circle cx={x(ui.t)} cy={top + LANES.length * laneH + 2} r="4" class="headdot" />
    </svg>
  </div>
</section>

<style>
  .tl { background: var(--panel); border-top: 1px solid var(--line); padding: 6px 10px 2px; }
  .controls { display: flex; align-items: center; gap: 6px; flex-wrap: wrap; margin-bottom: 4px; }
  .play { min-width: 38px; }
  .clock { font-family: var(--mono); color: var(--accent); min-width: 135px; }
  .sep { width: 1px; height: 18px; background: var(--line2); margin: 0 4px; }
  .hint { margin-left: auto; }
  .svgwrap { width: 100%; }
  svg { display: block; touch-action: none; cursor: ew-resize; user-select: none; }
  .grid { stroke: var(--line); } .lane { stroke: #1a2130; stroke-width: 9; stroke-linecap: round; }
  .tick { fill: var(--muted); font-size: 10.5px; } .lane-label { fill: currentColor; font-size: 11px; }
  .ev { cursor: pointer; } .head { stroke: var(--accent); stroke-width: 1.6; } .headdot { fill: var(--accent); }
</style>
