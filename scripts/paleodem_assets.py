"""PaleoDEM mapa 16 (granica K/T, 0,1°) → zasoby aplikacji:
- public/data/paleodem_color_4096.jpg — tekstura równoprostokątna 4096×2048 (hipsometria + cieniowanie rzeźby lądu),
- public/data/paleodem_elev_1440x720.i16 — wysokość [m], Int16 LE, siatka 0,25°, wiersze N→S, lon −180…180.
Kontrola: udział lądu (ważony powierzchnią) zgodny z paleo.paleodem_land_fraction w granicach ±2 p.p.
"""
import json
from pathlib import Path

import numpy as np
from netCDF4 import Dataset
from PIL import Image
from scipy.ndimage import map_coordinates

ROOT = Path(__file__).resolve().parent.parent
SRC = ROOT / "data/raw/paleodem/Map16_PALEOMAP_6min_KT_Boundary_65Ma.nc"
OUT = ROOT / "public/data"

OCEAN = [(-6500, (8, 24, 46)), (-4500, (14, 40, 72)), (-3000, (24, 62, 102)), (-1000, (40, 92, 138)),
         (-200, (70, 130, 172)), (0, (118, 172, 200))]
LAND = [(0, (92, 116, 76)), (300, (118, 132, 84)), (800, (152, 146, 98)), (1500, (150, 122, 86)),
        (2500, (128, 100, 78)), (4000, (214, 206, 196))]


def ramp(z: np.ndarray, stops) -> np.ndarray:
    zs = np.array([s[0] for s in stops], dtype=float)
    out = np.zeros(z.shape + (3,), dtype=float)
    for c in range(3):
        out[..., c] = np.interp(z, zs, [s[1][c] for s in stops])
    return out


def load_grid():
    with Dataset(SRC) as d:
        lat = np.array(d.variables["latitude"][:], dtype=float)
        lon = np.array(d.variables["longitude"][:], dtype=float)
        z = np.array(d.variables["z"][:], dtype=float)
    if lat[0] < lat[-1]:          # do kolejności N→S
        lat, z = lat[::-1], z[::-1, :]
    if np.isclose(lon[-1] - lon[0], 360.0):
        lon, z = lon[:-1], z[:, :-1]  # usuń zduplikowany południk 180°
    return lat, lon, z


def sample(lat, lon, z, out_lat, out_lon):
    """Próbkowanie biliniowe siatki (lat malejąco, lon rosnąco) w punktach (out_lat × out_lon)."""
    LAT, LON = np.meshgrid(out_lat, out_lon, indexing="ij")
    rows = (lat[0] - LAT) / (lat[0] - lat[-1]) * (len(lat) - 1)
    cols = ((LON - lon[0]) % 360.0) / 360.0 * len(lon)
    return map_coordinates(z, [rows, cols], order=1, mode="wrap")


def hillshade(z, lat_deg, cell_deg, az=315.0, alt=45.0, exag=6.0):
    dy = cell_deg * 111_320.0
    dx = dy * np.cos(np.radians(lat_deg))[:, None]
    gy, gx = np.gradient(z * exag)
    gx, gy = gx / np.maximum(dx, 1.0), gy / dy
    slope = np.arctan(np.hypot(gx, gy))
    aspect = np.arctan2(-gx, gy)
    zen, azr = np.radians(90 - alt), np.radians(az)
    return np.clip(np.cos(zen) * np.cos(slope) + np.sin(zen) * np.sin(slope) * np.cos(azr - aspect), 0, 1)


def main() -> None:
    OUT.mkdir(parents=True, exist_ok=True)
    lat, lon, z = load_grid()
    print(f"PaleoDEM: {z.shape}, lat {lat[0]}…{lat[-1]}, lon {lon[0]}…{lon[-1]}, z {z.min():.0f}…{z.max():.0f} m")

    # tekstura 4096×2048
    W, H = 4096, 2048
    t_lat = 90 - (np.arange(H) + 0.5) * 180 / H
    t_lon = -180 + (np.arange(W) + 0.5) * 360 / W
    zt = sample(lat, lon, z, t_lat, t_lon)
    land = zt >= 0
    rgb = np.where(land[..., None], ramp(zt, LAND), ramp(zt, OCEAN))
    hs = hillshade(zt, t_lat, 360 / W)
    shade = np.where(land, 0.55 + 0.6 * hs, 0.9 + 0.12 * hs)
    rgb = np.clip(rgb * shade[..., None], 0, 255).astype(np.uint8)
    Image.fromarray(rgb, "RGB").save(OUT / "paleodem_color_4096.jpg", quality=90, optimize=True)

    # siatka wysokości 0,25°
    gw, gh = 1440, 720
    g_lat = 90 - (np.arange(gh) + 0.5) * 0.25
    g_lon = -180 + (np.arange(gw) + 0.5) * 0.25
    zg = sample(lat, lon, z, g_lat, g_lon)
    np.clip(np.round(zg), -32768, 32767).astype("<i2").tofile(OUT / "paleodem_elev_1440x720.i16")

    # kontrola: udział lądu ważony powierzchnią
    w = np.cos(np.radians(g_lat))[:, None] * np.ones((1, gw))
    land_frac = float((w * (zg >= 0)).sum() / w.sum())
    params = json.loads((ROOT / "research/parameters.json").read_text(encoding="utf-8"))["parameters"]
    ref = next(p["value"] for p in params if p["id"] == "paleo.paleodem_land_fraction")
    print(f"udział lądu (0,25°): {land_frac:.4f}; rejestr (1°): {ref}")
    if abs(land_frac - ref) > 0.02:
        raise SystemExit("udział lądu poza tolerancją ±2 p.p. — sprawdzić orientację siatki")
    for f in ["paleodem_color_4096.jpg", "paleodem_elev_1440x720.i16"]:
        print(f"{f}: {(OUT / f).stat().st_size / 1e6:.2f} MB")


if __name__ == "__main__":
    main()
