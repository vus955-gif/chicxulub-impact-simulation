<script lang="ts">
  import { ui } from '../state.svelte';
  import type { AppData } from '../data';
  import { GUIDE } from '../guide';
  import { formatClock } from '../../time/axis';
  import Value from './Value.svelte';
  import { L, tx, pLabel } from '../i18n';

  let { data }: { data: AppData } = $props();
  const step = $derived(ui.guide === null ? null : GUIDE[ui.guide] ?? null);

  function go(i: number) {
    const s = GUIDE[Math.max(0, Math.min(GUIDE.length - 1, i))]!;
    ui.guide = GUIDE.indexOf(s);
    ui.playing = false;
    ui.t = s.t === 'entry' ? -data.reg.num('impactor.entry_duration') * 0.8 : s.t;
    ui.view = s.view;
    if (s.layers) ui.layers = { ...ui.layers, ...s.layers };
    if (s.site !== undefined) { ui.site = s.site; if (s.site) ui.probe = null; }
  }
  // pierwsze otwarcie przewodnika ustawia krok 0
  $effect(() => { if (ui.guide === -1) go(0); });
</script>

{#if step}
  <aside class="guide" aria-label={L('Przewodnik', 'Guide')}>
    <div class="hd">
      <span class="n">{(ui.guide ?? 0) + 1}/{GUIDE.length}</span>
      <b>{tx(step.title)}</b>
      <span class="clk">{formatClock(ui.t)}</span>
      <button class="x" onclick={() => (ui.guide = null)} aria-label={L('Zamknij przewodnik', 'Close the guide')}>×</button>
    </div>
    <p>{tx(step.text)}</p>
    <div class="vals small">
      {#each step.paramIds as id (id)}
        {@const p = data.reg.opt(id)}
        {#if p && p.value !== null}
          <span class="kv"><span class="muted">{pLabel(p)}:</span> <Value value={p.value as number | string} unit={p.unit} certainty={p.certainty} paramId={id} /></span>
        {/if}
      {/each}
    </div>
    <div class="nav">
      <button onclick={() => go((ui.guide ?? 0) - 1)} disabled={ui.guide === 0}>‹ {L('wstecz', 'back')}</button>
      <button onclick={() => { ui.playing = true; }} title={L('Odtwarzaj od tej chwili', 'Play from this moment')}>▶ {L('odtwarzaj stąd', 'play from here')}</button>
      <button class="on" onclick={() => go((ui.guide ?? 0) + 1)} disabled={ui.guide === GUIDE.length - 1}>{L('dalej', 'next')} ›</button>
    </div>
  </aside>
{/if}

<style>
  .guide { position: absolute; left: 50%; bottom: 34px; transform: translateX(-50%); width: min(560px, calc(100% - 24px)); z-index: 5;
    background: rgba(13, 18, 28, 0.94); border: 1px solid #4b6491; border-radius: 10px; padding: 10px 12px; box-shadow: 0 6px 24px rgba(0,0,0,.45); }
  .hd { display: grid; grid-template-columns: auto 1fr auto auto; gap: 8px; align-items: baseline; }
  .n { font-family: var(--mono); color: var(--accent); font-size: 12px; }
  .clk { font-family: var(--mono); color: var(--ink2); font-size: 12px; }
  .x { padding: 0 7px; line-height: 1.3; }
  p { margin: 6px 0 6px; line-height: 1.45; }
  .vals { display: flex; flex-wrap: wrap; gap: 2px 14px; margin-bottom: 8px; }
  .kv { line-height: 1.35; }
  .nav { display: flex; gap: 6px; justify-content: flex-end; }
</style>
