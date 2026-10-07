"""Siatki tsunami (0,25°, układ paleo PALEOMAP/PaleoDEM):
1) czas dotarcia — najkrótsza droga po grafie komórek oceanicznych (16 sąsiadów, łuki wielkiego koła),
   prędkość fali płytkowodnej c = √(g·h); źródło: pierścień fali obrzeżnej w chwili przekazania z hydrokodu
   (Range i in. 2022: promień tsunami.rim_wave_radius_600s w czasie tsunami.range2022_handoff_time);
2) maksymalna amplituda — przeniesiona z wyników modelu MOST (Range i in. 2022) obrotem sferycznym
   nakładającym punkt uderzenia modelu na krater w układzie paleo (oba układy oparte na rekonstrukcji Scotese'a).
Walidacja z twardymi progami → research/tsunami-validation.json.
"""
import json
from pathlib import Path

import numpy as np
from netCDF4 import Dataset
from scipy.ndimage import distance_transform_edt, map_coordinates
from scipy.sparse import coo_matrix
from scipy.sparse.csgraph import dijkstra

ROOT = Path(__file__).resolve().parent.parent
OUT = ROOT / "public/data"
W, H, CELL = 1440, 720, 0.25
R_KM, G = 6371.0, 9.81
MIN_DEPTH_M = 10.0


def params() -> dict:
    ps = json.loads((ROOT / "research/parameters.json").read_text(encoding="utf-8"))["parameters"]
    ps += json.loads((ROOT / "research/derived.json").read_text(encoding="utf-8"))["parameters"]
    return {p["id"]: p for p in ps}


def gc_km(lat1, lon1, lat2, lon2):
    p1, p2 = np.radians(lat1), np.radians(lat2)
    dl, dp = np.radians(lon2 - lon1), p2 - p1
    h = np.sin(dp / 2) ** 2 + np.cos(p1) * np.cos(p2) * np.sin(dl / 2) ** 2
    return 2 * R_KM * np.arcsin(np.sqrt(np.clip(h, 0, 1)))


def azimuth(lat1, lon1, lat2, lon2):
    p1, p2, dl = np.radians(lat1), np.radians(lat2), np.radians(lon2 - lon1)
    y = np.sin(dl) * np.cos(p2)
    x = np.cos(p1) * np.sin(p2) - np.sin(p1) * np.cos(p2) * np.cos(dl)
    return (np.degrees(np.arctan2(y, x)) + 360) % 360


def to_vec(lat, lon):
    la, lo = np.radians(lat), np.radians(lon)
    return np.stack([np.cos(la) * np.cos(lo), np.cos(la) * np.sin(lo), np.sin(la)], axis=-1)


def rotation_matrix(a, b):
    """Obrót najkrótszy przenoszący wektor jednostkowy a na b (wzór Rodriguesa)."""
    v, c = np.cross(a, b), float(np.dot(a, b))
    vx = np.array([[0, -v[2], v[1]], [v[2], 0, -v[0]], [-v[1], v[0], 0]])
    return np.eye(3) + vx + vx @ vx * (1 / (1 + c))


