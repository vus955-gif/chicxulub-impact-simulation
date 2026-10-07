"""Czasy pierwszych wejść fal P i S (model ak135, źródło na powierzchni) co 1° odległości kątowej."""
import json
from pathlib import Path

import numpy as np
from obspy.taup import TauPyModel

PHASES = {
    "P": ["P", "Pdiff", "PKP", "PKIKP", "PKiKP"],
    "S": ["S", "Sdiff", "SKS", "SKIKS"],
}


def first_arrivals(model: TauPyModel, phases: list[str]) -> list[float | None]:
    out: list[float | None] = []
    for d in np.arange(0.0, 180.0 + 1e-9, 1.0):
        arrivals = model.get_travel_times(source_depth_in_km=0.0, distance_in_degree=float(d), phase_list=phases)
        out.append(round(min(a.time for a in arrivals), 2) if arrivals else None)
    return out


def main() -> None:
    model = TauPyModel(model="ak135")
    result = {
        "model": "ak135",
        "reference": "Kennett, Engdahl & Buland 1995, Geophys. J. Int.; computed with ObsPy TauP",
        "sourceDepthKm": 0.0,
        "stepDeg": 1.0,
        "firstArrival_s": {label: first_arrivals(model, ph) for label, ph in PHASES.items()},
    }
    out = Path("data/derived/ak135-first-arrivals.json")
    out.write_text(json.dumps(result, indent=1), encoding="utf-8")
    p90 = result["firstArrival_s"]["P"][90]
    print(f"written {out}; P first arrival at 90 deg = {p90} s")


if __name__ == "__main__":
    main()
