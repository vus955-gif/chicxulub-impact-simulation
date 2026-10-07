<script lang="ts">
  import { ui } from '../state.svelte';
  import { tsunamiReachKm, type AppData } from '../data';
  import { frontsAt, type FrontKind } from '../../model/sim/fronts';
  import { formatClock } from '../../time/axis';
  import { FRONT_STYLE } from '../legend';
  import { L, tx, pLabel } from '../i18n';
  import Value from './Value.svelte';

  let { data }: { data: AppData } = $props();
  const r = $derived(data.reg);
  const fronts = $derived(frontsAt(data.ctx, ui.t));
  const FRONT_LANE: Record<FrontKind, string> = { P: 'seismic', S: 'seismic', R: 'seismic', G: 'seismic', lamb: 'air', ejecta: 'ejecta', fireball: 'thermal' };
  const handoff = $derived(r.num('tsunami.range2022_handoff_time'));
  const craterSteps = [
    { id: 'crater.t_transient_max', label: { pl: 'krater przejściowy', en: 'transient crater' }, valueId: 'crater.transient_diameter' },
    { id: 'crater.t_uplift_max', label: { pl: 'maks. wypiętrzenie', en: 'max. uplift' }, valueId: 'crater.central_uplift_max_height' },
    { id: 'crater.t_peak_ring', label: { pl: 'pierścień szczytowy', en: 'peak ring' }, valueId: 'crater.peak_ring_diameter' },
    { id: 'crater.t_final', label: { pl: 'krater końcowy', en: 'final crater' }, valueId: 'crater.final_diameter' },
  ];
  const scenario = ['impactor.diameter', 'impactor.velocity', 'impactor.angle', 'impactor.approach_azimuth', 'energy.kinetic', 'energy.tnt'];
</script>

<section class="panel scroll" aria-label={L('Parametry', 'Parameters')}>
  <h2>{L('Scenariusz referencyjny', 'Reference scenario')}</h2>
  {#each scenario as id}
    {@const p = r.param(id)}
    <div class="kv"><span>{pLabel(p)}</span><Value value={p.value as number} unit={p.unit} certainty={p.certainty} paramId={id} /></div>
  {/each}

  <h2 class="mt">{L('Krater', 'Crater')}</h2>
  {#each craterSteps as s}
    {@const tp = r.param(s.id)}
    {@const vp = r.param(s.valueId)}
    <div class="kv" class:done={ui.t >= (tp.value as number)}>
      <span>{ui.t >= (tp.value as number) ? '✓' : '·'} {tx(s.label)} <span class="muted">{formatClock(tp.value as number)}</span></span>
      <Value value={vp.value as number} unit={vp.unit} certainty={vp.certainty} paramId={s.valueId} />
    </div>
  {/each}

  <h2 class="mt">{L('Fronty w chwili T', 'Fronts at time T')}</h2>
  {#if fronts.length === 0}<p class="small muted">{L('Przed kontaktem — fronty pojawią się od T = 0.', 'Before contact — fronts appear from T = 0.')}</p>{/if}
  {#each fronts as f (f.kind)}
    {@const name = tx(FRONT_STYLE[f.kind].title)}
    <div class={`kv ph-${FRONT_LANE[f.kind]}`}>
      <span><span class="dot"></span>{name}{f.order > 1 ? L(` (przejście ${f.order})`, ` (pass ${f.order})`) : ''}</span>
      <Value value={f.radiusKm} unit="km" certainty={f.certainty} sourceIds={f.sourceIds} title={`${name} — ${L('promień od krateru', 'radius from the crater')}`}
        method={L('model: czasy dotarcia z rejestru, odwrócone w chwili T', 'model: arrival times from the registry, inverted at time T')} />
    </div>
  {/each}
  <div class="kv ph-tsunami">
    <span><span class="dot"></span>{L('Tsunami — zasięg frontu', 'Tsunami — front reach')}</span>
    {#if ui.t < handoff}<span class="small muted">{L('faza hydrokodu (do', 'hydrocode phase (until')} {formatClock(handoff)})</span>
    {:else}<Value value={tsunamiReachKm(data, ui.t)} unit="km" certainty="extrapolation" sourceIds={r.param('tsunami.front_radius_1h').sources} title={L('Zasięg frontu tsunami', 'Tsunami front reach')}
      method={L('czas dotarcia: √(g·h) na paleobatymetrii PaleoDEM (graf 16-kierunkowy); walidacja z modelem Range i in. 2022', 'arrival time: √(g·h) on PaleoDEM palaeobathymetry (16-direction graph); validated against Range et al. 2022')} />{/if}
  </div>
</section>

<style>
  .panel { padding: 10px 12px; background: var(--panel); border-left: 1px solid var(--line); }
  .kv { display: flex; justify-content: space-between; gap: 8px; padding: 2px 0; align-items: baseline; }
  .kv > span:first-child { color: var(--ink2); }
  .kv.done > span:first-child { color: var(--ink); }
  .mt { margin-top: 14px; }
  .dot { display: inline-block; width: 8px; height: 8px; border-radius: 50%; background: currentColor; margin-right: 6px; }
</style>
