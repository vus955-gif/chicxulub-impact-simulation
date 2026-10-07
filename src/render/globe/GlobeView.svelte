<script lang="ts">
  import { onMount } from 'svelte';
  import * as THREE from 'three';
  import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
  import { ui } from '../../app/state.svelte';
  import type { AppData } from '../../app/data';
  import { frontsAt, irZoneAt, type FrontKind } from '../../model/sim/fronts';
  import { activeItems, hasRing, placeLabels, FRONT_STYLE, type Box } from '../../app/legend';
  import { tsunamiReachKm } from '../../app/data';
  import MapLegend from '../../app/components/MapLegend.svelte';
  import { L, tx, siteName } from '../../app/i18n';
  import { bioZones, bioReachAt, type BioZoneKey } from '../../model/sim/biosphere';
  import { flashScreenAge, flashWindow, orbitParams, particleAtInto, reentryWindow, sortByReentry, type OrbitParams } from '../../model/sim/ejecta-orbits';
  import { darknessAt } from '../../model/predictive/darkness';
  import { azimuthDeg, destination, ANTIPODE_KM, R_KM } from '../../model/sim/geo';
  import { bolideProgress, flashIntensity, washOpacity } from '../../app/impact-flash';
  import { createHost, disposeScene, glowTexture, latLonToVec3, rawColor, vec3ToLatLon, webglAvailable, type ThreeHost } from '../three-host';
  import { createAtmosphereMaterial, createGlobeMaterial, MAX_FRONTS } from './globe-material';

  let { data }: { data: AppData } = $props();

  let box: HTMLDivElement;
  let w = $state(800), h = $state(600);
  let failed = $state<string | null>(null);
  let wash = $state(0);
  let labels = $state<Array<{ id: string; text: string; x: number; y: number; sel: boolean; color: string; ring?: boolean; dim?: boolean }>>([]);

  let host: ThreeHost | null = null;
  let scene: THREE.Scene, camera: THREE.PerspectiveCamera, controls: OrbitControls;
  let globe: THREE.Mesh, mat: THREE.ShaderMaterial;
  let darkTex: THREE.DataTexture, darkArr: Uint16Array;
  let flash: THREE.Sprite, bolide: THREE.Sprite, trail: THREE.Line;
  let probeMark: THREE.Sprite;
  let sitesPts: THREE.Points;
  let coast: THREE.LineSegments;
  let ej: { heads: THREE.Points; trails: THREE.LineSegments; flashes: THREE.Points; head: Float32Array; headCol: Float32Array; seg: Float32Array; segCol: Float32Array; flCol: Float32Array; op: OrbitParams; lit: number[] } | null = null;

  const reducedMotion = typeof matchMedia === 'function' && matchMedia('(prefers-reduced-motion: reduce)').matches;
  const cssVar = (v: string) => getComputedStyle(document.documentElement).getPropertyValue(v).trim() || '#ffffff';
  /** liczba kresek na obwód wielkiego koła (shader nie odtwarza wzorów kreska-kropka — rozróżnia je podpis i kolor) */
  const FRONT_DASH: Record<FrontKind, number> = { P: 0, S: 160, R: 300, G: 420, lamb: 0, ejecta: 0, fireball: 0 };
  const BIO_DASH: Record<BioZoneKey, number> = { sterile: 0, thermal: 260, trees90: 120, trees30: 120, liquefaction: 420, slopes: 420 };
  const craterV = $derived(latLonToVec3(data.ctx.crater.lat, data.ctx.crater.lon));
  const zones = $derived(bioZones(data.ctx));
  const FRONT_LAYER: Record<FrontKind, keyof typeof ui.layers> = { P: 'seismic', S: 'seismic', R: 'seismic', G: 'seismic', lamb: 'air', ejecta: 'ejecta', fireball: 'thermal' };
  const FLASH_LIFE = 0.4; // s ekranu — rozbłysk przy ponownym wejściu (symbol)
  const ejOrder = $derived(sortByReentry(data.ejecta));
  const flashesNow = $derived.by(() => { const [tf, tt] = flashWindow(ui.t, FLASH_LIFE, ui.mode, ui.dps); const [lo, hi] = reentryWindow(data.ejecta, ejOrder, tf, tt); return hi > lo; });
  const items = $derived(activeItems(data.ctx, { t: ui.t, layers: ui.layers, thermal: ui.thermal, coast: ui.coast }, { tsunamiReached: ui.t > 0 && tsunamiReachKm(data, ui.t) > 0, flashesNow }));
  let legW = $state(0), legH = $state(0);
  const legendBox = $derived<Box | null>(legW > 0 ? { x: w - legW - 14, y: h - legH - 40, w: legW + 8, h: legH + 8 } : null);

  function halfGrid(src: Float32Array, scale: number): Uint16Array {
    const out = new Uint16Array(src.length);
    for (let i = 0; i < src.length; i++) { const v = src[i]!; out[i] = THREE.DataUtils.toHalfFloat(Number.isFinite(v) ? v * scale : -1); }
    return out;
  }

  // ── wyrzuty: orbity Keplera w układzie inercjalnym + obrót Ziemi (model w ejecta-orbits.ts) ──
  function buildEjecta(): void {
    const ps = data.ejecta, N = ps.length;
    const head = new Float32Array(N * 3), headCol = new Float32Array(N * 3);
    const seg = new Float32Array(N * 6), segCol = new Float32Array(N * 6);
    const fl = new Float32Array(N * 3), flCol = new Float32Array(N * 3);
    const op = orbitParams(data.ctx), rr = op.rRe / R_KM;
    ps.forEach((p, i) => { if (!p.hyper) { const v = latLonToVec3(p.reLat, p.reLon, rr); fl.set([v.x, v.y, v.z], i * 3); } });
    const soft = glowTexture([[0, 'rgba(255,255,255,1)'], [0.35, 'rgba(255,255,255,0.65)'], [1, 'rgba(255,255,255,0)']], 32);
    const mk = (pos: Float32Array, col: Float32Array) => { const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.BufferAttribute(pos, 3)); g.setAttribute('color', new THREE.BufferAttribute(col, 3)); return g; };
    const heads = new THREE.Points(mk(head, headCol), new THREE.PointsMaterial({ size: 3, sizeAttenuation: false, vertexColors: true, map: soft, transparent: true, blending: THREE.AdditiveBlending, depthWrite: false }));
    const trails = new THREE.LineSegments(mk(seg, segCol), new THREE.LineBasicMaterial({ vertexColors: true, transparent: true, blending: THREE.AdditiveBlending, depthWrite: false }));
    const flashTex = glowTexture([[0, 'rgba(255,255,250,1)'], [0.18, 'rgba(255,236,180,0.85)'], [0.5, 'rgba(255,150,60,0.28)'], [1, 'rgba(255,90,30,0)']], 64);
    const flashes = new THREE.Points(mk(fl, flCol), new THREE.PointsMaterial({ size: 11, sizeAttenuation: false, vertexColors: true, map: flashTex, transparent: true, blending: THREE.AdditiveBlending, depthWrite: false }));
    for (const o of [trails, heads, flashes]) { o.frustumCulled = false; scene.add(o); }
    ej = { heads, trails, flashes, head, headCol, seg, segCol, flCol, op, lit: [] };
  }

  function updateEjecta(t: number): void {
    if (!ej) return;
    const show = ui.layers.ejecta && t > 0;
    ej.heads.visible = ej.trails.visible = ej.flashes.visible = show;
    if (!show) return;
    const base = rawColor(cssVar('--c-ejecta'));
    const { op } = ej, rRe = op.rRe, ps = data.ejecta, inv = 1 / R_KM;
    // rozbłyski: gaszenie poprzednich, zapalenie tylko tych z okna (wyszukiwanie binarne po chwilach wejścia)
    for (const i of ej.lit) ej.flCol[i * 3] = ej.flCol[i * 3 + 1] = ej.flCol[i * 3 + 2] = 0;
    ej.lit.length = 0;
    const [tf, tt] = flashWindow(t, FLASH_LIFE, ui.mode, ui.dps);
    const [lo, hi] = reentryWindow(ps, ejOrder, tf, tt);
    for (let k = lo; k < hi; k++) {
      const i = ejOrder[k]!, age = flashScreenAge(t, ps[i]!.tRe, ui.mode, ui.dps);
      const fI = age < 0.06 ? Math.max(0, age) / 0.06 : (1 - (age - 0.06) / (FLASH_LIFE - 0.06)) ** 2;
      ej.flCol[i * 3] = 0.75 * fI; ej.flCol[i * 3 + 1] = 0.64 * fI; ej.flCol[i * 3 + 2] = 0.42 * fI;
      ej.lit.push(i);
    }
    // głowice i smugi: orbita Keplera → układ ziemski (bez alokacji)
    const H = ej.head, S = ej.seg, HC = ej.headCol, SC = ej.segCol;
    for (let i = 0; i < ps.length; i++) {
      const p = ps[i]!, k3 = i * 3, k6 = i * 6;
      if (!particleAtInto(p, t, op, H, k3)) { HC[k3] = HC[k3 + 1] = HC[k3 + 2] = 0; SC.fill(0, k6, k6 + 6); continue; }
      const rNow = Math.hypot(H[k3]!, H[k3 + 1]!, H[k3 + 2]!);
      const fade = p.hyper ? Math.max(0, 1 - (rNow * inv - 1.5) / 3) : 1;
      if (fade <= 0) { HC[k3] = HC[k3 + 1] = HC[k3 + 2] = 0; SC.fill(0, k6, k6 + 6); continue; }
      const dtTail = Math.min(180, Math.max(8, 0.05 * (t - p.t0)));
      if (!particleAtInto(p, Math.max(p.t0 + 1e-3, t - dtTail), op, S, k6)) { S[k6] = H[k3]!; S[k6 + 1] = H[k3 + 1]!; S[k6 + 2] = H[k3 + 2]!; }
      const rPrev = Math.hypot(S[k6]!, S[k6 + 1]!, S[k6 + 2]!);
      // nagrzewanie przy schodzeniu ku warstwie wejścia
      const heat = rNow < rPrev ? Math.max(0, 1 - (rNow - rRe) / 600) : 0;
      const b = (0.5 + 0.9 * heat) * fade, h2 = heat * heat;
      const cr = Math.min(1, base.r * b + 0.5 * h2), cg = Math.min(1, base.g * b + 0.45 * h2), cb = Math.min(1, base.b * b + 0.3 * h2);
      H[k3] = H[k3]! * inv; H[k3 + 1] = H[k3 + 1]! * inv; H[k3 + 2] = H[k3 + 2]! * inv;
      S[k6] = S[k6]! * inv; S[k6 + 1] = S[k6 + 1]! * inv; S[k6 + 2] = S[k6 + 2]! * inv;
      S[k6 + 3] = H[k3]!; S[k6 + 4] = H[k3 + 1]!; S[k6 + 5] = H[k3 + 2]!;
      HC[k3] = cr; HC[k3 + 1] = cg; HC[k3 + 2] = cb;
      SC[k6] = SC[k6 + 1] = SC[k6 + 2] = 0; SC[k6 + 3] = cr * 0.55; SC[k6 + 4] = cg * 0.55; SC[k6 + 5] = cb * 0.55;
    }
    for (const o of [ej.heads, ej.trails]) { (o.geometry.getAttribute('position') as THREE.BufferAttribute).needsUpdate = true; (o.geometry.getAttribute('color') as THREE.BufferAttribute).needsUpdate = true; }
    (ej.flashes.geometry.getAttribute('color') as THREE.BufferAttribute).needsUpdate = true;
  }

  function updateUniforms(t: number): void {
    const u = mat.uniforms;
    u.uCrater!.value.copy(craterV);
    u.uTh!.value = t / 3600;
    u.uBandH!.value = Math.max(300, 0.12 * t) / 3600;
    u.uShowTs!.value = ui.layers.tsunami && t > 0 ? 1 : 0;
    u.uEnvelope!.value = ui.envelope ? 1 : 0;
    const dark = ui.layers.atmo && t > 0;
    u.uShowDark!.value = dark ? 1 : 0;
    if (dark) {
      for (let i = 0; i < darkArr.length; i++) darkArr[i] = THREE.DataUtils.toHalfFloat(darknessAt(data.ctx, t, (i / (darkArr.length - 1)) * ANTIPODE_KM, ui.fires).lightFraction);
      darkTex.needsUpdate = true;
    }
    const fr = u.uFront!.value as number[], fc = u.uFrontColor!.value as THREE.Color[], fd = u.uFrontDash!.value as number[], fw = u.uFrontWidth!.value as number[], fa = u.uFrontAlpha!.value as number[];
    fr.fill(-1);
    const hov = ui.hover;
    const alphaOf = (key: string) => (hov === null || hov === key ? 1 : 0.25);
    const widthOf = (key: string, wd: number) => (hov === key ? wd * 1.7 : wd);
    let j = 0, fireball = 0;
    for (const f of frontsAt(data.ctx, t)) {
      if (!ui.layers[FRONT_LAYER[f.kind]] || f.radiusKm <= 0) continue;
      if (f.kind === 'fireball') { fireball = f.radiusKm / R_KM; continue; }
      if (j >= MAX_FRONTS) break;
      const st = FRONT_STYLE[f.kind], key = `front:${f.kind}`;
      fr[j] = f.radiusKm / R_KM; fc[j]!.copy(rawColor(cssVar(st.color))); fd[j] = FRONT_DASH[f.kind]; fw[j] = widthOf(key, st.width); fa[j] = alphaOf(key); j++;
    }
    if (ui.layers.bio && t > 0) {
      const bio = rawColor(cssVar('--c-bio'));
      for (const z of zones) {
        const r = bioReachAt(data.ctx, z, t);
        if (r.outerKm <= 0) continue;
        const key = `bio:${z.key}`;
        for (const [rad, dash, wd] of [[r.outerKm, BIO_DASH[z.key], 1.7], ...(r.lowKm ? [[r.lowKm, 0, 1]] : [])] as Array<[number, number, number]>) {
          if (j >= MAX_FRONTS) break;
          fr[j] = rad / R_KM; fc[j]!.copy(bio); fd[j] = dash; fw[j] = widthOf(key, wd); fa[j] = alphaOf(key); j++;
        }
      }
    }
    u.uAIr!.value = alphaOf('ir'); u.uAFireball!.value = alphaOf('front:fireball'); u.uAFires!.value = alphaOf('fires'); u.uACrater!.value = alphaOf('crater');
    u.uFireball!.value = fireball;
    if (ui.layers.thermal && t > 0) {
      const z = irZoneAt(data.ctx, t, ui.thermal);
      u.uIrOuter!.value = z.outerKm / R_KM; u.uIrInner!.value = Math.max(1, z.innerKm) / R_KM;
    } else { u.uIrOuter!.value = 0; u.uIrInner!.value = 0; }
    u.uFires!.value = ui.layers.fires && t > data.reg.num('fireball.t_max_radiation_eiep') ? data.reg.num('fires.ignition_radius_fireball') / R_KM : 0;
    u.uCraterR!.value = ui.layers.crater ? (t >= data.reg.num('crater.t_final') ? data.reg.num('crater.final_diameter') / 2 : t > 0 ? data.reg.num('crater.transient_diameter') / 2 : 0) / R_KM : 0;
  }

  function updateImpactFx(t: number): void {
    const times = { tEntry: data.reg.num('impactor.entry_duration'), tMaxRad: data.reg.num('fireball.t_max_radiation_eiep'), radDurS: data.reg.num('fireball.radiation_duration_eiep') * 60 };
    const I = flashIntensity(t, times);
    flash.visible = I > 0;
    if (I > 0) { const s = 0.06 + 0.3 * I; flash.scale.set(s, s, 1); (flash.material as THREE.SpriteMaterial).opacity = Math.min(1, 0.4 + 0.6 * I); }
    wash = reducedMotion ? 0 : washOpacity(t);
    const prog = bolideProgress(t, times.tEntry);
    bolide.visible = trail.visible = prog !== null;
    if (prog !== null) {
      // symbol: tor ~0,12 promienia Ziemi (w skali globu cały przelot to ~0,02), kierunek i kąt z rejestru
      const from = destination(data.ctx.crater, data.ctx.downrangeAzDeg - 180, 600);
      const tan = latLonToVec3(from.lat, from.lon).sub(craterV.clone().multiplyScalar(latLonToVec3(from.lat, from.lon).dot(craterV))).normalize();
      const angle = (data.reg.num('impactor.angle') * Math.PI) / 180;
      const dir = tan.multiplyScalar(Math.cos(angle)).addScaledVector(craterV, Math.sin(angle)).normalize();
      const L = 0.12 * (1 - prog);
      const head = craterV.clone().multiplyScalar(1.002).addScaledVector(dir, L);
      bolide.position.copy(head);
      const s = 0.025 + 0.04 * prog; bolide.scale.set(s, s, 1);
      const p = trail.geometry.getAttribute('position') as THREE.BufferAttribute;
      p.setXYZ(0, head.x, head.y, head.z);
      const tailEnd = head.clone().addScaledVector(dir, 0.12);
      p.setXYZ(1, tailEnd.x, tailEnd.y, tailEnd.z); p.needsUpdate = true;
    }
  }

  function updateMarkers(): void {
    coast.visible = ui.coast;
    const site = ui.site ? data.sites.find((s) => s.id === ui.site) : undefined;
    const pt = site ? { lat: site.paleoLat, lon: site.paleoLon } : ui.probe;
    probeMark.visible = !!pt;
    if (pt) probeMark.position.copy(latLonToVec3(pt.lat, pt.lon, 1.004));
  }

  function updateLabels(): void {
    const out: typeof labels = [];
    const camDir = camera.position.clone().normalize();
    const facing = (v: THREE.Vector3) => v.clone().normalize().dot(camDir) > 0.15;
    const screen = (v: THREE.Vector3) => { const p = v.clone().project(camera); return { x: (p.x * 0.5 + 0.5) * w, y: (-p.y * 0.5 + 0.5) * h }; };
    const taken: Box[] = [];
    const put = (id: string, text: string, v: THREE.Vector3, sel: boolean) => {
      if (!facing(v)) return; // po niewidocznej stronie
      const q = screen(v);
      out.push({ id, text, x: q.x, y: q.y, sel, color: '' });
      taken.push({ x: q.x + 6, y: q.y - 8, w: text.length * 6 + 4, h: 15 });
    };
    put('crater', 'Chicxulub', craterV, true);
    for (const s of data.sites) if (ui.site === s.id || camera.position.length() < 2.6) put(s.id, siteName(s).split(' (')[0]!, latLonToVec3(s.paleoLat, s.paleoLon), ui.site === s.id);
    if (legendBox) taken.push(legendBox);
    // podpisy pierścieni: kandydaci wokół azymutu ku środkowi widoku (strona zwrócona do kamery)
    const sub = vec3ToLatLon(camDir);
    const toward = azimuthDeg(data.ctx.crater, sub);
    const ringItems = items.filter((it) => hasRing(it) && it.key !== 'coast');
    const cands = ringItems.map((it, n) => {
      const pts: Array<[number, number]> = [];
      for (let k = 0; k < 18; k++) {
        const b = toward + (n % 2 ? 1 : -1) * 8 + (k % 2 ? 1 : -1) * Math.ceil(k / 2) * 12 + n * 9;
        const g = destination(data.ctx.crater, b, it.radiusKm!), v = latLonToVec3(g.lat, g.lon);
        if (facing(v)) { const q = screen(v); pts.push([q.x, q.y]); }
      }
      return { key: it.key, w: tx(it.tag).length * 6.2 + 12, h: 16, candidates: pts };
    });
    const placed = placeLabels(cands, { x: 4, y: 4, w: w - 8, h: h - 28 }, taken);
    for (const it of ringItems) {
      const b = placed.get(it.key);
      if (b) out.push({ id: `ring:${it.key}`, text: tx(it.tag), x: b.x, y: b.y, sel: false, color: cssVar(it.style.color.startsWith('--') ? it.style.color : '--ink'), ring: true, dim: ui.hover !== null && ui.hover !== it.key });
    }
    labels = out;
  }

  function render(): void {
    if (!host) return;
    host.renderer.render(scene, camera);
    updateLabels();
  }

  function frame(): void {
    if (!host) return;
    const t = ui.t;
    updateUniforms(t);
    updateEjecta(t);
    updateImpactFx(t);
    updateMarkers();
    render();
  }

  onMount(() => {
    if (!webglAvailable()) { failed = L('Ta przeglądarka nie udostępnia WebGL — glob 3D jest niedostępny. Mapa 2D i przekrój działają bez WebGL.', 'This browser does not provide WebGL — the 3D globe is unavailable. The 2D map and the cross-section work without WebGL.'); return; }
    try {
      host = createHost(box);
    } catch (e) {
      failed = `${L('Nie udało się uruchomić WebGL', 'WebGL failed to start')}: ${e instanceof Error ? e.message : String(e)}`;
      return;
    }
    scene = new THREE.Scene();
    camera = new THREE.PerspectiveCamera(32, 1, 0.01, 100);
    camera.position.copy(craterV.clone().multiplyScalar(3.4)).add(new THREE.Vector3(0, 0.6, 0));
    camera.lookAt(0, 0, 0);

    const tex = new THREE.Texture(data.texture);
    tex.colorSpace = THREE.NoColorSpace; tex.anisotropy = host.renderer.capabilities.getMaxAnisotropy(); tex.needsUpdate = true;
    const mk = (arr: Uint16Array, wd: number, ht: number) => { const t = new THREE.DataTexture(arr, wd, ht, THREE.RedFormat, THREE.HalfFloatType); t.minFilter = t.magFilter = THREE.NearestFilter; t.needsUpdate = true; return t; };
    const tt = mk(halfGrid(data.tsunamiTT.data as Float32Array, 1 / 3600), data.tsunamiTT.w, data.tsunamiTT.h);
    const amp = mk(halfGrid(data.tsunamiAmp.data as Float32Array, 1), data.tsunamiAmp.w, data.tsunamiAmp.h);
    darkArr = new Uint16Array(129).fill(THREE.DataUtils.toHalfFloat(1));
    darkTex = new THREE.DataTexture(darkArr, 129, 1, THREE.RedFormat, THREE.HalfFloatType);
    darkTex.minFilter = darkTex.magFilter = THREE.LinearFilter; darkTex.needsUpdate = true;

    mat = createGlobeMaterial(tex, tt, amp, darkTex);
    mat.uniforms.cThermal!.value = rawColor(cssVar('--c-thermal'));
    mat.uniforms.cFires!.value = rawColor(cssVar('--c-fires'));
    mat.uniforms.cCrater!.value = rawColor(cssVar('--c-crater'));
    mat.uniforms.cTsunami!.value = rawColor(cssVar('--c-tsunami'));
    globe = new THREE.Mesh(new THREE.SphereGeometry(1, 192, 96), mat);
    scene.add(globe);
    scene.add(new THREE.Mesh(new THREE.SphereGeometry(1.025, 96, 48), createAtmosphereMaterial()));

    const flashTex = glowTexture([[0, 'rgba(255,255,240,1)'], [0.15, 'rgba(255,232,170,0.9)'], [0.45, 'rgba(255,150,60,0.35)'], [1, 'rgba(255,90,30,0)']]);
    flash = new THREE.Sprite(new THREE.SpriteMaterial({ map: flashTex, blending: THREE.AdditiveBlending, depthWrite: false, transparent: true }));
    flash.position.copy(craterV.clone().multiplyScalar(1.01));
    scene.add(flash);
    bolide = new THREE.Sprite(new THREE.SpriteMaterial({ map: flashTex, blending: THREE.AdditiveBlending, depthWrite: false, transparent: true }));
    scene.add(bolide);
    const tg = new THREE.BufferGeometry(); tg.setAttribute('position', new THREE.BufferAttribute(new Float32Array(6), 3));
    trail = new THREE.Line(tg, new THREE.LineBasicMaterial({ color: 0xffd59a, transparent: true, opacity: 0.7 }));
    trail.frustumCulled = false;
    scene.add(trail);

    const sp = new Float32Array(data.sites.length * 3);
    data.sites.forEach((s, i) => { const v = latLonToVec3(s.paleoLat, s.paleoLon, 1.002); sp.set([v.x, v.y, v.z], i * 3); });
    const sg = new THREE.BufferGeometry(); sg.setAttribute('position', new THREE.BufferAttribute(sp, 3));
    sitesPts = new THREE.Points(sg, new THREE.PointsMaterial({ size: 5, sizeAttenuation: false, color: 0xffffff, map: glowTexture([[0, 'rgba(255,255,255,1)'], [0.55, 'rgba(255,255,255,1)'], [0.7, 'rgba(255,255,255,0)'], [1, 'rgba(255,255,255,0)']], 32), transparent: true }));
    scene.add(sitesPts);
    probeMark = new THREE.Sprite(new THREE.SpriteMaterial({ map: glowTexture([[0, 'rgba(255,255,255,0)'], [0.55, 'rgba(255,255,255,0)'], [0.62, 'rgba(255,255,255,1)'], [0.78, 'rgba(255,255,255,1)'], [0.85, 'rgba(255,255,255,0)']], 64), transparent: true, depthWrite: false }));
    probeMark.scale.set(0.035, 0.035, 1);
    scene.add(probeMark);
    buildEjecta();
    // dzisiejsze linie brzegowe (orientacja): odcinki tuż nad powierzchnią
    {
      const segs: number[] = [];
      for (const l of data.coastlines) for (let i = 0; i + 3 < l.length; i += 2) {
        const a = latLonToVec3(l[i + 1]!, l[i]!, 1.0015), b = latLonToVec3(l[i + 3]!, l[i + 2]!, 1.0015);
        segs.push(a.x, a.y, a.z, b.x, b.y, b.z);
      }
      const cg = new THREE.BufferGeometry(); cg.setAttribute('position', new THREE.BufferAttribute(new Float32Array(segs), 3));
      coast = new THREE.LineSegments(cg, new THREE.LineBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.38, depthWrite: false }));
      scene.add(coast);
    }

    controls = new OrbitControls(camera, host.canvas);
    controls.enablePan = false; controls.enableDamping = false;
    controls.minDistance = 1.25; controls.maxDistance = 8; controls.rotateSpeed = 0.55; controls.zoomSpeed = 0.8;
    controls.addEventListener('change', render);

    // klik (bez przeciągania) = sonda
    let down: { x: number; y: number } | null = null;
    const ray = new THREE.Raycaster();
    const onDown = (e: PointerEvent) => { down = { x: e.clientX, y: e.clientY }; };
    const onUp = (e: PointerEvent) => {
      if (!down || Math.hypot(e.clientX - down.x, e.clientY - down.y) > 4) { down = null; return; }
      down = null;
      const r = host!.canvas.getBoundingClientRect();
      ray.setFromCamera(new THREE.Vector2(((e.clientX - r.left) / r.width) * 2 - 1, -((e.clientY - r.top) / r.height) * 2 + 1), camera);
      const hit = ray.intersectObject(globe)[0];
      if (hit) { ui.probe = vec3ToLatLon(hit.point); ui.site = null; }
    };
    host.canvas.addEventListener('pointerdown', onDown);
    host.canvas.addEventListener('pointerup', onUp);

    host.resize(w, h); camera.aspect = w / Math.max(1, h); camera.updateProjectionMatrix();
    frame();
    return () => {
      host?.canvas.removeEventListener('pointerdown', onDown);
      host?.canvas.removeEventListener('pointerup', onUp);
      controls.dispose();
      disposeScene(scene);
      host?.dispose();
      host = null;
    };
  });

  $effect(() => {
    const W = w, H = h;
    if (!host) return;
    host.resize(W, H); camera.aspect = W / Math.max(1, H); camera.updateProjectionMatrix();
    render();
  });

  $effect(() => {
    void ui.t; void ui.envelope; void ui.thermal; void ui.fires; void ui.probe; void ui.site; void ui.coast; void ui.mode; void ui.dps; void ui.hover; void items; void legendBox;
    for (const k in ui.layers) void ui.layers[k as keyof typeof ui.layers];
    frame();
  });

  function resetView() {
    if (!host) return;
    camera.position.copy(craterV.clone().multiplyScalar(3.4)).add(new THREE.Vector3(0, 0.6, 0));
    camera.lookAt(0, 0, 0); controls.update(); render();
  }
  function showAntipode() {
    if (!host) return;
    camera.position.copy(craterV.clone().multiplyScalar(-3.4)); camera.lookAt(0, 0, 0); controls.update(); render();
  }
