<script lang="ts">
  import { onMount } from 'svelte';
  import * as THREE from 'three';
  import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
  import { ui } from '../../app/state.svelte';
  import type { AppData } from '../../app/data';
  import { craterAt, craterKeyframes } from '../../model/predictive/crater-kinematics';
  import { washOpacity } from '../../app/impact-flash';
  import { plumeTemperatureK } from '../color';
  import { formatNumber } from '../../model/registry/format';
  import { createHost, disposeScene, webglAvailable, type ThreeHost } from '../three-host';
  import { CloseupScene } from './closeup-scene';
  import Value from '../../app/components/Value.svelte';
  import { L, tx } from '../../app/i18n';
  import type { Txt } from '../../model/registry/types';

  let { data }: { data: AppData } = $props();
  const reg = $derived(data.reg);
  const k = $derived(craterKeyframes(data.reg));

  let box: HTMLDivElement;
  let w = $state(800), h = $state(600);
  let failed = $state<string | null>(null);
  let auto = $state(true);
  let wash = $state(0);
  let tags = $state<Array<{ id: string; text: string; x: number; y: number }>>([]);

  let host: ThreeHost | null = null;
  let cs: CloseupScene | null = null;
  let controls: OrbitControls | null = null;
  let applyingAuto = false;

  const reducedMotion = typeof matchMedia === 'function' && matchMedia('(prefers-reduced-motion: reduce)').matches;
  const st = $derived(craterAt(k, ui.t));
  const plumeK = $derived(ui.t > 0 ? plumeTemperatureK(ui.t, reg.num('fireball.plume_initial_temperature'), reg.num('fireball.transparency_temperature'), reg.num('fireball.t_max_radiation_eiep')) : null);
  const PHASE: Record<string, Txt> = {
    pre: { pl: 'przelot przez atmosferę', en: 'atmospheric entry' }, excavation: { pl: 'kontakt, kompresja i wykop', en: 'contact, compression and excavation' },
    uplift: { pl: 'wypiętrzanie dna', en: 'floor uplift' }, collapse: { pl: 'zapadanie wypiętrzenia → pierścień szczytowy', en: 'uplift collapse → peak ring' },
    modification: { pl: 'modyfikacja krateru', en: 'crater modification' }, final: { pl: 'krater końcowy', en: 'final crater' },
  };

  function project(v: THREE.Vector3): { x: number; y: number } | null {
    if (!cs) return null;
    const p = v.clone().project(cs.camera);
    if (p.z > 1 || p.z < -1) return null;
    return { x: (p.x * 0.5 + 0.5) * w, y: (-p.y * 0.5 + 0.5) * h };
  }

  function render(): void {
    if (!host || !cs) return;
    host.renderer.render(cs.scene, cs.camera);
    const out: typeof tags = [];
    if (cs.marks.bolideVisible) { const p = project(cs.marks.bolide); if (p) out.push({ id: 'b', text: `${L('impaktor', 'impactor')} ${formatNumber(reg.num('impactor.diameter'))} km`, ...p }); }
    if (cs.marks.rimWaveVisible && ui.layers.tsunami && cs.marks.rimWaveAmpKm > 0.2) {
      const p = project(cs.marks.rimWave);
      if (p) out.push({ id: 'rw', text: `${L('fala brzeżna', 'rim wave')} ~${formatNumber(cs.marks.rimWaveAmpKm, 2)} km △`, ...p });
    }
    tags = out;
  }

  function frame(): void {
    if (!host || !cs) return;
    const t = ui.t;
    cs.update(t, { crater: ui.layers.crater, ejecta: ui.layers.ejecta, thermal: ui.layers.thermal, tsunami: ui.layers.tsunami });
    wash = reducedMotion ? 0 : washOpacity(t);
    if (auto && controls) {
      const p = cs.autoPose(t);
      applyingAuto = true;
      cs.camera.position.copy(p.pos); controls.target.copy(p.target); controls.update();
      applyingAuto = false;
    }
    render();
  }

  onMount(() => {
    if (!webglAvailable()) { failed = L('Ta przeglądarka nie udostępnia WebGL — zbliżenie 3D jest niedostępne. Przekrój pokazuje formowanie krateru w 2D.', 'This browser does not provide WebGL — the 3D close-up is unavailable. The cross-section shows crater formation in 2D.'); return; }
    try { host = createHost(box, 0x070b14); } catch (e) { failed = `${L('Nie udało się uruchomić WebGL', 'WebGL failed to start')}: ${e instanceof Error ? e.message : String(e)}`; return; }
    cs = new CloseupScene(data);
    host.resize(w, h); cs.setViewport(w, h, host.renderer.getPixelRatio());
    controls = new OrbitControls(cs.camera, host.canvas);
    controls.enableDamping = false; controls.minDistance = 20; controls.maxDistance = 4000; controls.maxPolarAngle = Math.PI * 0.495;
    controls.addEventListener('start', () => { if (!applyingAuto) auto = false; });
    controls.addEventListener('change', () => { if (!applyingAuto) render(); });
    frame();
    return () => { controls?.dispose(); if (cs) disposeScene(cs.scene); host?.dispose(); host = null; cs = null; };
  });

  $effect(() => {
    const W = w, H = h;
    if (!host || !cs) return;
    host.resize(W, H); cs.setViewport(W, H, host.renderer.getPixelRatio());
    render();
  });

  $effect(() => {
    void ui.t; void auto;
    for (const key in ui.layers) void ui.layers[key as keyof typeof ui.layers];
    frame();
  });

  function preset(name: 'entry' | 'crater' | 'plume') {
    if (!cs || !controls) return;
    auto = false;
    const at = name === 'entry' ? -data.reg.num('impactor.entry_duration') * 0.5 : name === 'crater' ? 1200 : 200;
    const p = cs.autoPose(at);
    cs.camera.position.copy(p.pos); controls.target.copy(p.target); controls.update(); render();
  }
