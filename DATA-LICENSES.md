# Data sources and licences

The source code is MIT-licensed (see `LICENSE`). The files in `public/data/` are **derived** from the datasets below, which keep their own licences. Raw downloads are not part of this repository (`data/raw/` is git-ignored); the scripts in `scripts/` regenerate the derived files from them.

| Derived file(s) | Source dataset | Licence | Attribution |
|---|---|---|---|
| `paleodem_color_4096.jpg`, `paleodem_elev_1440x720.i16` | PaleoDEM, Map 16 (K/T boundary), Scotese & Wright (2018) — [doi:10.5281/zenodo.5460860](https://doi.org/10.5281/zenodo.5460860) | CC BY 4.0 | Scotese, C.R. & Wright, N. (2018). *PALEOMAP Paleodigital Elevation Models (PaleoDEMS) for the Phanerozoic.* PALEOMAP Project. |
| `tsunami_amp_1440x720.f32` (amplitudes), validation of `tsunami_tt_1440x720.f32` | Range et al. (2022) model output (MOST maximum amplitudes) — Harvard Dataverse [doi:10.7910/DVN/GWOFIO](https://doi.org/10.7910/DVN/GWOFIO) | CC0 | Range, M.M. et al. (2022). *The Chicxulub impact produced a powerful global tsunami.* AGU Advances 3, e2021AV000627. |
| `coastlines_paleo.json` | Natural Earth 1:50m coastline v4.1.0 — [naturalearthdata.com](https://www.naturalearthdata.com/) | Public domain | Made with Natural Earth. |
| `sites.json`, crater palaeo-coordinates, rotated coastlines | PALEOMAP Global Plate Model (Scotese 2016), PaleoAtlas for GPlates — [earthbyte.org](http://www.earthbyte.org/paleomap-paleoatlas-for-gplates/) | used offline only; the model files are **not** redistributed | Scotese, C.R. (2016). PALEOMAP PaleoAtlas for GPlates and the PaleoData Plotter Program. Reconstructions computed with pyGPlates 1.0.0 (GPL v2). |
| `ak135.json` | ak135 travel-time tables computed with ObsPy TauP | ObsPy: LGPL v3 | Kennett, B.L.N., Engdahl, E.R. & Buland, R. (1995). *Constraints on seismic velocities in the Earth from traveltimes.* GJI 122, 108–124. |
| `registry.json` | 500 parameters compiled from 168 published sources (peer-reviewed papers with DOIs verified via Crossref/DataCite, plus datasets and software) | facts and numerical values from the cited works; short quotations in the notes are attributed | Full bibliography inside the app (click any value) and in `research/raport-chicxulub.html`. |

All other files (code, registry structure, translations, the research report) are original work of this project.