</script>

<div class="globe" bind:clientWidth={w} bind:clientHeight={h}>
  <div class="gl" bind:this={box}></div>
  {#if failed}
    <div class="fail">{failed}</div>
  {:else}
    {#each labels as l (l.id)}
      {#if l.ring}
        <div class="ringlab" class:dim={l.dim} style={`left:${l.x}px;top:${l.y}px;color:${l.color};border-color:${l.color}`}>{l.text}</div>
      {:else}
        <div class="lab" class:sel={l.sel} style={`left:${l.x}px;top:${l.y}px`}>{l.text}</div>
      {/if}
    {/each}
    {#if wash > 0}<div class="wash" style={`opacity:${wash}`}></div>{/if}
    <div class="legwrap" bind:clientWidth={legW} bind:clientHeight={legH}><MapLegend {items} /></div>
    <div class="tools">
      <button onclick={resetView} title={L('Widok na krater', 'View the crater')}>{L('krater', 'crater')}</button>
      <button onclick={showAntipode} title={L('Widok na antypody krateru', 'View the crater’s antipode')}>{L('antypody', 'antipode')}</button>
    </div>
    <div class="note small">{L('Glob: paleogeografia PaleoDEM (Scotese & Wright 2018), PALEOMAP 65 Ma · przeciągnij — obrót, kółko — zbliżenie, klik — sonda · wyrzuty: orbity Keplera z ruchem obrotowym Ziemi, rozkład trajektorii △ zgodny z frontem z literatury; rozbłysk = ponowne wejście w atmosferę (symbol) · bolid i błysk to symbole, nie skala', 'Globe: PaleoDEM palaeogeography (Scotese & Wright 2018), PALEOMAP 65 Ma · drag — rotate, wheel — zoom, click — probe · ejecta: Kepler orbits with Earth rotation, trajectory distribution △ matched to the literature front; flash = atmospheric re-entry (symbol) · bolide and flash are symbols, not to scale')}</div>
  {/if}
</div>

<style>
  .globe { position: relative; width: 100%; height: 100%; overflow: hidden; background: #05070c; }
  .gl { position: absolute; inset: 0; }
  .fail { position: absolute; inset: 0; display: grid; place-items: center; padding: 2rem; color: var(--ink2); text-align: center; }
  .lab { position: absolute; transform: translate(8px, -50%); font-size: 10.5px; color: rgba(255,255,255,.75); pointer-events: none; white-space: nowrap; text-shadow: 0 0 3px #000, 0 0 6px #000; }
  .lab.sel { color: #fff; font-weight: 600; }
  .ringlab { position: absolute; padding: 0 5px; height: 16px; line-height: 15px; font-size: 10.5px; font-weight: 600; white-space: nowrap; pointer-events: none;
    background: rgba(8, 12, 18, 0.86); border: 1px solid; border-radius: 4px; transition: opacity .12s; }
  .ringlab.dim { opacity: 0.25; }
  .legwrap { position: absolute; right: 10px; bottom: 36px; z-index: 3; }
  .wash { position: absolute; inset: 0; pointer-events: none; background: radial-gradient(circle at 50% 50%, rgba(255,244,220,1), rgba(255,214,170,.35)); mix-blend-mode: screen; }
  .tools { position: absolute; right: 10px; top: 10px; display: flex; gap: 4px; }
  .note { position: absolute; left: 10px; right: 10px; bottom: 6px; color: var(--muted); pointer-events: none; }
</style>
