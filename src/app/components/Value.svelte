<script lang="ts">
  import type { Certainty } from '../../model/registry/types';
  import { CERTAINTY_MARK, formatNumber, withUnit } from '../../model/registry/format';
  import { L, certLabel } from '../i18n';
  import { openDrawer } from '../state.svelte';

  let { value, unit = '', certainty, paramId, sourceIds, title, method, note }: {
    value: number | string; unit?: string; certainty: Certainty; paramId?: string; sourceIds?: string[];
    title?: string; method?: string; note?: string;
  } = $props();

  const shown = $derived(withUnit(typeof value === 'number' ? formatNumber(value) : value, unit));
</script>

<button class="pv" title={`${certLabel(certainty)} — ${L('kliknij, aby zobaczyć źródła', 'click to see the sources')}`}
  onclick={() => openDrawer({ title: title ?? shown, paramId, sourceIds, method, note })}>
  {shown}<span class={`mk mk-${certainty}`}>{CERTAINTY_MARK[certainty]}</span>
</button>

<style>
  .pv { all: unset; cursor: pointer; font-variant-numeric: tabular-nums; white-space: nowrap; border-bottom: 1px dotted transparent; }
  .pv:hover { border-bottom-color: var(--muted); }
  .pv:focus-visible { outline: 2px solid var(--accent); }
  .mk { font-size: .82em; margin-left: 3px; }
</style>
