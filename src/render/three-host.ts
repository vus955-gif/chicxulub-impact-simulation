/** Wspólny host WebGL dla widoków 3D: renderer, rozmiar, DPR, render na żądanie i sprzątanie zasobów. */
import * as THREE from 'three';

export function webglAvailable(): boolean {
  try {
    const c = document.createElement('canvas');
    return !!(c.getContext('webgl2') ?? c.getContext('webgl'));
  } catch {
    return false;
  }
}

export interface ThreeHost {
  renderer: THREE.WebGLRenderer;
  canvas: HTMLCanvasElement;
  size: { w: number; h: number };
  resize(w: number, h: number): void;
  dispose(): void;
}

export function createHost(container: HTMLElement, clear = 0x05070c): ThreeHost {
  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false, powerPreference: 'high-performance' });
  renderer.setPixelRatio(Math.min(2, window.devicePixelRatio || 1));
  renderer.setClearColor(clear, 1);
  const canvas = renderer.domElement;
  canvas.style.display = 'block';
  container.appendChild(canvas);
  const size = { w: 1, h: 1 };
  return {
    renderer, canvas, size,
    resize(w: number, h: number) {
      size.w = Math.max(1, Math.floor(w)); size.h = Math.max(1, Math.floor(h));
      renderer.setSize(size.w, size.h, true);
    },
    dispose() {
      renderer.dispose();
      renderer.forceContextLoss(); // przeglądarki limitują liczbę kontekstów WebGL — zwalniamy go przy każdym przełączeniu widoku
      canvas.remove();
    },
  };
}

/** Rekurencyjne zwolnienie geometrii, materiałów i tekstur sceny. */
export function disposeScene(root: THREE.Object3D): void {
  root.traverse((o) => {
    const m = o as THREE.Mesh;
    m.geometry?.dispose?.();
    const mats = Array.isArray(m.material) ? m.material : m.material ? [m.material] : [];
    for (const mat of mats) {
      for (const v of Object.values(mat as unknown as Record<string, unknown>)) if (v instanceof THREE.Texture) v.dispose();
      const u = (mat as THREE.ShaderMaterial).uniforms;
      if (u) for (const x of Object.values(u)) if (x.value instanceof THREE.Texture) x.value.dispose();
      mat.dispose();
    }
  });
}

/** Tekstura okrągłej poświaty (gradient radialny) do sprite'ów błysku i cząstek. */
export function glowTexture(stops: Array<[number, string]>, size = 128): THREE.CanvasTexture {
  const c = document.createElement('canvas');
  c.width = c.height = size;
  const g = c.getContext('2d')!;
  const grad = g.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2);
  for (const [o, col] of stops) grad.addColorStop(o, col);
  g.fillStyle = grad;
  g.fillRect(0, 0, size, size);
  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.NoColorSpace;
  return tex;
}

/** lat/lon [°] → wektor jednostkowy w układzie sfery Three.js (zgodny z UV SphereGeometry i teksturą equirect). */
export function latLonToVec3(lat: number, lon: number, r = 1): THREE.Vector3 {
  const φ = (lat * Math.PI) / 180, λ = (lon * Math.PI) / 180;
  return new THREE.Vector3(r * Math.cos(φ) * Math.cos(λ), r * Math.sin(φ), -r * Math.cos(φ) * Math.sin(λ));
}

export function vec3ToLatLon(v: THREE.Vector3): { lat: number; lon: number } {
  const n = v.clone().normalize();
  return { lat: (Math.asin(Math.max(-1, Math.min(1, n.y))) * 180) / Math.PI, lon: (Math.atan2(-n.z, n.x) * 180) / Math.PI };
}

/** Kolor CSS (#rrggbb) → THREE.Color w wartościach surowych (bez konwersji przestrzeni barw). */
export function rawColor(css: string): THREE.Color {
  const c = new THREE.Color();
  c.setStyle(css, THREE.NoColorSpace);
  return c;
}
