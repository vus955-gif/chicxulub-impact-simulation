/**
 * Materiał globu: tekstura paleo + pola zjawisk liczone w shaderze z odległości kątowej piksela od krateru
 * (acos(dot(n, n_krateru))) — te same promienie frontów, co na mapie 2D (fronts.ts), przekazywane jako uniformy.
 * Kolory surowe (bez konwersji przestrzeni barw), zgodne z tokenami motywu.
 */
import * as THREE from 'three';

export const MAX_FRONTS = 16;

const vertex = /* glsl */ `
  varying vec2 vUv;
  varying vec3 vN;
  void main() {
    vUv = uv;
    vN = normalize(position);
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

const fragment = /* glsl */ `
  #define MAX_FRONTS ${MAX_FRONTS}
  uniform sampler2D uTex;
  uniform sampler2D uTT;      // czas dotarcia tsunami [h], -1 = brak
  uniform sampler2D uAmp;     // maks. amplituda [m], -1 = brak
  uniform sampler2D uDark;    // ułamek światła vs odległość (0…π) — LUT 1D
  uniform vec3 uCrater;
  uniform float uTh;          // czas [h]
  uniform float uBandH;       // szerokość pasa frontu tsunami [h]
  uniform int uShowTs;
  uniform int uEnvelope;
  uniform int uShowDark;
  uniform float uFront[MAX_FRONTS];      // promień kątowy [rad]; < 0 = brak
  uniform vec3 uFrontColor[MAX_FRONTS];
  uniform float uFrontDash[MAX_FRONTS];  // 0 = ciągła; > 0 = liczba kresek na obwód wielkiego koła
  uniform float uFrontWidth[MAX_FRONTS]; // szerokość w pikselach
  uniform float uFrontAlpha[MAX_FRONTS]; // krycie (przygaszanie przy wyróżnieniu innego elementu)
  uniform float uAIr, uAFireball, uAFires, uACrater; // krycie pól i linii poza tablicą
  uniform float uIrOuter, uIrInner, uFireball, uFires, uCraterR;
  uniform vec3 cThermal, cFires, cCrater, cTsunami;
  varying vec2 vUv;
  varying vec3 vN;

  // fw liczone RAZ na początku main(): pochodne w pętlach/warunkach są niezdefiniowane (ANGLE/D3D zwraca 0)
  float ring(float d, float r, float px, float fw) {
    return 1.0 - smoothstep(0.0, px * fw, abs(d - r));
  }

  void main() {
    vec3 n = normalize(vN);
    vec3 col = texture2D(uTex, vUv).rgb;
    float d = acos(clamp(dot(n, uCrater), -1.0, 1.0));
    float fw = max(fwidth(d), 1e-6);
    // azymut wokół krateru (do kreskowania pierścieni)
    vec3 e1 = normalize(cross(uCrater, vec3(0.0, 1.0, 0.0)));
    vec3 e2 = cross(uCrater, e1);
    float az = atan(dot(n, e2), dot(n, e1));
    vec2 duv = vec2(vUv.x, 1.0 - vUv.y);

    if (uShowDark == 1) {
      float light = texture2D(uDark, vec2(d / 3.14159265, 0.5)).r;
      col *= 1.0 - (1.0 - light) * 0.6;
    }
    if (uShowTs == 1) {
      float tt = texture2D(uTT, duv).r;
      if (tt >= 0.0 && tt <= uTh) {
        float a;
        if (uEnvelope == 1) {
          float amp = texture2D(uAmp, duv).r;
          a = amp > 0.0 ? clamp((log(max(amp, 0.05)) / log(10.0) + 1.0) / 3.2, 0.12, 0.9) : 0.15;
        } else {
          a = (uTh - tt) < uBandH ? 0.25 + 0.65 * (1.0 - (uTh - tt) / uBandH) : 0.14;
        }
        col = mix(col, cTsunami, a);
      }
    }
    if (uIrOuter > uIrInner + 1e-5 && d < uIrOuter && d > uIrInner) col = mix(col, cThermal, 0.2 * uAIr);
    if (uFireball > 0.0 && d < uFireball) col = mix(col, cThermal, 0.4 * uAFireball);
    if (uFires > 0.0) {
      float dash = step(0.5, fract(az * 48.0 / 6.2831853));
      col = mix(col, cFires, ring(d, uFires, 1.8, fw) * dash * uAFires);
    }
    for (int i = 0; i < MAX_FRONTS; i++) {
      float r = uFront[i];
      if (r <= 0.0) continue;
      float a = ring(d, r, uFrontWidth[i], fw) * uFrontAlpha[i];
      if (uFrontDash[i] > 0.0) a *= step(0.45, fract(az * max(6.0, uFrontDash[i] * sin(r)) / 6.2831853));
      col = mix(col, uFrontColor[i], a);
    }
    if (uCraterR > 0.0) col = mix(col, cCrater, ring(d, uCraterR, 1.8, fw) * uACrater);
    gl_FragColor = vec4(col, 1.0);
  }
`;

export function createGlobeMaterial(tex: THREE.Texture, tt: THREE.DataTexture, amp: THREE.DataTexture, dark: THREE.DataTexture): THREE.ShaderMaterial {
  return new THREE.ShaderMaterial({
    vertexShader: vertex,
    fragmentShader: fragment,
    uniforms: {
      uTex: { value: tex }, uTT: { value: tt }, uAmp: { value: amp }, uDark: { value: dark },
      uCrater: { value: new THREE.Vector3(1, 0, 0) },
      uTh: { value: 0 }, uBandH: { value: 0.1 },
      uShowTs: { value: 0 }, uEnvelope: { value: 0 }, uShowDark: { value: 0 },
      uFront: { value: new Array(MAX_FRONTS).fill(-1) },
      uFrontColor: { value: Array.from({ length: MAX_FRONTS }, () => new THREE.Color(1, 1, 1)) },
      uFrontDash: { value: new Array(MAX_FRONTS).fill(0) },
      uFrontWidth: { value: new Array(MAX_FRONTS).fill(1.5) },
      uFrontAlpha: { value: new Array(MAX_FRONTS).fill(1) },
      uAIr: { value: 1 }, uAFireball: { value: 1 }, uAFires: { value: 1 }, uACrater: { value: 1 },
      uIrOuter: { value: 0 }, uIrInner: { value: 0 }, uFireball: { value: 0 }, uFires: { value: 0 }, uCraterR: { value: 0 },
      cThermal: { value: new THREE.Color() }, cFires: { value: new THREE.Color() }, cCrater: { value: new THREE.Color() }, cTsunami: { value: new THREE.Color() },
    },
  });
}

/** Poświata atmosfery: cienka obwódka (Fresnel) na sferze nieco większej od globu. */
export function createAtmosphereMaterial(): THREE.ShaderMaterial {
  return new THREE.ShaderMaterial({
    vertexShader: /* glsl */ `
      varying vec3 vNv; varying vec3 vPv;
      void main() { vec4 mv = modelViewMatrix * vec4(position, 1.0); vPv = mv.xyz; vNv = normalize(normalMatrix * normal); gl_Position = projectionMatrix * mv; }
    `,
    fragmentShader: /* glsl */ `
      varying vec3 vNv; varying vec3 vPv;
      void main() { float f = pow(1.0 - abs(dot(normalize(-vPv), vNv)), 3.0); gl_FragColor = vec4(vec3(0.42, 0.62, 1.0) * f, f * 0.9); }
    `,
    side: THREE.BackSide, transparent: true, blending: THREE.AdditiveBlending, depthWrite: false,
  });
}
