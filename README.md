# Chicxulub — the first 24 hours

[![CI](https://github.com/vus955-gif/chicxulub-impact-simulation/actions/workflows/ci.yml/badge.svg)](https://github.com/vus955-gif/chicxulub-impact-simulation/actions/workflows/ci.yml) [![License: MIT](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)

**▶ [Run it in your browser](https://vus955-gif.github.io/chicxulub-impact-simulation/)** — no installation; a desktop browser with WebGL is recommended. · **[Polski → README.pl.md](README.pl.md)**

An interactive, source-referenced simulation of the first day after the Chicxulub asteroid impact, 66 million years ago — from the asteroid's flight through the atmosphere to T+24 h, on the palaeogeography of the end of the Cretaceous.

It is meant as an educational tool that does not hide uncertainty: every number on screen comes from a registry of published values or from a model computed from them, and you can click it to see the method, the literature range and the references (with DOIs).

| 2D palaeomap | 3D globe |
|---|---|
| ![2D map with wave fronts, biosphere zones and the probe](docs/screenshots/map-2d.jpg) | ![3D globe with ejecta trajectories and re-entry flashes](docs/screenshots/globe-3d.jpg) |
| **3D close-up of the impact site** | **Crustal cross-section** |
| ![Close-up: transient crater, ejecta curtain and vapour plume](docs/screenshots/closeup-3d.jpg) | ![Cross-section: central uplift and the M0077A core](docs/screenshots/cross-section.jpg) |

## What you can see

- **Four synchronised views on one clock** — a 2D palaeomap (Equal Earth), a 3D globe, a 3D close-up of the impact site at true scale, and an animated SW–NE crustal cross-section.
- **Seismic waves, the atmospheric pressure (Lamb) wave, the ejecta front, the infrared pulse, fires, tsunami, darkening of the sky, biosphere damage zones** — each as a labelled layer with a legend; hover a line or a legend entry to highlight it.
- **Ejecta on real trajectories** — Kepler orbits in an inertial frame with the Earth rotating underneath (Cretaceous day length), and a flash wherever material re-enters the atmosphere.
- **Crater formation** — transient cavity, central uplift, peak ring and final crater, anchored to hydrocode keyframes and the IODP-ICDP Expedition 364 drill core (M0077A), whose day-one deposits grow in the cross-section.
- **A probe** — click anywhere (or pick one of 12 K-Pg boundary sites) to get the local chronology: what arrives and when, intensities, effects on the biosphere, and for key sites a **model-vs-literature** comparison (e.g. Tanis: P, S and Rayleigh waves arrive within 4–7% of the published times).
- **A guided tour** — 12 steps from atmospheric entry to the epilogue.
- **Contested science stays contested** — switch between the thermal-pulse scenarios of Morgan et al. 2013, Goldin & Melosh 2009 and Melosh et al. 1990, and between regional and global fires.
- **Polish and English** interface (toggle in the top-right corner).

### How certain is each number?

| Mark | Meaning |
|---|---|
| ● | fact — measurement or observation |
| ◐ | extrapolation — model or scaling law based on known mechanisms |
| ○ | speculation — hypothesis without direct support |
| ⚑ | contested — competing interpretations in the literature |
| △ | project predictive model — fills a gap in the literature; assumptions are listed |

Purely visual elements (the size of the bolide and of the flash, the ejecta curtain) are marked as symbols; their timing still comes from the registry.

## Quick start

To just try it, open the **[live demo](https://vus955-gif.github.io/chicxulub-impact-simulation/)**. To run it locally you need **Node.js ≥ 20.19** with npm.

```bash
git clone https://github.com/vus955-gif/chicxulub-impact-simulation.git
cd chicxulub-impact-simulation
npm install
npm run dev
```

Open <http://127.0.0.1:5173>. All data the app needs is already in `public/data/` — no downloads required.

| Command | What it does |
|---|---|
| `npm run dev` | development server with hot reload |
| `npm run build` / `npm run preview` | production build in `dist/` / serve it locally |
| `npm test` | 200+ tests: physics vs. literature, registry integrity, model behaviour |
| `npm run check`, `npm run typecheck` | Svelte and TypeScript checks |
| `npm run registry` | rebuild the parameter registry from `research/` (validates every source and translation) |

### Controls

- **Space** — play / pause · **← / →** — previous / next event · **Shift + ← / →** — one decade of time
- Drag the timeline to scrub; playback is logarithmic by default (equal screen time per decade), real time is available.
- Click the map or globe to place the probe; click any value to open its sources.
- The state (time, view, layers, probe, language) is kept in the URL — you can share a link to a specific moment.

## How it is built

```
research/          parameter registry (JSON), research notes, research report (Polish, HTML)
  parameters.json  values compiled from the literature, each with certainty, method, locator and sources
  sources.json     168 sources; DOIs verified against Crossref / DataCite
  synthesis.json   documented decisions: what was dropped, chosen, patched or added, and why
  i18n-en.json     English texts for the registry and the sites
src/model/         pure physics, no UI — tested in Node (EIEP, arrivals, fronts, ejecta orbits,
                   crater kinematics, biosphere zones, predictive models)
src/app/           Svelte 5 interface: panels, timeline, probe, legend, guide, i18n
src/render/        2D map (canvas), 3D globe and close-up (Three.js, custom shaders), cross-section (SVG)
scripts/           registry pipeline (TypeScript) and data preprocessing (Python)
public/data/       derived data used by the app (registry, palaeo-DEM texture, tsunami grids, …)
tests/             Vitest test suites
```

Key methods:

- **Impact effects** — the Earth Impact Effects Program equations (Collins, Melosh & Marcus 2005), implemented in TypeScript and checked against the official calculator.
- **Seismic arrivals** — ak135 travel-time tables (Kennett et al. 1995, computed with ObsPy TauP); surface-wave and Lamb-wave fronts from published group velocities.
- **Tsunami** — arrival times from a √(g·h) eikonal solution on the PaleoDEM palaeobathymetry, validated against the global model of Range et al. 2022; amplitudes from that model's output.
- **Palaeogeography** — PaleoDEM Map 16 (Scotese & Wright 2018); sites, crater and present-day coastlines reconstructed with the PALEOMAP plate model via pyGPlates.
- **Ejecta** — Kepler orbits with Earth rotation; the launch-angle distribution is chosen so that the fastest particles reproduce the published first-arrival times.

The research report `research/raport-chicxulub.html` (in Polish) documents the literature review behind the reference scenario: a 13 km impactor at 20 km/s, 60° from the north-east, ≈ 6 × 10²³ J, forming a ~200 km crater.

## Rebuilding the data (optional)

`public/data/` is committed, so this is only needed if you change the research inputs. You need Python 3.11+ with `numpy`, `scipy`, `netCDF4`, `Pillow`, `pygplates` and `obspy`, and the raw datasets in `data/raw/` (git-ignored):

| Folder | Dataset |
|---|---|
| `data/raw/paleodem/` | PaleoDEM Map 16 netCDF, 6-arc-minute (`Map16_PALEOMAP_6min_KT_Boundary_65Ma.nc`) — Scotese & Wright 2018, [doi:10.5281/zenodo.5460860](https://doi.org/10.5281/zenodo.5460860) |
| `data/raw/paleodem/paleomap_plate_model/` | `PALEOMAP_PlateModel.rot`, `PALEOMAP_PlatePolygons.gpml` — [PALEOMAP PaleoAtlas for GPlates](http://www.earthbyte.org/paleomap-paleoatlas-for-gplates/) |
| `data/raw/range2022/` | `MOST_max_output.nc` — Range et al. 2022 data, [doi:10.7910/DVN/GWOFIO](https://doi.org/10.7910/DVN/GWOFIO) |
| `data/raw/naturalearth/ne_50m_coastline/` | Natural Earth 1:50m coastline — [naturalearthdata.com](https://www.naturalearthdata.com/downloads/50m-physical-vectors/) |

```bash
python scripts/paleodem_assets.py        # palaeo-DEM texture and elevation grid
python scripts/reconstruct_sites_local.py # palaeo-coordinates of the crater and the K-Pg sites
python scripts/tsunami_grids.py           # tsunami arrival times, amplitudes, validation report
python scripts/coastlines_paleo.py        # present-day coastlines rotated to 65 Ma
python scripts/ak135_traveltimes.py       # ak135 first-arrival tables (ObsPy)
npm run registry                          # assemble, derive, validate and export the registry
```

## Limitations

- This is not a hydrocode. Where peer-reviewed results exist (crater keyframes, tsunami, arrival times), the simulation reproduces them; in between it interpolates, and those parts are marked △.
- Far-field air-blast values from EIEP are upper bounds (the scaling overestimates at such energies); the app shows the band between lower and upper bounds.
- The impact direction and angle, the strength of the global thermal pulse and the extent of fires are contested in the literature; the app lets you switch scenarios instead of picking a winner.
- PaleoDEM is coarse near the Yucatán shelf: around the crater a predictive water-depth ramp is used, and the probe warns where the map disagrees with the marine record of a site.

## Credits

- **Concept, scientific direction, requirements and review:** [vus955-gif](https://github.com/vus955-gif)
- **Implementation:** written together with Claude (Anthropic) as an AI pair programmer
- **Data:** see [DATA-LICENSES.md](DATA-LICENSES.md); scientific references are listed in the app (click any value) and in the research report.

Code comments are in Polish; the interface is available in Polish and English.

## License

Code: [MIT](LICENSE). Data in `public/data/` keeps the licences of its sources — see [DATA-LICENSES.md](DATA-LICENSES.md).
