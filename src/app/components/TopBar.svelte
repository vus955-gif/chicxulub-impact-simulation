<script lang="ts">
  import { ui } from '../state.svelte';
  import type { AppData } from '../data';
  import { formatClock } from '../../time/axis';
  import { phaseAt } from '../../time/events';
  import Value from './Value.svelte';
  import { L, tx, setLang } from '../i18n';

  let { data }: { data: AppData } = $props();
  const thr = $derived({ transientMax: data.reg.num('crater.t_transient_max'), peakRing: data.reg.num('crater.t_peak_ring'), final: data.reg.num('crater.t_final') });
  const age = $derived(data.reg.param('event.age'));
  const views = [
    { key: 'map2d', label: { pl: 'Mapa 2D', en: '2D map' } },
    { key: 'globe', label: { pl: 'Glob 3D', en: '3D globe' } },
    { key: 'closeup', label: { pl: 'Zbliżenie 3D', en: '3D close-up' } },
    { key: 'section', label: { pl: 'Przekrój', en: 'Cross-section' } },
  ] as const;
</script>

<header class="top">
  <div class="title"><b>Chicxulub</b> · <Value value={age.value as number} unit={L('mln lat temu', 'million years ago')} certainty={age.certainty} paramId="event.age" /></div>
  <div class="phase">{tx(phaseAt(ui.t, thr))}</div>
  <div class="clock" aria-live="off">{formatClock(ui.t)}</div>
  <nav class="views" aria-label={L('Widok', 'View')}>
    <button class="guide" class:on={ui.guide !== null} onclick={() => (ui.guide = ui.guide === null ? -1 : null)} title={L('Przewodnik krok po kroku przez pierwszą dobę', 'Step-by-step guide through the first day')}>{L('Przewodnik', 'Guide')}</button>
    {#each views as v}
      <button class:on={ui.view === v.key} onclick={() => (ui.view = v.key)}>{tx(v.label)}</button>
    {/each}
    <span class="lang" role="group" aria-label={L('Język', 'Language')}>
      <button class:on={ui.lang === 'pl'} onclick={() => setLang('pl')} title="Polski">PL</button><button class:on={ui.lang === 'en'} onclick={() => setLang('en')} title="English">EN</button>
    </span>
  </nav>
</header>

<style>
  .top { display: grid; grid-template-columns: auto 1fr auto auto; align-items: center; gap: 16px; padding: 8px 12px; border-bottom: 1px solid var(--line); background: var(--panel); }
  .title { font-size: 14px; white-space: nowrap; }
  .phase { color: var(--ink2); text-align: center; }
  .clock { font-family: var(--mono); font-size: 18px; color: var(--accent); min-width: 150px; text-align: right; }
  .views { display: flex; gap: 4px; }
  .guide { margin-right: 10px; border-color: #6a5a32; color: var(--accent); }
  .lang { display: inline-flex; margin-left: 10px; }
  .lang button { padding: 3px 7px; font-size: 11.5px; }
  .lang button:first-child { border-radius: 6px 0 0 6px; }
  .lang button:last-child { border-radius: 0 6px 6px 0; border-left: none; }
</style>