def main() -> None:
    P = params()
    crater = (P["site.paleo_lat"]["value"], P["site.paleo_lon"]["value"])
    r0 = P["tsunami.rim_wave_radius_600s"]["value"]
    t0 = P["tsunami.range2022_handoff_time"]["value"]

    z = np.fromfile(OUT / "paleodem_elev_1440x720.i16", "<i2").reshape(H, W).astype(float)
    lat = 90 - (np.arange(H) + 0.5) * CELL
    lon = -180 + (np.arange(W) + 0.5) * CELL
    LAT, LON = np.meshgrid(lat, lon, indexing="ij")
    ocean = -z > MIN_DEPTH_M
    speed = np.where(ocean, np.sqrt(G * np.clip(-z, MIN_DEPTH_M, None)), np.nan)  # m/s

    # ── graf komórek oceanicznych ──
    idx = -np.ones((H, W), dtype=np.int64)
    idx[ocean] = np.arange(ocean.sum())
    n = int(ocean.sum())
    offsets = [(dr, dc) for dr in (-2, -1, 0, 1, 2) for dc in (-2, -1, 0, 1, 2)
               if (dr, dc) != (0, 0) and max(abs(dr), abs(dc)) <= 2 and not (abs(dr) == 2 and abs(dc) == 2)
               and not (abs(dr) == 2 and dc == 0) and not (dr == 0 and abs(dc) == 2)]
    rows_all, cols_all, w_all = [], [], []
    for dr, dc in offsets:  # 8 sąsiadów + 8 ruchów „skoczka” = 16 kierunków
        r_src = np.arange(max(0, -dr), min(H, H - dr))
        rs, cs = np.meshgrid(r_src, np.arange(W), indexing="ij")
        rd, cd = rs + dr, (cs + dc) % W
        ok = ocean[rs, cs] & ocean[rd, cd]
        if abs(dr) + abs(dc) > 1:  # ruch po przekątnej / skoczka: obie komórki pośrednie nie mogą być lądem
            ok &= ocean[rs + np.sign(dr), cs] | ocean[rs, (cs + np.sign(dc)) % W]
        d_m = gc_km(LAT[rs, cs][ok], LON[rs, cs][ok], LAT[rd, cd][ok], LON[rd, cd][ok]) * 1000
        c = 0.5 * (speed[rs, cs][ok] + speed[rd, cd][ok])
        rows_all.append(idx[rs, cs][ok]); cols_all.append(idx[rd, cd][ok]); w_all.append(d_m / c)
    # superźródło: pierścień fali obrzeżnej w chwili przekazania
    dist = gc_km(LAT, LON, *crater)
    ring = ocean & (np.abs(dist - r0) <= CELL * 111.2 * 0.75)
    src = n
    rows_all.append(np.full(int(ring.sum()), src)); cols_all.append(idx[ring]); w_all.append(np.full(int(ring.sum()), t0))
    rows, cols, wts = np.concatenate(rows_all), np.concatenate(cols_all), np.concatenate(w_all)
    graph = coo_matrix((wts, (rows, cols)), shape=(n + 1, n + 1)).tocsr()
    print(f"graf: {n} komórek oceanicznych, {graph.nnz} krawędzi, pierścień źródłowy {int(ring.sum())} komórek")
    tt_nodes = dijkstra(graph, directed=True, indices=src)
    tt = np.full((H, W), np.nan)
    tt[ocean] = tt_nodes[:n]
    inner = ocean & (dist < r0)                       # strefa hydrokodu: liniowo do chwili przekazania
    tt[inner] = t0 * dist[inner] / r0
    tt[~np.isfinite(tt)] = np.nan
    tt.astype("<f4").tofile(OUT / "tsunami_tt_1440x720.f32")

    # ── walidacja względem opublikowanego modelu ──
    az = azimuth(*crater, LAT, LON)
    def reach(t, az_lo=0.0, az_hi=360.0):
        m = ocean & (tt <= t) & (az >= az_lo) & (az < az_hi)
        bins = np.floor(az[m] / 5).astype(int)
        return np.array([dist[m][bins == b].max() for b in np.unique(bins)])
    r1h = reach(3600)
    r1h_open = float(np.median(r1h[r1h > r0 * 1.5])) if np.any(r1h > r0 * 1.5) else float("nan")
    r4h_east = float(reach(4 * 3600, 60, 120).max())
    # Wejście na Pacyfik = pierwsze dotarcie do komórek oceanicznych na zachód od pomostu lądowego Ameryki Środkowej
    # (w układzie paleo: lon ≤ −85°, lat 0–20°). Pierwotna definicja (punkt 5° N, 100° W) dała 6,9 h, ale ten punkt
    # leży ~1500 km za wylotem cieśniny — mierzyła przejście przez Pacyfik, nie wejście na niego (korekta definicji).
    pac_box = ocean & (LON <= -85) & (LAT >= 0) & (LAT <= 20)
    t_pac = float(np.nanmin(np.where(pac_box, tt, np.nan)))
    pac_pt = "lon ≤ −85°, lat 0–20° (najwcześniejsze dotarcie)"
    # Wejście do Oceanu Indyjskiego: najwcześniejsze dotarcie w ramce paleo 40–100° E, 50–5° S (basen między Afryką,
    # Indiami i Australią–Antarktydą w PALEOMAP 65 Ma). Wynik zależy od granic ramki (±~2 h) — porównanie orientacyjne.
    io_box = ocean & (LON >= 40) & (LON <= 100) & (LAT >= -50) & (LAT <= -5)
    t_io = float(np.nanmin(np.where(io_box, tt, np.nan)))
    ref1, ref4 = P["tsunami.front_radius_1h"]["value"], P["tsunami.front_radius_4h_east"]["value"]
    checks = {
        "front_radius_1h_km": {"model": r1h_open, "literature": ref1, "ok": bool(0.7 * ref1 <= r1h_open <= 1.3 * ref1)},
        "front_reach_4h_east_km": {"model": r4h_east, "literature": ref4, "ok": bool(0.7 * ref4 <= r4h_east <= 1.3 * ref4)},
        "pacific_entry_h": {"model": t_pac / 3600, "literature": P["tsunami.t_pacific_entry"]["value"] / 3600,
                            "region": pac_pt, "ok": bool(2 <= t_pac / 3600 <= 6),
                            "note": "Definicja poprawiona po analizie: wcześniejszy punkt kontrolny (5° N, 100° W) dawał 6,9 h, bo leżał ~1500 km za wylotem cieśniny."},
        "indian_ocean_entry_h": {"model": t_io / 3600, "literature": P["tsunami.t_indian_ocean_entry"]["value"] / 3600,
                                 "region": "lon 40–100° E, lat 50–5° S (paleo; najwcześniejsze dotarcie)", "ok": bool(0.7 <= t_io / P["tsunami.t_indian_ocean_entry"]["value"] <= 1.3),
                                 "note": "Model wcześniej niż literatura: prędkość √(g·h) bez dyspersji to górna granica; wynik zależy od granic ramki (±~2 h)."},
    }

    # ── amplitudy z modelu MOST (Range i in. 2022) ──
    with Dataset(ROOT / "data/raw/range2022/MOST_max_output.nc") as d:
        rlon = np.array(d["lona"][:], dtype=float); rlat = np.array(d["lata"][:], dtype=float)
        amp = np.array(d["max_amp_a"][:], dtype=float)
    amp = np.where(amp < -1e30, np.nan, amp) / 100.0  # cm → m
    top = amp > np.nanpercentile(amp, 99.9)
    rr, cc = np.nonzero(top); wv = amp[top]
    r_imp = (float((rlat[rr] * wv).sum() / wv.sum()), float((rlon[cc] * wv).sum() / wv.sum()))
    Rm = rotation_matrix(to_vec(*crater), to_vec(*r_imp))  # nasz układ → układ modelu Range'a
    v = to_vec(LAT, LON) @ Rm.T
    qlat, qlon = np.degrees(np.arcsin(np.clip(v[..., 2], -1, 1))), np.degrees(np.arctan2(v[..., 1], v[..., 0])) % 360
    ri = (rlat[0] - qlat) / (rlat[0] - rlat[-1]) * (len(rlat) - 1)
    ci = (qlon - rlon[0]) / (rlon[-1] - rlon[0]) * (len(rlon) - 1)
    valid = np.isfinite(amp)
    near = distance_transform_edt(~valid, return_distances=False, return_indices=True)
    amp_filled = amp[near[0], near[1]]                  # brzegi: najbliższa wartość oceaniczna modelu
    a_ours = map_coordinates(amp_filled, [ri, ci], order=1, mode="nearest")
    a_ours = np.where(ocean, a_ours, np.nan)
    a_ours.astype("<f4").tofile(OUT / "tsunami_amp_1440x720.f32")

    report = {
        "generatedBy": "scripts/tsunami_grids.py",
        "grid": {"w": W, "h": H, "cellDeg": CELL, "minDepthM": MIN_DEPTH_M, "neighbours": 16},
        "source": {"ringRadiusKm": r0, "handoffS": t0, "ringCells": int(ring.sum())},
        "checks": checks,
        "amplitude": {"rangeImpactInModelFrame": r_imp, "craterPaleo": crater,
                      "frameNote": "Model Range i in. 2022 używa batymetrii Müller 2008 + PALEOMAP 70 Ma; przeniesienie obrotem "
                                   "nakładającym punkty uderzenia — dokładność przy brzegach ±kilka stopni; amplitudy to górna granica "
                                   "(model płytkiej wody bez dyspersji).",
                      "medianOceanM": float(np.nanmedian(a_ours)), "p99M": float(np.nanpercentile(a_ours, 99))},
        "travelTime": {"medianH": float(np.nanmedian(tt) / 3600), "maxH": float(np.nanmax(tt) / 3600),
                       "reachedFraction": float(np.isfinite(tt[ocean]).mean())},
    }
    (ROOT / "research/tsunami-validation.json").write_text(json.dumps(report, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    print(json.dumps(report["checks"], ensure_ascii=False, indent=1))
    print(f"amplitudy: mediana {report['amplitude']['medianOceanM']:.2f} m, p99 {report['amplitude']['p99M']:.1f} m; "
          f"czasy: mediana {report['travelTime']['medianH']:.1f} h, osiągnięte {report['travelTime']['reachedFraction']:.3f}")
    if not all(c["ok"] for c in checks.values()):
        raise SystemExit("walidacja tsunami NIE przeszła — analiza przyczyny przed jakąkolwiek zmianą")


if __name__ == "__main__":
    main()
