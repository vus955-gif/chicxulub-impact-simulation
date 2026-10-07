"""Dzisiejsze linie brzegowe (Natural Earth 1:50m, domena publiczna) obrócone do wieku mapy PaleoDEM w modelu PALEOMAP.

Służą WYŁĄCZNIE do orientacji („gdzie dziś jest Floryda") — nie są paleolinią brzegową. Linie dzielone na granicach płyt
(pyGPlates partition_into_plates), następnie rekonstruowane tym samym modelem i wiekiem co stanowiska (sites.json).
Wejście: data/raw/naturalearth/ne_50m_coastline/ne_50m_coastline.shp  ·  wynik: public/data/coastlines_paleo.json
"""
import json
import math
from pathlib import Path

import pygplates

ROOT = Path(__file__).resolve().parent.parent
MODEL_DIR = ROOT / "data/raw/paleodem/paleomap_plate_model"
SHP = ROOT / "data/raw/naturalearth/ne_50m_coastline/ne_50m_coastline.shp"
OUT = ROOT / "public/data/coastlines_paleo.json"
MIN_STEP_DEG = 0.12  # uproszczenie: pomijamy wierzchołki bliżej niż ~13 km od poprzedniego


def param(params: list[dict], pid: str) -> float:
    v = next((p["value"] for p in params if p["id"] == pid), None)
    if not isinstance(v, (int, float)):
        raise SystemExit(f"missing numeric parameter {pid}")
    return float(v)


def simplify(pts: list[tuple[float, float]]) -> list[tuple[float, float]]:
    if len(pts) < 3:
        return pts
    out = [pts[0]]
    for lat, lon in pts[1:-1]:
        plat, plon = out[-1]
        dlon = (lon - plon + 540) % 360 - 180
        if math.hypot(lat - plat, dlon * math.cos(math.radians(lat))) >= MIN_STEP_DEG:
            out.append((lat, lon))
    out.append(pts[-1])
    return out


def main() -> None:
    params = json.loads((ROOT / "research/parameters.json").read_text(encoding="utf-8"))["parameters"]
    time_ma = param(params, "paleo.paleodem_plate_model_age")
    rotation_model = pygplates.RotationModel(str(MODEL_DIR / "PALEOMAP_PlateModel.rot"))
    polygons = pygplates.FeatureCollection(str(MODEL_DIR / "PALEOMAP_PlatePolygons.gpml"))
    coast = pygplates.FeatureCollection(str(SHP))
    parts = pygplates.partition_into_plates(
        polygons, rotation_model, coast,
        partition_method=pygplates.PartitionMethod.split_into_plates,
        properties_to_copy=[pygplates.PartitionProperty.reconstruction_plate_id],
    )
    recon: list = []
    pygplates.reconstruct(parts, rotation_model, recon, time_ma)
    lines = []
    n_in = n_out = 0
    for rfg in recon:
        geom = rfg.get_reconstructed_geometry()
        pts = [p.to_lat_lon() for p in geom.get_points()]
        n_in += len(pts)
        pts = simplify(pts)
        if len(pts) < 2:
            continue
        n_out += len(pts)
        lines.append([v for lat, lon in pts for v in (round(lon, 2), round(lat, 2))])
    result = {
        "note": "Dzisiejsze linie brzegowe obrócone do wieku mapy — tylko orientacja, nie paleolinia brzegowa.",
        "source": "Natural Earth 1:50m coastline v4.1.0 (public domain), naciscdn.org; SHA-256 zip 640f805509b822f57f4840a2e18d9ff2412cf1cf6976124701c2789436166fde",
        "model": "PALEOMAP Global Plate Model (Scotese 2016)", "software": f"pyGPlates {pygplates.__version__}",
        "timeMa": time_ma, "format": "lines: [lon, lat, lon, lat, …]", "lines": lines,
    }
    OUT.write_text(json.dumps(result, ensure_ascii=False, separators=(",", ":")) + "\n", encoding="utf-8")
    print(f"{len(coast)} features -> {len(recon)} reconstructed parts, {n_in} -> {n_out} vertices, {OUT.stat().st_size / 1024:.0f} KB, {time_ma} Ma")


if __name__ == "__main__":
    main()
