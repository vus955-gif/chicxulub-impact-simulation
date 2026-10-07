<script lang="ts">
  import { ui } from '../state.svelte';
  import type { AppData } from '../data';
  import { CERTAINTY_MARK, formatParam, formatRange } from '../../model/registry/format';
  import { L, certLabel, pLabel, pMethod, pNotes, sNotes } from '../i18n';

  let { data }: { data: AppData } = $props();

  const d = $derived(ui.drawer);
  const param = $derived(d?.paramId ? data.reg.opt(d.paramId) : undefined);
  const ids = $derived([...new Set([...(param?.sources ?? []), ...(d?.sourceIds ?? [])])]);
  const sources = $derived(ids.map((id) => { try { return data.reg.source(id); } catch { return undefined; } }).filter((s) => s !== undefined));

  function onKey(e: KeyboardEvent) { if (e.key === 'Escape') ui.drawer = null; }
</script>

<svelte:window onkeydown={onKey} />

{#if d}
  <aside class="drawer scroll" aria-label={L('Źródła i metoda', 'Sources and method')}>
    <header><h3>{param ? pLabel(param) : d.title}</h3><button onclick={() => (ui.drawer = null)} aria-label={L('Zamknij', 'Close')}>×</button></header>
    {#if param}
      <dl>
        <dt>{L('Wartość', 'Value')}</dt><dd>{formatParam(param)} <span class={`mk-${param.certainty}`}>{CERTAINTY_MARK[param.certainty]} {certLabel(param.certainty)}</span></dd>
        {#if param.range}<dt>{L('Zakres w literaturze', 'Literature range')}</dt><dd>{formatRange(param)}</dd>{/if}
        <dt>{L('Metoda', 'Method')}</dt><dd><code>{pMethod(param)}</code></dd>
        {#if param.locator}<dt>{L('Miejsce w źródle', 'Locator')}</dt><dd>{param.locator}</dd>{/if}
        {#if param.notes}<dt>{L('Uwagi', 'Notes')}</dt><dd class="notes">{pNotes(param)}</dd>{/if}
      </dl>
    {:else}
      {#if d.method}<p class="small"><b>{L('Metoda', 'Method')}:</b> {d.method}</p>{/if}
    {/if}
    {#if d.note}<p class="small">{d.note}</p>{/if}
    <h2>{L('Źródła', 'Sources')}</h2>
    {#if sources.length === 0}<p class="small muted">{L('Brak źródeł literaturowych — założenie modelu predykcyjnego projektu (opis w uwagach).', 'No literature sources — an assumption of the project’s predictive model (see the notes).')}</p>{/if}
    <ol class="src">
      {#each sources as s (s.id)}
        <li>{s.authors} ({s.year}). <i>{s.title}</i>{s.container ? `. ${s.container}` : ''}{#if s.doi}. <a href={`https://doi.org/${s.doi}`} target="_blank" rel="noreferrer">doi:{s.doi}</a>{:else if s.url}. <a href={s.url} target="_blank" rel="noreferrer">{s.url}</a>{/if}{#if sNotes(s) && !s.peerReviewed}<span class="muted"> — {sNotes(s)}</span>{/if}</li>
      {/each}
    </ol>
  </aside>
{/if}

<style>
  .drawer { position: absolute; right: 10px; top: 10px; bottom: 10px; width: min(420px, 90vw); z-index: 20; background: var(--panel); border: 1px solid var(--line2); border-radius: var(--radius); padding: 12px 14px; box-shadow: 0 10px 40px #0009; }
  header { display: flex; justify-content: space-between; align-items: start; gap: 8px; }
  h3 { margin: 0 0 8px; font-size: 14px; }
  dl { display: grid; grid-template-columns: 120px 1fr; gap: 4px 10px; margin: 0 0 10px; }
  dt { color: var(--muted); } dd { margin: 0; } .notes { white-space: pre-line; color: var(--ink2); }
  .src { padding-left: 18px; color: var(--ink2); } .src li { margin: 4px 0; } a { color: #8fc1ff; }
  code { font-family: var(--mono); font-size: 11.5px; color: var(--ink2); }
</style>
