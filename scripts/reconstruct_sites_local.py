"""Paleowspółrzędne krateru i stanowisk K-Pg w modelu płyt PALEOMAP (Scotese 2016), lokalnie przez pyGPlates.

Ten sam model płyt i ten sam wiek rekonstrukcji co mapa PaleoDEM nr 16 (paleo.paleodem_plate_model_age),
więc punkty i raster leżą w jednym układzie współrzędnych. Wynik: research/sites.json.
"""
import json
from pathlib import Path

import pygplates

ROOT = Path(__file__).resolve().parent.parent
MODEL_DIR = ROOT / "data/raw/paleodem/paleomap_plate_model"


def param(params: list[dict], pid: str) -> float:
    v = next((p["value"] for p in params if p["id"] == pid), None)
    if not isinstance(v, (int, float)):
        raise SystemExit(f"missing numeric parameter {pid}")
    return float(v)


def main() -> None:
    params = json.loads((ROOT / "research/parameters.json").read_text(encoding="utf-8"))["parameters"]
    time_ma = param(params, "paleo.paleodem_plate_model_age")
    sites = json.loads((ROOT / "research/sites.input.json").read_text(encoding="utf-8"))["sites"]
    crater = {"id": "chicxulub", "name": "Chicxulub (środek krateru)", "lat": param(params, "site.lat"),
              "lon": param(params, "site.lon"), "observations": []}

    rotation_model = pygplates.RotationModel(str(MODEL_DIR / "PALEOMAP_PlateModel.rot"))
    polygons = pygplates.FeatureCollection(str(MODEL_DIR / "PALEOMAP_PlatePolygons.gpml"))
    partitioner = pygplates.PlatePartitioner(polygons, rotation_model)  # wielokąty w położeniu dzisiejszym (t = 0)

    out = []
    for s in [crater, *sites]:
        point = pygplates.PointOnSphere(s["lat"], s["lon"])
        poly = partitioner.partition_point(point)
        if poly is None:
            raise SystemExit(f"{s['id']}: point not inside any PALEOMAP plate polygon")
        plate_id = poly.get_feature().get_reconstruction_plate_id()
        paleo_lat, paleo_lon = (rotation_model.get_rotation(time_ma, plate_id) * point).to_lat_lon()
        out.append({**s, "plateId": plate_id, "paleoLat": round(paleo_lat, 3), "paleoLon": round(paleo_lon, 3)})
        print(f"{s['id']:16s} plate {plate_id:4d}  ({s['lat']:8.3f}, {s['lon']:9.3f}) -> ({paleo_lat:7.2f}, {paleo_lon:8.2f})")

    result = {"model": "PALEOMAP Global Plate Model (Scotese 2016), PALEOMAP_PlateModel.rot + PALEOMAP_PlatePolygons.gpml",
              "software": f"pyGPlates {pygplates.__version__}", "timeMa": time_ma, "sites": out}
    (ROOT / "research/sites.json").write_text(json.dumps(result, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    print(f"written research/sites.json ({len(out)} points, {time_ma} Ma)")


if __name__ == "__main__":
    main()
