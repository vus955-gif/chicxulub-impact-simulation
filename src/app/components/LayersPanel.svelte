<script lang="ts">
  import { ui } from '../state.svelte';
  import type { AppData } from '../data';
  import { LANES } from '../phenomena';
  import { frontsAt } from '../../model/sim/fronts';
  import { L, tx } from '../i18n';

  let { data }: { data: AppData } = $props();

  // kropka aktywności: czy zjawisko „trwa” w bieżącym t
  const active = $derived.by(() => {
    const t = ui.t, f = frontsAt(data.ctx, t), has = (k: string) => f.some((x) => x.kind === k);
    const fireballEnd = data.reg.seconds('fireball.radiation_duration_eiep');
    return {
      crater: t >= 0 && t <= data.reg.num('crater.t_final'),
      thermal: (t > 0 && t <= fireballEnd) || has('ejecta'),
      ejecta: has('ejecta'),
      seismic: has('P') || has('S') || t > 0,
      air: t > 0,
      tsunami: t >= data.reg.num('tsunami.range2022_handoff_time') * 0.25,
      fires: t > data.reg.num('fireball.t_max_radiation_eiep'),
      atmo: t > data.reg.num('ejecta.t_curtain_breakup'),
      bio: t > 0,
    } as Record<string, boolean>;
  });
</script>

<section class="panel scroll" aria-label={L('Warstwy', 'Layers')}>
  <h2>{L('Warstwy', 'Layers')}</h2>
  {#each LANES as l (l.key)}
    <label class={`row ph-${l.key}`} title={tx(l.notShown)}>
      <input type="checkbox" bind:checked={ui.layers[l.key]} />
      <span class="dot"></span>
      <span class="lbl">{tx(l.label)}</span>
      <span class="act" class:on={active[l.key]} title={active[l.key] ? L('zjawisko trwa', 'phenomenon in progress') : ''}></span>
    </label>
    {#if ui.layers[l.key]}<p class="not small">{tx(l.notShown)}</p>{/if}
  {/each}

  <h2 class="mt">{L('Widok pola', 'Field view')}</h2>
  <div class="seg">
    <button class:on={!ui.envelope} onclick={() => (ui.envelope = false)}>{L('stan chwilowy', 'current state')}</button>
    <button class:on={ui.envelope} onclick={() => (ui.envelope = true)}>{L('maksimum do T', 'maximum up to T')}</button>
  </div>
  <label class="row coast" title={L('Natural Earth 1:50m (domena publiczna) obrócone modelem PALEOMAP do wieku mapy — pomaga rozpoznać dzisiejsze kontynenty; to nie jest linia brzegowa sprzed 66 mln lat', 'Natural Earth 1:50m (public domain) rotated with the PALEOMAP model to the map age — helps recognise today’s continents; this is not the coastline of 66 million years ago')}>
    <input type="checkbox" bind:checked={ui.coast} /><span class="dot"></span><span class="lbl">{L('dzisiejsze linie brzegowe', 'present-day coastlines')}</span><span></span>
  </label>
  {#if ui.coast}<p class="not small">{L('Tylko orientacja: dzisiejsze wybrzeża przesunięte z płytami do położenia sprzed 66 mln lat — nie paleolinia brzegowa.', 'For orientation only: today’s coasts moved with the plates to their position 66 million years ago — not the palaeo-coastline.')}</p>{/if}

  <h2 class="mt">{L('Scenariusze sporne', 'Contested scenarios')} <span class="mk-contested">⚑</span></h2>
  <label class="sel">{L('Impuls cieplny', 'Thermal pulse')}
    <select bind:value={ui.thermal}>
      <option value="morgan">{L('Morgan i in. 2013 — 3D, asymetria', 'Morgan et al. 2013 — 3D, asymmetry')}</option>
      <option value="goldin">{L('Goldin & Melosh 2009 — samoekranowanie', 'Goldin & Melosh 2009 — self-shielding')}</option>
      <option value="melosh">{L('Melosh i in. 1990 — globalnie, godziny', 'Melosh et al. 1990 — global, hours')}</option>
    </select>
  </label>
  <label class="sel">{L('Pożary', 'Fires')}
    <select bind:value={ui.fires}>
      <option value="regional">{L('regionalne (lepiej udokumentowane)', 'regional (better documented)')}</option>
      <option value="global">{L('globalne (sporne)', 'global (contested)')}</option>
    </select>
  </label>
</section>

<style>
  .panel { padding: 10px 12px; background: var(--panel); border-right: 1px solid var(--line); }
  .row { display: grid; grid-template-columns: 16px 10px 1fr 10px; gap: 6px; align-items: center; padding: 3px 0; cursor: pointer; }
  .row input { margin: 0; accent-color: currentColor; }
  .dot { width: 9px; height: 9px; border-radius: 50%; background: currentColor; }
  .lbl { color: var(--ink); }
  .act { width: 7px; height: 7px; border-radius: 50%; border: 1px solid var(--line2); }
  .act.on { background: currentColor; border-color: currentColor; box-shadow: 0 0 6px currentColor; }
  .not { margin: 0 0 4px 32px; line-height: 1.3; }
  .mt { margin-top: 14px; }
  .seg { display: flex; gap: 4px; }
  .coast { margin-top: 8px; color: #e8e8e8; }
  .sel { display: grid; gap: 3px; margin: 6px 0; color: var(--ink2); }
  .sel select { width: 100%; }
</style>
