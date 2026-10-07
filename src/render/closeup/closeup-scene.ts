/**
 * Zbliżenie 3D miejsca uderzenia (skala rzeczywista, bez przewyższenia). Układ: x — wschód, y — w górę, z — południe; km.
 * Teren: profil z modelu kinematyki krateru (△, klatki kluczowe z rejestru) + rampa głębokości wody (△).
 * Bolid: średnica, prędkość, kąt i azymut z rejestru. Pióropusz par: górna prędkość i szerokość kolumny z rejestru,
 * barwa z temperatury (kotwice: temperatura początkowa i przezroczystości). Kurtyna ejecta: cząstki wyrzucane z krawędzi
 * rosnącej jamy (czas wyrzutu z modelu wzrostu jamy), lot balistyczny — kinematyka symboliczna.
 * Fala brzeżna: wysokość i promień w kotwicach z rejestru (150 s, 600 s), kształt pomiędzy — △.
 */
import * as THREE from 'three';
import type { AppData } from '../../app/data';
import { craterAt, craterKeyframes, craterWaterAt, type CraterKeyframes } from '../../model/predictive/crater-kinematics';
import { waterDepthM, RAMP_MAX_KM } from '../../model/predictive/water-depth';
import { bolideProgress, flashIntensity, type FlashTimes } from '../../app/impact-flash';
import { kelvinToRgb, plumeTemperatureK } from '../color';
import { glowTexture } from '../three-host';

const G = 0.0098; // km/s²
const RMAX = 300; // km
const NR = 170, NS = 192;

export interface CamPose { pos: THREE.Vector3; target: THREE.Vector3 }

const dirFromAz = (azDeg: number) => { const a = (azDeg * Math.PI) / 180; return new THREE.Vector3(Math.sin(a), 0, -Math.cos(a)); };

