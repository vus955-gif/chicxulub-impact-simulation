<script lang="ts">
  import { onMount } from 'svelte';
  import { loadAppData, type AppData } from './data';
  import { ui, restoreFromUrl, writeUrl } from './state.svelte';
  import { advance } from '../time/playback';
  import TopBar from './components/TopBar.svelte';
  import LayersPanel from './components/LayersPanel.svelte';
  import Timeline from './components/Timeline.svelte';
  import ParamsPanel from './components/ParamsPanel.svelte';
  import ProbePanel from './components/ProbePanel.svelte';
  import SourceDrawer from './components/SourceDrawer.svelte';
  import Map2D from './components/Map2D.svelte';
  import SectionView from '../render/section/SectionView.svelte';
  import GlobeView from '../render/globe/GlobeView.svelte';
  import CloseupView from '../render/closeup/CloseupView.svelte';
  import Guide from './components/Guide.svelte';
  import { L, setLang, browserLang } from './i18n';
  import { decodeState } from './url-state';
  import { T_MAX, T_MIN } from '../time/axis';

  // $state.raw: dane modelu są niezmienne — głęboki proxy $state opakowałby tablice ak135, zdarzenia i rejestr
  // w sygnały i każdy odczyt w pętli klatki rejestrowałby tysiące zależności
  let data = $state.raw<AppData | null>(null);
  let error = $state<string | null>(null);
  let progress = $state('…');

  onMount(() => {
    const fromUrl = location.hash.length > 1;
    restoreFromUrl();
    setLang(decodeState(location.hash).lang ?? browserLang());
    loadAppData((m) => (progress = m))
      .then((d) => { data = d; if (!fromUrl) ui.t = -d.reg.num('impactor.entry_duration'); })
      .catch((e: unknown) => (error = e instanceof Error ? e.message : String(e)));
    let last = performance.now(), raf = 0;
    const loop = (now: number) => {
      const dt = Math.min(0.1, (now - last) / 1000);
      last = now;
      if (data && ui.playing) {
        const cfg = { tEntry: data.reg.num('impactor.entry_duration'), tMin: T_MIN, tMax: T_MAX, prologScreenS: 3 };
        ui.t = advance(ui.t, dt, ui.mode, ui.dps, cfg);
        if (ui.t >= T_MAX) ui.playing = false;
      }
      if (data) writeUrl();
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  });
</script>

{#if error}
  <div class="boot"><h1>{L('Nie udało się uruchomić symulacji', 'The simulation failed to start')}</h1><p>{error}</p><p class="muted">{L('Sprawdź, czy zasoby w', 'Check that the assets in')} <code>public/data/</code> {L('zostały wygenerowane', 'have been generated')} (<code>npm run registry</code>, {L('skrypty Python', 'Python scripts')}).</p></div>
{:else if !data}
  <div class="boot"><h1>{L('Chicxulub — pierwsze 24 godziny', 'Chicxulub — the first 24 hours')}</h1><p class="muted">{progress}</p></div>
{:else}
  {#key ui.lang}
  <div class="app">
    <TopBar {data} />
    <div class="main">
      <LayersPanel {data} />
      <div class="center">
        {#if ui.view === 'section'}<SectionView {data} />
        {:else if ui.view === 'globe'}<GlobeView {data} />
        {:else if ui.view === 'closeup'}<CloseupView {data} />
        {:else}<Map2D {data} />{/if}
        <Guide {data} />
        <SourceDrawer {data} />
      </div>
      <div class="right"><ParamsPanel {data} /><ProbePanel {data} /></div>
    </div>
    <Timeline {data} />
  </div>
  {/key}
{/if}

<style>
  .boot { padding: 3rem; max-width: 720px; }
  .app { display: grid; grid-template-rows: auto minmax(0, 1fr) auto; height: 100vh; }
  .main { display: grid; grid-template-columns: 250px minmax(0, 1fr) 360px; min-height: 0; }
  .center { position: relative; min-width: 0; min-height: 0; }
  .right { display: grid; grid-template-rows: minmax(0, 45%) minmax(0, 1fr); min-height: 0; }
  @media (max-width: 1100px) { .main { grid-template-columns: 210px minmax(0, 1fr) 300px; } }
</style>