</script>

<div class="cu" bind:clientWidth={w} bind:clientHeight={h}>
  <div class="gl" bind:this={box}></div>
  {#if failed}
    <div class="fail">{failed}</div>
  {:else}
    {#each tags as g (g.id)}<div class="tag" style={`left:${g.x}px;top:${g.y}px`}>{g.text}</div>{/each}
    {#if wash > 0}<div class="wash" style={`opacity:${wash}`}></div>{/if}
    <div class="hud small">
      <div><b>{L('Zbliżenie: miejsce uderzenia', 'Close-up: the impact site')}</b> · {L('skala rzeczywista (bez przewyższenia), okręgi co 50 km', 'true scale (no vertical exaggeration), circles every 50 km')}</div>
      <div>{L('faza', 'phase')}: <b class="ph-crater">{tx(PHASE[st.phase]!)}</b>{#if st.cavityRadius > 0} · {L('promień krateru', 'crater radius')} {formatNumber(st.cavityRadius, 3)} km{/if}</div>
      <div class="muted">
        {L('impaktor', 'impactor')} <Value value={reg.num('impactor.diameter')} unit="km" paramId="impactor.diameter" certainty={reg.param('impactor.diameter').certainty} />,
        <Value value={reg.num('impactor.velocity')} unit="km/s" paramId="impactor.velocity" certainty={reg.param('impactor.velocity').certainty} />,
        {L('kąt', 'angle')} <Value value={reg.num('impactor.angle')} unit="°" paramId="impactor.angle" certainty={reg.param('impactor.angle').certainty} />,
        {L('z azymutu', 'from azimuth')} <Value value={reg.num('impactor.approach_azimuth')} unit="°" paramId="impactor.approach_azimuth" certainty={reg.param('impactor.approach_azimuth').certainty} />
      </div>
      {#if plumeK !== null && ui.t < 4 * 3600}
        <div class="muted">{L('pióropusz par: górna część', 'vapour plume: upper part')} <Value value={reg.num('fireball.plume_upper_velocity')} unit="km/s" paramId="fireball.plume_upper_velocity" certainty={reg.param('fireball.plume_upper_velocity').certainty} />,
          {L('barwa wg temperatury', 'colour by temperature')} ~{formatNumber(plumeK, 2)} K <span class="mk-predictive" title={L('krzywa między dwiema kotwicami z rejestru: temperatura początkowa i temperatura przezroczystości w chwili maksimum promieniowania', 'curve between two registry anchors: the initial temperature and the transparency temperature at the radiation maximum')}>△</span></div>
      {/if}
      <div class="muted">{L('kształt krateru między klatkami kluczowymi i fala brzeżna między kotwicami', 'crater shape between keyframes and the rim wave between anchors')}: <span class="mk-predictive">△ {L('model predykcyjny projektu', 'project predictive model')}</span>; {L('kurtyna ejecta i poświaty — symbole', 'ejecta curtain and glows are symbols')}</div>
    </div>
    <div class="tools">
      <button class:on={auto} onclick={() => (auto = !auto)} title={L('Kamera prowadzona przez fazy zdarzenia', 'Camera guided through the phases of the event')}>{L('kamera auto', 'auto camera')}</button>
      <button onclick={() => preset('entry')}>{L('przelot', 'entry')}</button>
      <button onclick={() => preset('crater')}>{L('krater', 'crater')}</button>
      <button onclick={() => preset('plume')}>{L('pióropusz', 'plume')}</button>
    </div>
  {/if}
</div>

<style>
  .cu { position: relative; width: 100%; height: 100%; overflow: hidden; background: #070b14; }
  .gl { position: absolute; inset: 0; }
  .fail { position: absolute; inset: 0; display: grid; place-items: center; padding: 2rem; color: var(--ink2); text-align: center; }
  .hud { position: absolute; left: 10px; top: 10px; max-width: min(560px, calc(100% - 300px)); padding: 6px 9px; border-radius: 6px; background: rgba(11, 14, 20, 0.8); border: 1px solid var(--line2); color: var(--ink); display: grid; gap: 2px; }
  .tools { position: absolute; right: 10px; top: 10px; display: flex; gap: 4px; }
  .tag { position: absolute; transform: translate(12px, -50%); font-size: 11px; color: #fff; pointer-events: none; white-space: nowrap; text-shadow: 0 0 3px #000, 0 0 6px #000; }
  .wash { position: absolute; inset: 0; pointer-events: none; background: radial-gradient(circle at 50% 55%, rgba(255,244,220,1), rgba(255,214,170,.4)); mix-blend-mode: screen; }
</style>