function rng(seed: number) {
  return () => { seed |= 0; seed = (seed + 0x6d2b79f5) | 0; let t = Math.imul(seed ^ (seed >>> 15), 1 | seed); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
}

const ringRadius = (i: number) => RMAX * (i / NR) ** 1.35;

export class CloseupScene {
  readonly scene = new THREE.Scene();
  readonly camera: THREE.PerspectiveCamera;
  private k: CraterKeyframes;
  private fx: FlashTimes;
  private data: AppData;

  private ground!: THREE.Mesh<THREE.BufferGeometry, THREE.ShaderMaterial>;
  private groundBase!: Float32Array; // stała głębokość dna (rampa) na wierzchołek
  private water!: THREE.Mesh<THREE.BufferGeometry, THREE.ShaderMaterial>;
  private asteroid!: THREE.Mesh;
  private bowGlow!: THREE.Sprite;
  private trail!: THREE.Mesh<THREE.BufferGeometry, THREE.ShaderMaterial>;
  private flash!: THREE.Sprite;
  private plume!: THREE.Points<THREE.BufferGeometry, THREE.ShaderMaterial>;
  private curtain!: THREE.Points<THREE.BufferGeometry, THREE.ShaderMaterial>;

  private L: number; private v: number; private angle: number; private approach: THREE.Vector3; private pathDir: THREE.Vector3;
  /** położenie środka bolidu (do etykiety) i wysokość czoła fali brzeżnej */
  readonly marks = { bolide: new THREE.Vector3(), bolideVisible: false, rimWave: new THREE.Vector3(), rimWaveVisible: false, rimWaveAmpKm: 0 };

  constructor(data: AppData) {
    this.data = data;
    const reg = data.reg;
    this.k = craterKeyframes(reg);
    this.fx = { tEntry: reg.num('impactor.entry_duration'), tMaxRad: reg.num('fireball.t_max_radiation_eiep'), radDurS: reg.seconds('fireball.radiation_duration_eiep') };
    this.L = reg.num('impactor.diameter'); this.v = reg.num('impactor.velocity');
    this.angle = (reg.num('impactor.angle') * Math.PI) / 180;
    this.approach = dirFromAz(reg.num('impactor.approach_azimuth'));
    // kierunek „wstecz po torze": od punktu kontaktu ku nadlatującemu bolidowi (z NE, w górę pod kątem uderzenia)
    this.pathDir = this.approach.clone().multiplyScalar(Math.cos(this.angle)).add(new THREE.Vector3(0, Math.sin(this.angle), 0)).normalize();

    this.camera = new THREE.PerspectiveCamera(40, 1, 0.5, 30000);
    this.scene.background = new THREE.Color(0x070b14);
    this.scene.add(new THREE.HemisphereLight(0x9fb6d8, 0x2a2420, 0.9));
    const sun = new THREE.DirectionalLight(0xffffff, 1.6); sun.position.set(-0.4, 1, 0.5); this.scene.add(sun);

    this.buildGround();
    this.buildWater();
    this.buildBolide();
    this.buildPlume();
    this.buildCurtain();
  }

  // ── teren ──────────────────────────────────────────────────────────────
  private buildGround(): void {
    const nV = (NR + 1) * NS;
    const pos = new Float32Array(nV * 3), nor = new Float32Array(nV * 3), col = new Float32Array(nV * 3), glow = new Float32Array(nV);
    this.groundBase = new Float32Array(nV);
    for (let i = 0; i <= NR; i++) {
      const r = ringRadius(i);
      for (let j = 0; j < NS; j++) {
        const th = (j / NS) * Math.PI * 2, idx = i * NS + j;
        const x = r * Math.sin(th), z = -r * Math.cos(th); // th = azymut od N
        pos[idx * 3] = x; pos[idx * 3 + 2] = z;
        const az = (th * 180) / Math.PI;
        this.groundBase[idx] = -((waterDepthM(this.data.ctx, Math.min(r, RAMP_MAX_KM), az) ?? 0) / 1000);
        nor[idx * 3 + 1] = 1;
      }
    }
    const idx: number[] = [];
    for (let i = 0; i < NR; i++) for (let j = 0; j < NS; j++) {
      const a = i * NS + j, b = i * NS + ((j + 1) % NS), c = (i + 1) * NS + j, d = (i + 1) * NS + ((j + 1) % NS);
      idx.push(a, b, c, b, d, c); // przeciwnie do ruchu wskazówek zegara patrząc z góry (ściany przednie)
    }
    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.BufferAttribute(pos, 3));
    g.setAttribute('normal', new THREE.BufferAttribute(nor, 3));
    g.setAttribute('aCol', new THREE.BufferAttribute(col, 3));
    g.setAttribute('aGlow', new THREE.BufferAttribute(glow, 1));
    g.setIndex(idx);
    const m = new THREE.ShaderMaterial({
      uniforms: { uLight: { value: new THREE.Vector3(-0.4, 1, 0.5).normalize() }, uFlash: { value: 0 } },
      vertexShader: /* glsl */ `
        attribute vec3 aCol; attribute float aGlow;
        varying vec3 vCol; varying float vGlow; varying vec3 vN; varying vec3 vP;
        void main() { vCol = aCol; vGlow = aGlow; vN = normal; vP = position; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }
      `,
      fragmentShader: /* glsl */ `
        uniform vec3 uLight; uniform float uFlash;
        varying vec3 vCol; varying float vGlow; varying vec3 vN; varying vec3 vP;
        void main() {
          float rr = length(vP.xz);
          float fw = max(fwidth(rr), 1e-4);
          float grid = 1.0 - smoothstep(0.0, 1.2 * fw, abs(mod(rr + 25.0, 50.0) - 25.0));
          vec3 n = normalize(vN);
          float lit = 0.32 + 0.78 * max(dot(n, uLight), 0.0);
          vec3 c = vCol * lit;
          c += vCol * uFlash * 1.2 / (1.0 + pow(rr / 60.0, 2.0));
          c += vec3(1.0, 0.42, 0.12) * vGlow;
          c = mix(c, vec3(0.85, 0.9, 1.0), grid * 0.18 * step(rr, 290.0));
          c = mix(c, vec3(0.027, 0.043, 0.078), smoothstep(200.0, 300.0, rr));
          gl_FragColor = vec4(c, 1.0);
        }
      `,
    });
    this.ground = new THREE.Mesh(g, m);
    this.ground.frustumCulled = false;
    this.scene.add(this.ground);
  }

  private updateGround(t: number): void {
    const st = craterAt(this.k, t);
    const g = this.ground.geometry;
    const pos = g.getAttribute('position') as THREE.BufferAttribute, nor = g.getAttribute('normal') as THREE.BufferAttribute;
    const col = g.getAttribute('aCol') as THREE.BufferAttribute, glow = g.getAttribute('aGlow') as THREE.BufferAttribute;
    const s = new Float32Array(NR + 1), melt = new Float32Array(NR + 1);
    for (let i = 0; i <= NR; i++) { const r = ringRadius(i); s[i] = st.surface(r); melt[i] = st.melt(r); }
    const hot = t <= 0 ? 0 : 0.55 + 0.45 * Math.exp(-t / 3600); // stop stygnie powoli — na powierzchni szybciej niż w głębi
    const ejectaFront = t <= 0 ? 0 : Math.min(RMAX, this.k.Rt * 1.1 + 2.5 * t); // narastanie pokrywy ejecta wokół krawędzi (symbol)
    for (let i = 0; i <= NR; i++) {
      const r = ringRadius(i);
      const i0 = Math.max(0, i - 1), i1 = Math.min(NR, i + 1);
      const dsdr = (s[i1]! - s[i0]!) / Math.max(1e-6, ringRadius(i1) - ringRadius(i0));
      const inside = t > 0 && r < st.cavityRadius;
      const uplift = Math.min(1, Math.max(0, s[i]! / 10));
      // barwy: platforma węglanowa / brekcja / granitoid wypiętrzony / pokrywa ejecta
      let cr: number, cg: number, cb: number;
      if (inside) { cr = 0.33 + 0.25 * uplift; cg = 0.31 + 0.18 * uplift; cb = 0.31 + 0.17 * uplift; }
      else if (t > 0 && r < ejectaFront && r < 3 * this.k.Rf) { const f = Math.min(1, (ejectaFront - r) / 40); cr = 0.74 - 0.28 * f; cg = 0.69 - 0.3 * f; cb = 0.58 - 0.3 * f; }
      else { cr = 0.76; cg = 0.72; cb = 0.6; }
      const gl = melt[i]! > 0.01 ? Math.min(1, melt[i]! / 1.5) * hot : 0;
      const P = pos.array as Float32Array, Nn = nor.array as Float32Array, C = col.array as Float32Array, Gl = glow.array as Float32Array;
      const inv = 1 / Math.hypot(dsdr, 1);
      for (let j = 0; j < NS; j++) {
        const v = i * NS + j, th = (j / NS) * Math.PI * 2, v3 = v * 3;
        P[v3 + 1] = this.groundBase[v]! + s[i]!;
        Nn[v3] = -dsdr * Math.sin(th) * inv; Nn[v3 + 1] = inv; Nn[v3 + 2] = dsdr * Math.cos(th) * inv;
        C[v3] = cr; C[v3 + 1] = cg; C[v3 + 2] = cb;
        Gl[v] = gl;
      }
    }
    pos.needsUpdate = nor.needsUpdate = col.needsUpdate = glow.needsUpdate = true;
  }

  // ── woda ───────────────────────────────────────────────────────────────
  private buildWater(): void {
    const nV = (NR + 1) * NS;
    const pos = new Float32Array(nV * 3), vis = new Float32Array(nV);
    for (let i = 0; i <= NR; i++) {
      const r = ringRadius(i);
      for (let j = 0; j < NS; j++) { const th = (j / NS) * Math.PI * 2, v = i * NS + j; pos[v * 3] = r * Math.sin(th); pos[v * 3 + 2] = -r * Math.cos(th); }
    }
    const idx: number[] = [];
    for (let i = 0; i < NR; i++) for (let j = 0; j < NS; j++) {
      const a = i * NS + j, b = i * NS + ((j + 1) % NS), c = (i + 1) * NS + j, d = (i + 1) * NS + ((j + 1) % NS);
      idx.push(a, b, c, b, d, c); // przeciwnie do ruchu wskazówek zegara patrząc z góry (ściany przednie)
    }
    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.BufferAttribute(pos, 3));
    g.setAttribute('aVis', new THREE.BufferAttribute(vis, 1));
    g.setIndex(idx);
    const m = new THREE.ShaderMaterial({
      transparent: true, depthWrite: false, side: THREE.DoubleSide,
      uniforms: { uFlash: { value: 0 } },
      vertexShader: /* glsl */ `
        attribute float aVis; varying float vVis; varying vec3 vP; varying vec3 vW;
        void main() { vVis = aVis; vP = position; vec4 w = modelMatrix * vec4(position, 1.0); vW = w.xyz; gl_Position = projectionMatrix * viewMatrix * w; }
      `,
      fragmentShader: /* glsl */ `
        uniform float uFlash; varying float vVis; varying vec3 vP; varying vec3 vW;
        void main() {
          vec3 n = normalize(cross(dFdx(vW), dFdy(vW))); // pochodne przed discard (jednorodny przepływ sterowania)
          if (vVis < 0.5) discard;
          vec3 v = normalize(cameraPosition - vW);
          float fres = pow(1.0 - abs(dot(n, v)), 3.0);
          float lit = 0.55 + 0.45 * abs(n.y);
          vec3 c = vec3(0.09, 0.3, 0.48) * lit + vec3(0.55, 0.7, 0.85) * fres * 0.5;
          float rr = length(vP.xz);
          c += vec3(1.0, 0.85, 0.6) * uFlash * 0.9 / (1.0 + pow(rr / 60.0, 2.0));
          float fade = 1.0 - smoothstep(200.0, 300.0, rr);
          gl_FragColor = vec4(c, (0.72 + 0.2 * fres) * fade);
        }
      `,
    });
    this.water = new THREE.Mesh(g, m);
    this.water.frustumCulled = false;
    this.water.renderOrder = 2;
    this.scene.add(this.water);
  }

  /** Fala brzeżna (rim wave): kotwice z rejestru — wysokość w 150 s i 600 s, promień w 600 s; między nimi △. */
  private rimWave(t: number): { R: number; A: number } | null {
    const reg = this.data.reg, k = this.k;
    const t150 = reg.param('tsunami.wave_height_150s').time?.t ?? 150, A150 = reg.num('tsunami.wave_height_150s');
    const t600 = reg.param('tsunami.initial_amplitude').time?.t ?? 600, A600 = reg.num('tsunami.initial_amplitude');
    const R600 = reg.num('tsunami.rim_wave_radius_600s');
    if (t <= k.tTr * 0.5) return null;
    const R = t <= t600 ? k.Rt + ((R600 - k.Rt) * (t - k.tTr * 0.5)) / (t600 - k.tTr * 0.5) : R600 + reg.num('tsunami.front_speed_deep') / 1000 * (t - t600);
    let A: number;
    if (t <= t150) A = A150 * Math.min(1, (t - k.tTr * 0.5) / (t150 - k.tTr * 0.5));
    else if (t <= t600) A = A150 + ((A600 - A150) * (t - t150)) / (t600 - t150);
    else A = (A600 * R600) / R; // zanik ~1/r poza kotwicą (△)
    return { R, A };
  }

  private updateWater(t: number): void {
    const k = this.k;
    const st = craterAt(k, t);
    const floorBelowSea = -this.groundBase[0]! + k.Df;
    const cw = craterWaterAt(k, t, floorBelowSea);
    const rw = this.rimWave(t);
    const sigma = this.data.reg.num('tsunami.rim_wave_wavelength') / 4;
    const g = this.water.geometry;
    const pos = g.getAttribute('position') as THREE.BufferAttribute, vis = g.getAttribute('aVis') as THREE.BufferAttribute;
    this.marks.rimWaveVisible = !!rw && rw.R < RMAX;
    if (rw) { this.marks.rimWave.set(0, rw.A, rw.R); this.marks.rimWaveAmpKm = rw.A; }
    for (let i = 0; i <= NR; i++) {
      const r = ringRadius(i);
      let y = 0, show = true;
      if (t > 0) {
        if (t < k.tF) show = r > Math.min(k.Rf, 1.3 * st.cavityRadius);
        else if (cw.basinLevel === null) show = r > cw.inflowRadius;
        else if (r < k.Rf) y = cw.basinLevel;
        if (rw && r >= (cw.basinLevel === null ? 0 : k.Rf)) y += rw.A * Math.exp(-(((r - rw.R) / sigma) ** 2));
      }
      const P = pos.array as Float32Array, V = vis.array as Float32Array;
      for (let j = 0; j < NS; j++) { const v = i * NS + j; P[v * 3 + 1] = y; V[v] = show ? 1 : 0; }
    }
    pos.needsUpdate = vis.needsUpdate = true;
  }

  // ── bolid ──────────────────────────────────────────────────────────────
  private buildBolide(): void {
    const geo = new THREE.IcosahedronGeometry(this.L / 2, 5);
    const p = geo.getAttribute('position') as THREE.BufferAttribute, v = new THREE.Vector3();
    for (let i = 0; i < p.count; i++) {
      v.fromBufferAttribute(p, i).normalize();
      const n = 0.09 * Math.sin(3.1 * v.x + 1.7) * Math.cos(2.3 * v.y - 0.4) + 0.06 * Math.sin(5.7 * v.z + 2.2 * v.x) + 0.035 * Math.sin(11 * v.y + 7 * v.z);
      v.multiplyScalar((this.L / 2) * (1 + n)); p.setXYZ(i, v.x, v.y, v.z);
    }
    geo.computeVertexNormals();
    this.asteroid = new THREE.Mesh(geo, new THREE.MeshStandardMaterial({ color: 0x2c2926, roughness: 0.95, metalness: 0, emissive: 0xff7a2a, emissiveIntensity: 0 }));
    this.scene.add(this.asteroid);
    const glow = glowTexture([[0, 'rgba(255,250,235,1)'], [0.2, 'rgba(255,220,150,0.85)'], [0.5, 'rgba(255,140,60,0.3)'], [1, 'rgba(255,90,30,0)']]);
    this.bowGlow = new THREE.Sprite(new THREE.SpriteMaterial({ map: glow, blending: THREE.AdditiveBlending, depthWrite: false, transparent: true }));
    this.scene.add(this.bowGlow);
    // ślad: stożek wzdłuż toru, jasność maleje ku tyłowi
    const tg = new THREE.CylinderGeometry(this.L * 0.62, this.L * 0.3, 1, 32, 1, true);
    tg.translate(0, 0.5, 0); // od 0 (czoło) do 1 (ogon)
    this.trail = new THREE.Mesh(tg, new THREE.ShaderMaterial({
      transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, side: THREE.DoubleSide,
      uniforms: { uI: { value: 0 } },
      vertexShader: /* glsl */ `varying float vY; void main() { vY = position.y; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }`,
      fragmentShader: /* glsl */ `uniform float uI; varying float vY; void main() { float a = uI * pow(1.0 - vY, 1.6); gl_FragColor = vec4(vec3(1.0, 0.72, 0.38) * a, a); }`,
    }));
    this.scene.add(this.trail);
    this.flash = new THREE.Sprite(new THREE.SpriteMaterial({ map: glow, blending: THREE.AdditiveBlending, depthWrite: false, depthTest: false, transparent: true }));
    this.flash.renderOrder = 10;
    this.scene.add(this.flash);
  }

  private updateBolide(t: number): void {
    const prog = bolideProgress(t, this.fx.tEntry);
    const tPen = this.L / (this.v * Math.sin(this.angle));
    const show = prog !== null || (t >= 0 && t < tPen);
    this.asteroid.visible = this.bowGlow.visible = this.trail.visible = show;
    this.marks.bolideVisible = prog !== null;
    if (show) {
      const s = -this.v * t; // droga po torze od punktu kontaktu (ujemna = pod powierzchnią)
      const c = this.pathDir.clone().multiplyScalar(s + this.L / 2);
      this.asteroid.position.copy(c);
      this.asteroid.rotation.set(0.3 + t * 0.05, 0.8 + t * 0.03, 0);
      this.marks.bolide.copy(c);
      const h = Math.max(0, c.y);
      const heat = Math.exp(-h / 8); // względna gęstość powietrza (skala wysokości ~8 km) — nagrzewanie czoła
      const vanish = t > 0 ? 1 - t / tPen : 1;
      (this.asteroid.material as THREE.MeshStandardMaterial).emissiveIntensity = 0.04 + 0.9 * heat;
      const front = c.clone().addScaledVector(this.pathDir, -this.L * 0.45);
      this.bowGlow.position.copy(front);
      const gs = this.L * (1.6 + 3.5 * heat ** 0.4) * vanish; this.bowGlow.scale.set(gs, gs, 1);
      const len = Math.min(140, Math.max(5, -this.v * Math.min(t, 0) + 40));
      this.trail.position.copy(c);
      this.trail.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), this.pathDir);
      this.trail.scale.set(1, len, 1);
      this.trail.material.uniforms.uI!.value = (0.35 + 0.65 * heat ** 0.35) * vanish;
    }
    const I = flashIntensity(t, this.fx);
    // błysk kontaktowy (pierwsza sekunda) jest oślepiający; potem tylko przygaszona poświata — czytelność ponad dosłowność
    const contact = t > 0 && t < 1 ? Math.max(0, 1 - Math.log10(Math.max(t, 0.01) / 0.01) / 2) : 0;
    const fx = Math.max(contact, 0.22 * I);
    this.flash.visible = fx > 0.01;
    if (fx > 0.01) { const s = 18 + 110 * fx; this.flash.scale.set(s, s, 1); this.flash.position.set(0, 3, 0); (this.flash.material as THREE.SpriteMaterial).opacity = Math.min(1, 0.2 + 0.8 * fx); }
    this.ground.material.uniforms.uFlash!.value = 0.7 * fx;
    this.water.material.uniforms.uFlash!.value = 0.7 * fx;
  }

  // ── pióropusz par (GPU) ────────────────────────────────────────────────
  private buildPlume(): void {
    const N = 3600, rand = rng(1302);
    const dir = new Float32Array(N * 3), spd = new Float32Array(N), pos = new Float32Array(N * 3);
    const down = this.approach.clone().multiplyScalar(-1); // z biegiem lotu (SW)
    for (let i = 0; i < N; i++) {
      const u = rand(), phi = rand() * Math.PI * 2;
      const cosT = Math.sqrt(u); // rozkład kosinusowy — przewaga kierunków pionowych
      const sinT = Math.sqrt(1 - cosT * cosT);
      const d = new THREE.Vector3(sinT * Math.cos(phi) * 0.55, cosT, sinT * Math.sin(phi) * 0.55).addScaledVector(down, 0.12 * cosT).normalize();
      dir.set([d.x, d.y, d.z], i * 3);
      spd[i] = 0.2 + 0.8 * Math.sqrt(rand());
    }
    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.BufferAttribute(pos, 3));
    g.setAttribute('aDir', new THREE.BufferAttribute(dir, 3));
    g.setAttribute('aSpd', new THREE.BufferAttribute(spd, 1));
    const m = new THREE.ShaderMaterial({
      transparent: true, depthWrite: false, blending: THREE.AdditiveBlending,
      uniforms: { uT: { value: 0 }, uV: { value: 6 }, uG: { value: G }, uCol: { value: new THREE.Color(1, 1, 1) }, uA: { value: 0 }, uScale: { value: 600 }, uTex: { value: glowTexture([[0, 'rgba(255,255,255,1)'], [0.25, 'rgba(255,255,255,0.55)'], [0.6, 'rgba(255,255,255,0.12)'], [1, 'rgba(255,255,255,0)']], 64) } },
      vertexShader: /* glsl */ `
        attribute vec3 aDir; attribute float aSpd;
        uniform float uT, uV, uG, uScale;
        varying float vK;
        void main() {
          float s = aSpd * uV * uT;
          vec3 p = aDir * s;
          p.y -= 0.5 * uG * uT * uT;
          vK = p.y < 0.0 ? 0.0 : 1.0;
          p.y = max(p.y, 0.5);
          vec4 mv = modelViewMatrix * vec4(p, 1.0);
          gl_PointSize = clamp(uScale * min(3.0 + 0.012 * s, 16.0) / -mv.z, 1.0, 48.0);
          gl_Position = projectionMatrix * mv;
        }
      `,
      fragmentShader: /* glsl */ `
        uniform vec3 uCol; uniform float uA; uniform sampler2D uTex; varying float vK;
        void main() { float a = texture2D(uTex, gl_PointCoord).r * uA * vK; gl_FragColor = vec4(uCol, a); }
      `,
    });
    this.plume = new THREE.Points(g, m);
    this.plume.frustumCulled = false;
    this.scene.add(this.plume);
  }

  private updatePlume(t: number, show: boolean): void {
    const reg = this.data.reg;
    const vis = show && t > 0 && t < 4 * 3600;
    this.plume.visible = vis;
    if (!vis) return;
    const T = plumeTemperatureK(t, reg.num('fireball.plume_initial_temperature'), reg.num('fireball.transparency_temperature'), this.fx.tMaxRad);
    const u = this.plume.material.uniforms;
    u.uT!.value = t; u.uV!.value = reg.num('fireball.plume_upper_velocity');
    const m = this.plume.material;
    if (T > reg.num('fireball.transparency_temperature') * 0.7) {
      const [r, g, b] = kelvinToRgb(T);
      (u.uCol!.value as THREE.Color).setRGB(r / 255, g / 255, b / 255);
      u.uA!.value = 0.09;
      m.blending = THREE.AdditiveBlending;
    } else { // po ostygnięciu poniżej przezroczystości: kondensat, pył i sferule — szarobrązowy obłok
      (u.uCol!.value as THREE.Color).setRGB(0.46, 0.4, 0.35);
      u.uA!.value = 0.22 * Math.max(0, 1 - Math.log10(Math.max(t, 60) / 60) / Math.log10((4 * 3600) / 60));
      m.blending = THREE.NormalBlending;
    }
  }

  // ── kurtyna ejecta (GPU) ───────────────────────────────────────────────
  private buildCurtain(): void {
    const N = 6000, rand = rng(4242), k = this.k;
    const r0 = new Float32Array(N), az = new Float32Array(N * 2), tl = new Float32Array(N), vv = new Float32Array(N), pos = new Float32Array(N * 3);
    for (let i = 0; i < N; i++) {
      const r = k.Rt * Math.sqrt(0.04 + 0.96 * rand());
      const a = rand() * Math.PI * 2;
      r0[i] = r; az[i * 2] = Math.sin(a); az[i * 2 + 1] = -Math.cos(a);
      tl[i] = k.tTr * (r / k.Rt) ** 2.5; // chwila, gdy krawędź jamy mija promień r (odwrotność R ∝ t^0,4)
      vv[i] = Math.min(4, 0.6 * Math.sqrt(G * k.Rt) * (r / k.Rt) ** -1.8) * (0.85 + 0.3 * rand());
    }
    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.BufferAttribute(pos, 3));
    g.setAttribute('aR0', new THREE.BufferAttribute(r0, 1));
    g.setAttribute('aAz', new THREE.BufferAttribute(az, 2));
    g.setAttribute('aTl', new THREE.BufferAttribute(tl, 1));
    g.setAttribute('aV', new THREE.BufferAttribute(vv, 1));
    const m = new THREE.ShaderMaterial({
      transparent: true, depthWrite: false,
      uniforms: { uT: { value: 0 }, uG: { value: G }, uScale: { value: 600 }, uCol: { value: new THREE.Color(0.94, 0.66, 0.19) }, uTex: { value: glowTexture([[0, 'rgba(255,255,255,1)'], [0.45, 'rgba(255,255,255,0.7)'], [1, 'rgba(255,255,255,0)']], 32) } },
      vertexShader: /* glsl */ `
        attribute float aR0; attribute vec2 aAz; attribute float aTl; attribute float aV;
        uniform float uT, uG, uScale;
        varying float vK;
        void main() {
          float tau = uT - aTl;
          float c = 0.70710678;
          float hr = aR0 + aV * c * max(tau, 0.0);
          float y = aV * c * max(tau, 0.0) - 0.5 * uG * max(tau, 0.0) * max(tau, 0.0);
          vK = (tau > 0.0 && y > 0.0) ? 1.0 : 0.0;
          vec3 p = vec3(aAz.x * hr, max(y, 0.0), aAz.y * hr);
          vec4 mv = modelViewMatrix * vec4(p, 1.0);
          gl_PointSize = clamp(uScale * 2.2 / -mv.z, 1.0, 24.0);
          gl_Position = projectionMatrix * mv;
        }
      `,
      fragmentShader: /* glsl */ `
        uniform vec3 uCol; uniform sampler2D uTex; varying float vK;
        void main() { if (vK < 0.5) discard; float a = texture2D(uTex, gl_PointCoord).r * 0.8; gl_FragColor = vec4(uCol, a); }
      `,
    });
    this.curtain = new THREE.Points(g, m);
    this.curtain.frustumCulled = false;
    this.scene.add(this.curtain);
  }

  private updateCurtain(t: number, show: boolean): void {
    this.curtain.visible = show && t > 0 && t < 2400;
    this.curtain.material.uniforms.uT!.value = t;
  }

  // ── kamera automatyczna: pozy kluczowe w czasie (log t po kontakcie) ─────
  autoPose(t: number): CamPose {
    const side = new THREE.Vector3(0, 1, 0).cross(this.approach).normalize(); // prostopadle do płaszczyzny toru
    const poses: Array<[number, CamPose]> = [
      [-this.fx.tEntry, { pos: this.pathDir.clone().multiplyScalar(70).addScaledVector(side, 190).add(new THREE.Vector3(0, 30, 0)), target: this.pathDir.clone().multiplyScalar(55) }],
      [0, { pos: this.pathDir.clone().multiplyScalar(10).addScaledVector(side, 120).add(new THREE.Vector3(0, 25, 0)), target: new THREE.Vector3(0, 6, 0) }],
      [3, { pos: new THREE.Vector3(95, 60, 150), target: new THREE.Vector3(0, -6, 0) }],
      [40, { pos: new THREE.Vector3(150, 110, 230), target: new THREE.Vector3(0, 10, 0) }],
      [200, { pos: new THREE.Vector3(260, 380, 820), target: new THREE.Vector3(0, 160, 0) }],
      [1200, { pos: new THREE.Vector3(170, 150, 260), target: new THREE.Vector3(0, -8, 0) }],
      [86400, { pos: new THREE.Vector3(150, 120, 220), target: new THREE.Vector3(0, -5, 0) }],
    ];
    const u = (x: number) => (x <= 0 ? x / this.fx.tEntry : Math.log10(Math.max(x, 0.01)) + 2.0001); // prolog liniowo, potem log
    let i = 0;
    while (i < poses.length - 2 && t > poses[i + 1]![0]) i++;
    const [ta, A] = poses[i]!, [tb, B] = poses[i + 1]!;
    const f = Math.min(1, Math.max(0, (u(t) - u(ta)) / (u(tb) - u(ta))));
    const s = f * f * (3 - 2 * f);
    return { pos: A.pos.clone().lerp(B.pos, s), target: A.target.clone().lerp(B.target, s) };
  }

  update(t: number, layers: { crater: boolean; ejecta: boolean; thermal: boolean; tsunami: boolean }): void {
    this.updateGround(t);
    this.updateWater(t);
    this.water.visible = true;
    this.updateBolide(t);
    this.updatePlume(t, layers.thermal);
    this.updateCurtain(t, layers.ejecta);
  }

  setViewport(w: number, h: number, pixelRatio: number): void {
    this.camera.aspect = w / Math.max(1, h);
    this.camera.updateProjectionMatrix();
    const scale = (h * pixelRatio) / (2 * Math.tan((this.camera.fov * Math.PI) / 360));
    this.plume.material.uniforms.uScale!.value = scale;
    this.curtain.material.uniforms.uScale!.value = scale;
  }
}
