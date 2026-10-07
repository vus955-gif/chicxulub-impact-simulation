<script lang="ts">
  import { ui } from '../state.svelte';
  import type { LegendItem } from '../legend';
  import { CERTAINTY_MARK } from '../../model/registry/format';
  import { L, tx, certLabel } from '../i18n';

  let { items }: { items: LegendItem[] } = $props();
  let open = $state(true);

  const css = (v: string) => (v.startsWith('--') ? `var(${v})` : v);
</script>

<aside class="legend small" aria-label={L('Legenda mapy', 'Map legend')}>
  <button class="hd" onclick={() => (open = !open)} aria-expanded={open}>{L('Legenda', 'Legend')} <span class="muted">{open ? '▾' : '▸'}</span></button>
  {#if open}
    {#if items.length === 0}<p class="muted">{L('Nic jeszcze nie widać — przesuń czas za chwilę uderzenia.', 'Nothing to see yet — move the time past the moment of impact.')}</p>{/if}
    <ul>
      {#each items as it (it.key)}
        <li class:hot={ui.hover === it.key} class:dim={ui.hover !== null && ui.hover !== it.key}
          onmouseenter={() => (ui.hover = it.key)} onmouseleave={() => (ui.hover = null)} title={`${tx(it.title)} — ${tx(it.desc)}`}>
          <svg width="30" height="12" aria-hidden="true">
            {#if it.kind === 'raster'}
              <rect x="1" y="2" width="28" height="8" rx="2" fill={css(it.style.color)} opacity="0.55" />
            {:else if it.kind === 'dots'}
              <circle cx="8" cy="6" r="2.5" fill={css(it.style.color)} /><circle cx="17" cy="6" r="1.8" fill={css(it.style.color)} /><circle cx="25" cy="6" r="2.2" fill={css(it.style.color)} />
            {:else if it.kind === 'disc'}
              <rect x="1" y="2" width="28" height="8" rx="4" fill={css(it.style.color)} opacity="0.4" stroke={css(it.style.color)} />
            {:else}
              {#if it.kind === 'band'}<rect x="1" y="2" width="28" height="8" fill={css(it.style.color)} opacity="0.18" />{/if}
              <line x1="1" y1="6" x2="29" y2="6" stroke="#05080c" stroke-width={it.style.width + 3} stroke-linecap="round" opacity="0.6" />
              <line x1="1" y1="6" x2="29" y2="6" stroke={css(it.style.color)} stroke-width={Math.max(1, it.style.width)} stroke-dasharray={it.style.dash.join(' ')} />
            {/if}
          </svg>
          <span class="t">{tx(it.tag)}</span>
          <span class={`mk mk-${it.certainty}`} title={certLabel(it.certainty)}>{CERTAINTY_MARK[it.certainty]}</span>
        </li>
      {/each}
    </ul>
  {/if}
</aside>

<style>
  .legend { width: 196px; max-height: 42vh; overflow-y: auto;
    background: rgba(9, 13, 20, 0.88); border: 1px solid var(--line2); border-radius: 8px; padding: 6px 8px; scrollbar-width: thin; }
  .hd { all: unset; cursor: pointer; font-weight: 600; color: var(--ink); display: block; width: 100%; }
  .hd:focus-visible { outline: 2px solid var(--accent); }
  ul { list-style: none; margin: 4px 0 0; padding: 0; display: grid; gap: 1px; }
  li { display: grid; grid-template-columns: 30px 1fr 12px; gap: 6px; align-items: center; padding: 1px 3px; border-radius: 4px; cursor: default; transition: opacity .12s; }
  li.hot { background: rgba(255, 255, 255, 0.08); }
  li.dim { opacity: 0.45; }
  .t { color: var(--ink); line-height: 1.2; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
  p { margin: 4px 0 0; }
</style>
