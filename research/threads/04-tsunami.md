# Thread 04 — Chicxulub impact tsunami (T = 0 → T + 24 h)

Scope: how the tsunami was generated, how it propagated, arrival times, open‑ocean heights and flow speeds, energy, geological evidence in and around the Gulf of Mexico (and distal), and the paleobathymetry that controls propagation. Every number carries a source id `[id]`, defined in `04-tsunami.json`. Certainty tags:

- **F** = fact (measured or observed)
- **X** = extrapolation (model or scaling)
- **S** = speculation
- **C** = contested

"Model" means a numerical result; "observed" means a measurement in rocks, cores or seismic data.

---

## 0. Bottom line

1. **Only one peer-reviewed global simulation exists**: Range et al. 2022 [range2022]. It has two stages:
   - **Stage 1:** the iSALE‑2D hydrocode for the first 600 s. Vertical impact, 14 km impactor at 12 km/s, constant 1 km‑deep ocean.
   - **Stage 2:** two independent shallow‑water models (MOM6 and MOST) on a 1/10° Maastrichtian paleobathymetry for 48 h.
   
   All far‑field numbers in the literature come from this one study (X). Kinsland et al. 2025 [kinsland2025] restate them; they did not run new models.
2. **Generation.** In the reference model the tsunami is a **rim wave** pushed out by the ejecta curtain:
   - a ~4.5 km water wall at 2.5 min;
   - a ~1.2–1.5 km rim wave 220 km from ground zero at 10 min.
   
   The crater‑collapse/resurge wave is secondary, about 13× less energy at 4 h [range2022] (X). The older Gulf‑only model [matsui2002] claimed the opposite; that disagreement is unresolved near the source (C).
3. **Timeline (model).**

   | Time after impact | What happens |
   |---|---|
   | ~1 h | Leaves the Gulf into the Atlantic |
   | ~4 h | Enters the Pacific through the Central American Seaway |
   | ≤24 h | Most of the Atlantic and Pacific crossed; enters the Indian Ocean from both sides |
   | 48 h | Reaches most coastlines |

   Deep‑water front speed is >200 m/s [range2022] (X).
4. **Heights and speeds (model, maximum over 48 h).**

   | Region | Height |
   |---|---|
   | Gulf of Mexico, open water | >100 m (400–500 m in the northern Gulf at 1 h) |
   | Western/central N Atlantic | ≥10 m |
   | South Pacific beam | 4–10 m |
   | N Pacific, S Atlantic | ~1–2 m |
   | Indian Ocean, Tethys | <1 m |

   Depth‑averaged flow is >20 cm/s, enough to erode fine pelagic ooze, in the N Atlantic, equatorial S Atlantic, Central American Seaway and southern Pacific, >10,000–12,000 km away [range2022] (X).
5. **Energy (model).** About 5×10²⁰ J at hand‑off, ≈0.19% of impact energy, up to **30,000×** the 2004 Indian Ocean tsunami. It decays to ~3.9×10¹⁹ J by 4 h (faster decay than earthquake tsunamis) [range2022] (X).
6. **Observed evidence.**
   - **Strong in and around the Gulf:**
     - a ~2×10⁵ km³ basin‑wide K‑Pg "cocktail" deposit: mostly seismically triggered debrites, then tsunami‑related turbidites [bralower1998, denne2013, sanford2016];
     - Louisiana megaripples, 600 m wavelength and 16 m high [kinsland2021];
     - a reflected‑tsunami layer inside the crater [gulick2019];
     - Gulf‑margin event beds [bourgeois1988, smit1992, schulte2006, schulte2012, takayama2000, maurrasse1991].
   - **Indirect far afield:** hiatus patterns [range2022] and a single Argentinian bed [scasso2005] (C).

---

## 1. Mechanisms and sequence of events

| t after contact | Event | Type | Key numbers | Sources |
|---|---|---|---|---|
| 0–~150 s | Transient crater opens. The ejecta curtain pushes the ocean outward as a water wall at ~70–80 km radius. | model | wall height ~4.5 km at 2.5 min (Fig. 1a) | [range2022] X |
| ~1–7 min | Seismic (Rayleigh) waves cross the Gulf (~2.7–3 km/s) and trigger margin collapse, debris flows and fluidized shelf muds. This is not the tsunami, but it sets the substrate the tsunami later reworks. | scaling + observed deposits | Campeche escarpment 1.3 min; DSDP 536/540 3.1 min; Florida/Texas coasts ~7 min | [sanford2016] Tables 2–3 X; [kinsland2025] |
| 5 min | Falling ejecta keep pushing momentum into the water. Discontinuous ejecta clumps make transient waves ahead of the rim wave. | model | — | [range2022] Fig. 1b, Text S1 |
| ≤600 s | Plunging breaking of the rim wave ends; the wave becomes bore‑like. Sea surface inside ~70–150 km is depressed by 0.3–0.7 km as water returns toward the crater. | model | rim wave 1.2–1.5 km high at ~220 km; wavelength 50–100 km | [range2022] Fig. 1c, Fig. 2, Text S1 X |
| ≤10 min (1 km run) | The sediment rim may emerge as a ring‑shaped island. | model | — | [range2022] Sec. 2.2 |
| tens of min | First seawater incursions over the hot melt; melt–water interaction. | observed (core M0077) + interpretation | ~40 m brecciated melt rock / suevite | [gulick2019] |
| 30–60 min | **Resurge** through the ~2 km‑deep NNE rim gap floods the crater to peak‑ring level. Contested: a rim wall may have blocked it in the SW sector. | 1‑D dam‑break model + core | 10 m resurge layer within ~1 h | [gulick2019] C; [bahlburg2010] C |
| 14–53 min | Leading wave reaches Campeche escarpment (210 km), DSDP 536/540 (510 km), Florida platform margin (800 km). | scaling at 0.25 km/s (upper‑bound speed) | 14, 34, 53 min | [sanford2016] Table 3 X |
| ~1 h | Front ~700–830 km from ground zero. Northern Gulf near the paleo‑shelf break sees 400–500 m waves. The wave exits into the Atlantic. Northern shelf: the tsunami arrives ~1 h after the Rayleigh waves. | model | radius from Fig. 3a; 400–500 m | [range2022] Fig. 3a; [kinsland2025] X |
| 75–76 min to 2–3 h | First waves at the paleo‑Florida and paleo‑Texas **coasts**. Slower crossing of shallow shelves. | scaling / restatement | 75–76 min (Sanford); "2–3 h far side" (Gulick) | [sanford2016], [gulick2019] C |
| hours | Megaripples (600 m / 16 m) form in still‑fluid mass‑transport muds on the Louisiana paleo‑shelf edge. Turbidites cap the debrites Gulf‑wide. | observed + interpretation | see §5 | [kinsland2021], [kinsland2025], [sanford2016] |
| within hours | ~80 m sorted resurge suevite settles in the flooded crater; seiches (seismic shaking, slumping). | observed (core) | 80 m | [gulick2019] F/X |
| ~4 h | Front ~2,800 km east of impact; waves enter the Pacific through the Central American Seaway. Northern Gulf shelf waves 40–50 m after crossing the shelf. Energy ~3.9×10¹⁹ J. | model | | [range2022] Fig. 3b, Sec. 5.1; [kinsland2025] X |
| 1–2 h after impact (Tanis, N Dakota) | ~10 m surges up a river valley. Attributed to **seismically excited** water waves, not the Chicxulub tsunami (direct tsunami would need >10 h). | observed + interpretation | | [depalma2019], [leveque2024] C |
| ≤24 h | Waves cross most of the Pacific (from the east) and the Atlantic (from the west), and enter the Indian Ocean from both sides. Within the Gulf, multiple reflections and 1–2 h period oscillations. Reflected rim‑wave tsunami re‑enters the crater (10 cm cross‑bedded layer with PAHs and charcoal). | model; core | | [range2022] Fig. 3c; [matsui2002]; [gulick2019] |
| 48 h (context) | Significant amplitudes on most world coastlines. | model | | [range2022] Fig. 3d |

Generation mechanisms recognised in the literature ([matsui2002] p. 70–71; [range2022] Sec. 5.1; [wunnemann2015]):

1. Atmospheric shock and wind forcing. Matsui judged it negligible. Range et al. 2022 flag a Lamb‑wave tsunami as a possibly significant, unmodelled far‑field source (S).
2. **Rim wave** from the ejecta curtain. It dominates in Range et al. 2022 and, as cited there, in Wünnemann & Weiss 2015.
3. **Collapse / resurge wave.** Water rushes into the cavity, overfills it and collapses outward. It dominates in Matsui 2002.
4. **Landslide / slope‑failure tsunamis** from the Gulf margins collapsing within minutes. Documented in deposits, but not in any global model.

---

## 2. Reference model: Range et al. 2022 — assumptions (matter for re‑scaling)

| Item | Value | Locator |
|---|---|---|
| Impactor | 14 km diameter; 2,650 kg/m³; 12 km/s; **vertical** (axisymmetric) | Sec. 2.1; `asteroid.inp` in [johnson2022] |
| Impact energy | 2.7×10²³ J | Table S4 |
| Target | granitic crust, 4 km sediments, **constant 1 km ocean** (2 and 3 km tested). Real depth: 100–200 m at ground zero, ~1 km at 50 km, ~3 km at 150 km. | Sec. 2.1–2.2; Fig. S1 |
| Hydrocode | iSALE‑2D. 100 m cells (10 cells per 1 km of water); 2,500 × 600 high‑res cells; 250 km high‑res zone. No atmosphere. Vapour removed below 10 kg/m³. | Table S1; Text S1 |
| Hand‑off | 600 s (850 s tested; same global energy) | Sec. 2.2; Fig. S4 |
| Converting the axisymmetric result | "Half Crater" fiducial: crater imposed only where water existed pre‑impact; no sediment rim. Variants: sediment rim; Full Crater (+5% energy); Crater Only (no rim wave, ~13× less energy at 4 h). | Sec. 3.1, 5.1; Text S1 |
| Ocean models | MOM6 and MOST: non‑linear shallow water, **non‑dispersive** (MOST has numerical dispersion). 1/10° grid (1/5° test). dt 10 s / 6 s. Walls at 86.05°S and 82.05°N (MOM6 reflecting, MOST absorbing). No runup or inundation. | Sec. 3.1; Tables S2–S3 |
| Paleobathymetry | Müller et al. 2008 age‑depth grid (65 Ma; mid‑ocean ridges and deep ocean) merged with Scotese PALEOMAP (shelves; the dataset README names `070Ma_PaleoDEM`), Blackman‑filtered | Text S1; [johnson2022] README |
| Not modelled | 3‑D oblique impact; S/SW shallow‑platform asymmetry; landslides; Lamb‑wave forcing; dispersion; runup | Sec. 1, 5.4 |

**Implication for a different reference scenario.** Range et al. report a tsunami efficiency of 0.19% of impact energy, similar to earthquake tsunamis (0.02–0.8%) [range2022] (X). A first‑order re‑scaling for a different impactor energy is E_tsunami ≈ 0.0019 × E_impact. This assumes the same efficiency, which is unverified (S). Amplitudes scale roughly as √E for the same geometry. The rim‑wave height was nearly insensitive to water depth between 1 and 3 km, but this "is not expected to hold" for much shallower water (Sec. 2.2).

## 3. Earlier modelling: Matsui et al. 2002 compared with Range et al. 2022

| | Matsui et al. 2002 [matsui2002] | Range et al. 2022 [range2022] |
|---|---|---|
| Impactor | 10 km (Ir‑based); 10⁸–10⁹ Mt TNT; crater taken as the present 180 km structure | 14 km, 12 km/s, 2.7×10²³ J (≈6.5×10⁷ Mt) |
| Water depth controlling generation | 200 m Yucatán platform around the crater (100 m tested) | 1 km constant (1–3 km tested) |
| Generation | Rim wave estimated by lab scaling (Gault & Sonett 1982) and a breaking criterion: ~10 m at platform edge, "several m" at 500 km, disperses. Main tsunami from crater fill (8 h) and outward "rushing" wave: 50 m at the rim, 10 h period. | iSALE rim wave of 1.2–1.5 km at 10 min dominates; collapse wave ~13× weaker |
| Domain / grid | Gulf + Caribbean, 2.5 km, non‑linear long‑wave with moving shoreline (runup), plus a 2‑layer landslide model | Global, 1/10°, no runup |
| Paleogeography | Ross & Scotese 1988 reconstruction, modified for Cuba | Müller 2008 + Scotese PALEOMAP |
| Coastal results | Leading **negative** wave (receding) crosses the Gulf within 10 h. Then a >200 m rushing wave hits N America. Mean runup >150 m, max 300 m (Rio Grande embayment), inundation >300 km beyond the Mississippi embayment. Oscillations of 1–2 h period. | Gulf open water >100 m; northern Gulf 400–500 m at 1 h, 40–50 m after crossing the shelf at 4 h [kinsland2025 restating the model]. Leading wave positive (rim wave). |
| Landslide test | 140 × 75 km slide, 100 m thick: much smaller than the crater wave, first arrival **positive**; "much larger" if 10× thicker | not modelled |

The two studies disagree mainly because they put the generating water depth in different places: a 200 m platform versus a 1 km slope. A rim wave born in deep water carries most of the energy. A rim wave born on a shallow shelf breaks and disperses. The real Chicxulub target had both: shallow S/SW and deep N/NE ([range2022] Fig. S1; [gulick2019]; [kinsland2025] citing [gulick2008]). The far‑field Atlantic and Pacific tsunami is probably dominated by the northern deep‑water sector, which is Range's regime. Near‑field coastal behaviour to the S and W may be closer to Matsui's regime. That second point is speculation: no 3‑D model tests it.

## 4. Arrival‑time compilation

| Target | Arrival | Kind | Source |
|---|---|---|---|
| Campeche escarpment (210 km) | 14 min | scaling at 250 m/s (upper‑bound speed) | [sanford2016] T3 |
| DSDP 536/540 (510 km) | 34 min | scaling | [sanford2016] T3 |
| Florida platform margin (800 km) | 53 min | scaling | [sanford2016] T3 |
| Paleo‑Florida / paleo‑Texas coast (1,120–1,130 km) | 75–76 min (scaling); ~1 h after the Rayleigh waves at the N shelf; "2–3 h far side" | scaling / restated model | [sanford2016]; [kinsland2025]; [gulick2019] (C) |
| Out of the Gulf into the Atlantic | ~1 h | model | [range2022] |
| Pacific (via Central American Seaway) | ~4 h | model | [range2022] |
| Most of the Atlantic and Pacific crossed; Indian Ocean entered from both sides | ≤24 h after hand‑off | model | [range2022] |
| Tanis, N Dakota (via the Western Interior Seaway, if connected) | ≫10 h | estimate | [leveque2024], [depalma2019] |
| Most world coastlines | ~48 h | model | [range2022] |

Front positions from the figures (approximate; X):

| t | Front position | Implied mean speed |
|---|---|---|
| 600 s | r ≈ 220 km | — |
| 1 h | r ≈ 700–830 km (Fig. 3a) | ≈177 m/s (600 s → 1 h) |
| 4 h | ≈2,800 km to the east, ≈1,600 km to the south (Fig. 3b) | ≈190 m/s (1 h → 4 h) |

Mean speeds of 177–190 m/s correspond to effective depths of ~3.2–3.7 km under c = √(g·h).

**Scaling checks for the eikonal solver** (c = √(g·h), g = 9.81 m/s²; X):

| Depth | Speed |
|---|---|
| 6 km | 243 m/s |
| 4 km | 198 m/s |
| 3 km | 172 m/s |
| 1 km | 99 m/s |
| 200 m | 44 m/s |
| 100 m | 31 m/s |

Crossing a 200 km‑wide shelf 100 m deep takes ≈1.8 h. That one term explains most of the "1 h vs 2–3 h" spread above. Near the source the wave amplitude is comparable to the depth (η ~ h), so the non‑linear celerity √(g(h+η)) is up to ~40% faster. The early hydrocode front moved even faster: ~320 m/s between 2.5 and 10 min, because the ejecta curtain was still driving it (derived from Fig. 1).

## 5. Open‑ocean heights, flow speeds and energy by basin (model, maximum over 48 h, MOST)

| Basin | Maximum amplitude | Maximum depth‑averaged speed | Locator |
|---|---|---|---|
| Gulf of Mexico / Caribbean | >100 m open water; colour scale saturated; >100 m/s near the crater | ≥1.2 m/s (saturated) | Sec. 3.2; Fig. 4 |
| North Atlantic (W and central) | ≥10 m (saturated); E part 2–8 m; >10 m offshore of many coasts | 0.4–0.8 m/s | Fig. 4a–b; PLS |
| South Pacific (beam from the Central American Seaway toward New Zealand/Antarctica) | 4–10 m | 0.2–0.6 m/s | Fig. 4 |
| North Pacific | 1–2 m | <0.2 m/s | Fig. 4 |
| South Atlantic | 1–2 m (equatorial part stronger) | mostly <0.2 m/s; >0.2 m/s equatorial | Fig. 4; abstract |
| Indian Ocean, Tethys / Mediterranean | <~1 m ("shielded") | <0.2 m/s | Fig. 4; Sec. 4.2 |
| Coasts worldwide | near‑shore >1 m (except some Indian Ocean and Mediterranean coasts) | most >0.2 m/s | Sec. 3.2 |

All figure readings are approximate. The flow speeds are depth‑averaged, not near‑bed. The amplitudes are upper bounds: shallow‑water theory may overpredict by up to ~50% where dispersion or undular bores matter (Sec. 5.4). The **20 cm/s erosion threshold** for fine pelagic sediment is quoted from Lonsdale & Southard 1974 and McCave 1984 (second‑hand).

**Energy** ([range2022] Table S4, Fig. S4, Sec. 5.1–5.3):

- **Initial:** ~5.1×10²⁰ J. The Fig. S4 caption says 5.1×10¹⁹ J, which is probably a typo; see the JSON notes.
- **At 4 h:** 3.90×10¹⁹ J (MOM6) and 3.84×10¹⁹ J (MOST).
- **2004 Indian Ocean tsunami:** 1.7×10¹⁶ J initially, 9.1×10¹⁵ J at 4 h.
- **2011 Tohoku:** 3.0×10¹⁵ J.
- **Ratio Chicxulub/2004:** ~2.5×10⁴ at 1 h, falling to ~3×10³ at 7 h. This is the "Van Dorn effect": impact and explosion waves dissipate faster.
- **Offshore height comparison:** 2004 deep‑water amplitude was ~0.6 m at 2 h (measured; second‑hand via [range2022]), against metres to hundreds of metres for Chicxulub.

## 6. Geological evidence (observed) — what it constrains

**Inside the crater, Exp. 364 site M0077, peak ring** [gulick2019]:

- ~130 m of melt rock and suevite from the first day;
- ~40 m within tens of minutes;
- a 10 m resurge layer within ~1 h;
- 80 m of sorted resurge suevite within hours, with seiche beds;
- a 10 cm cross‑bedded sand‑to‑gravel layer with soil PAHs, overlain by charcoal, interpreted as the reflected rim‑wave tsunami "within a day".

The crater floor was 600–1,000 m deep, open to the ocean through a ~2 km‑deep NNE gap.

[bahlburg2010] read the Yaxcopoil‑1 crater‑fill bedforms (grain size <300 µm, small cross‑beds) as **low‑energy** refill at 0.18–1.5 m/s behind an ejecta wall 200 m above sea level. They see no catastrophic resurge or collapse wave in that sector (C).

**Deep Gulf of Mexico — the "cocktail"** [bralower1998]: reworked microfossils, impact material and lithic fragments in giant sediment gravity flows from margin collapse.

- [denne2013]: 31 wells. Deposit 10–20 m thick on the upper slope and 90–200 m on the lower slope and basin floor, resting on an unconformity spanning 9–85 Myr.
- [sanford2016]: 210,000 km of 2‑D seismic, 408 wells. The K‑Pg boundary deposit (KPBD) is ubiquitous: 0 m on the shelves, up to ~400 m in deep water, ~1 km in the crater. Volume 1.05×10⁵ km³ mapped in the northern Gulf; >1.98×10⁵ km³ Gulf‑wide (extrapolated).
- Their depositional model has three steps:
  1. debrites from seismic shaking within ~10 min;
  2. turbidites from the tsunami within 1–2 h;
  3. a ~0.5 m Ir‑rich mud cap settling over days to weeks.
- DSDP 536/540: ~40 m debrite, ~10 m turbidites (≥5 sequences), 0.5 m cap.

**Northern shelf, Louisiana (3‑D seismic)**:

- [kinsland2021]: asymmetric megaripples, average wavelength 600 m and height 16 m, buried ~1,500 m deep. They sit on top of the KPBD, below storm wave base, and their crests point back to Chicxulub.
- [kinsland2025]: more than 2,400 km² of additional data.
  - Upper paleo‑shelf: λ ~365 m, height 3–6 m, uniform over ~1,500 km².
  - Paleo‑slope: λ 450–520 m, variable; paleo‑depth 95–170 or ~260 m (unit inconsistency in the text).
  - Largest ripples near the shelf break, attributed to the Van Dorn effect (shoaling and breaking).
  - Interpretation: tsunami traction on thixotropic muds fluidized by Rayleigh waves about an hour earlier. The dimensions are measured (F); the tsunami origin is the authors' interpretation (X).

**Gulf margins:**

| Site | What is there | Source |
|---|---|---|
| Brazos River, Texas | Single sandstone event bed under the Ir anomaly in mid‑ to outer‑shelf mudstones. Implies a wave ~50–100 m high. | [bourgeois1988] |
| Brazos River, Texas | Debris flows and turbidites from multiple sources: "multiple tsunami or tempestites" plus reworking; ejecta at the base fix it at the boundary. | [schulte2006] |
| Brazos River, Texas | Contrary view (C): separate storm beds; impact ~300 kyr before the K‑T boundary. | [keller2007] |
| El Mimbral, NE Mexico | Clastic unit up to 3 m thick in pelagic marls deposited at >400 m water depth. Three parts: spherule bed (ejecta), laminated beds (megawave backwash), ripple beds with clay drapes (oscillating currents, perhaps seiche). Ir 921 ± 23 pg/g at top. | [smit1992] |
| La Popa basin, NE Mexico | Liquefaction (earthquake) → up to 8 m chaotic unit 1 (shelf collapse plus first tsunami backflow) → unit 2 with 4–8 graded beds (successive backwash surges). | [schulte2012] |
| Cuba (proto‑Caribbean) | Peñalver Fm ~180 m: basal grain flow plus homogenite‑like suspension deposit with mud‑clast beds from successive tsunami waves. KPBD up to ~1 km at Cacarajícara (second‑hand). | [takayama2000]; [sanford2016] |
| Haiti, Beloc | Microtektite layer later partly reworked by "perhaps a giant tsunami". | [maurrasse1991] |

**Distal:**

- **Range et al. 2022 compilation** [range2022]: ≥65% of K‑Pg sections are complete where modelled flow is <20 cm/s; 91% are incomplete where it is >20 cm/s. This includes New Zealand olistostromes >12,000 km away (C, correlative).
- **Neuquén Basin, Argentina** [scasso2005]: a 15–25 cm hummocky bed interpreted as a Chicxulub tsunami deposit. The amplification mechanism is "poorly understood" (C).
- **Tanis** [depalma2019, leveque2024]: surges from seismic waves, **not** the direct tsunami.
- **Consensus context** [schulte2010]: a single ejecta‑rich deposit at the boundary worldwide. Goto 2005 [goto2005] reviews the "Great Chicxulub Debate".

## 7. Paleobathymetry relevant to propagation

- **Ground zero and source region.** Water depth was ~100–200 m at the impact point, shallow (tens to ~200 m) over the S/SW Yucatán platform, ≥1 km at ~50 km to the north, ~3 km at 150 km, and up to ~2 km in the NNE rim gap. Sources: [range2022] Fig. S1; [gulick2019]; [kinsland2025]; [matsui2002]; [bahlburg2010]. Gulick et al. 2008 [gulick2008] is the original seismic source; its full text was not accessed here. The target was strongly asymmetric, with pre‑existing shelf undulations [gulick2008].
- **Gulf basin.** In the range2022 grid the central basin is ~3–4 km deep, opening widely and deeply (>4 km) to the east into the Atlantic and southward into a broad, 2–5 km‑deep Central American Seaway. Fig. S1 and Fig. 3 are in paleo‑coordinates: impact at ~288°E, 22.5°N in that frame.
- **Northern shelf.** Broad and shallow (below storm wave base at the Louisiana megaripple sites). The KPBD slopes from ~0 to 8 km below present sea level over 200–400 km of shelf [sanford2016]. Shelf width and depth set arrival delays and amplification (Green's law A ∝ h^−1/4, standard linear theory, X).
- **Sea level.** +170 m (85–270 m) relative to today [muller2008] (C; New Jersey stratigraphy suggested ~40 m). It controls flooded interiors, including the Mississippi embayment, which extended far north to Missouri [sanford2016].
- **Western Interior Seaway.** Dimensions unknown; a 200 m depth is a "gross upper bound" assumption, and continuity with the Gulf at 66 Ma is uncertain [leveque2024] (S).
- **Global grid.** Müller 2008 (65 Ma age‑depth grid) for deep basins and ridges plus the Scotese PALEOMAP 70 Ma PaleoDEM for shelves [range2022, johnson2022]. Note the 70 Ma vs 66 Ma mismatch of the shelf DEM.

## 8. Disagreements (details in the JSON)

1. **Rim wave vs collapse wave as the main source**: Range/Wünnemann & Weiss vs Matsui. The rim wave is favoured for the far field; near‑field geometry is unresolved.
2. **Fast resurge** (Gulick 2019, cores) vs **blocked or slow refill** (Bahlburg 2010) vs an 8 h fill (Matsui). Probably sector‑dependent.
3. **Gulf‑margin arrival time**: 1 h vs 75 min vs 2–3 h vs 10 h. Mostly shelf‑break vs shoreline plus generation assumptions.
4. **Brazos event bed**: impact tsunami(s) or gravity flows (majority) vs storm beds with a pre‑boundary impact (Keller 2007).
5. **Non‑dispersive vs dispersive far field**: shallow water as an upper bound (Range) vs fast dispersion of a shallow‑born rim wave (Matsui).
6. **Late Cretaceous sea level**: 170 m vs ~40 m.

## 9. Unknowns

- No 3‑D or oblique impact tsunami simulation exists. Directivity (larger downrange toward the SW per [range2022] Sec. 5.4 reasoning; impact from the NE per [collins2020]) is unquantified.
- No coupled modelling of the shallow S/SW platform sector.
- No Lamb‑wave tsunami, landslide tsunamis or dispersive/Boussinesq global run.
- No runup or inundation model except Matsui 2002.
- Central American Seaway and Western Interior Seaway geometry, shelf widths and coastline positions at 66 Ma (paleobathymetry uncertainty of tens to hundreds of km on low‑relief margins).
- The hiatus correlation is non‑unique.
- Several primary deposit papers were not opened (Smit et al. 1996, Stinnesbeck & Keller 1996, Kiyokawa et al. 2002, Klaus et al. 2000); they are listed in `openQuestions`.

## 10. Implications for the visual simulation (eikonal plus calibrated heights)

1. **Initial condition.** Start the eikonal front at t₀ = 600 s on a ring of radius ≈220 km around ground zero ([range2022] hand‑off). Use the 1.2–1.5 km rim‑wave height as the source amplitude.
   - **0–600 s:** show the ejecta‑driven wall instead: ~4.5 km at ~75 km at 150 s, collapsing to the bore‑like rim wave. Show the depressed sea surface (−0.3 to −0.7 km) inside ~70–150 km.
   - **Optional 30–60 min:** show resurge flooding the crater through the NNE gap (C).
2. **Speed.** Use c = √(g·h) on the paleobathymetry. Validate against the reference: r ≈ 700–830 km at 1 h, ≈2,800 km east at 4 h, Atlantic exit ~1 h, Pacific entry ~4 h, Atlantic and Pacific largely crossed and Indian Ocean entered by ≤24 h. Optionally add a non‑linear term √(g(h+η)) within ~1,000 km, where η is comparable to h.
   - Report **shelf‑break** and **shoreline** arrivals separately. Shelves of 100–200 m add 1–2 h, and that difference drives the 1 h vs 2–3 h disagreement.
3. **Heights.** Calibrate regional maxima to [range2022] Fig. 4a (see §5): Gulf >100 m (400–500 m in the northern Gulf at 1 h, 40–50 m on the shelf at 4 h); N Atlantic ≥10 m; S Pacific 4–10 m; N Pacific and S Atlantic 1–2 m; Indian Ocean and Tethys <1 m. Keep the strong **directivity**: a beam east‑northeast into the N Atlantic and one southwest through the Central American Seaway into the S Pacific.
   - Between calibration points: geometric spreading ∝ r^−1/2 plus Green's law ∝ h^−1/4 (standard linear theory, X).
   - Add extra decay so total energy falls ~13× from hand‑off to 4 h (Van Dorn effect).
   - Label far‑field heights as upper bounds (−0% to −50%).
4. **What is visible.** In the open ocean a 2–10 m wave on a 50–100 km wavelength is invisible to the eye: slope ~10⁻⁴. Show it as a vertically exaggerated surface, or as a current or "seafloor‑scour" overlay (>20 cm/s; Fig. 4b). Reserve true‑scale walls of water for the Gulf in the first hours.
5. **Sequence near the Gulf.** Seismic shaking (minutes) → slope collapse and debris flows (minutes to ~10 min) → tsunami arrival (~1 h at the shelf break, 1–3 h at shores) → repeated reflections with 1–2 h periods and turbid backwash for hours → settling of the mud and Ir cap over days to weeks (beyond the window). Seiches inside the crater and in distant basins come from seismic waves, not the tsunami (Tanis).
6. **Alternative scenario switch** (optional, for transparency): a Matsui‑type crater‑dominated scenario has a leading trough, a 10 h period, a >200 m rushing wave and 150–300 m runup. Label it as the older, now less‑supported model.
7. **Calibration data.** Harvard Dataverse doi:10.7910/DVN/GWOFIO (CC0) contains the exact 1/10° pre‑impact paleobathymetry and the MOST maximum‑amplitude/velocity netCDF. Using them would make the eikonal output directly comparable. Not downloaded: ~62 MB + ~74 MB; ask the user first.

## 11. Source verification log (summary)

- **Full text read:** [range2022] + SI, [matsui2002], [sanford2016], [gulick2019], [leveque2024].
- **Publisher abstract or snippets read:**
  - ScienceDirect: [kinsland2021], [kinsland2025], [bahlburg2010], [schulte2006], [keller2007], [takayama2000], [scasso2005].
  - Nature: [gulick2008].
  - J‑STAGE: [goto2005].
- **PubMed records:** [bourgeois1988], [maurrasse1991], [schulte2010], [collins2020], [muller2008], [wunnemann2015], [depalma2019].
- **OpenAlex mirror of the publisher abstract plus Crossref metadata:** [bralower1998], [denne2013], [smit1992], [schulte2012]. GeoScienceWorld and the Royal Society showed bot checks, which were not bypassed.
- **Dataset record and README via the Dataverse API:** [johnson2022].
- `verified` is left as `false` for the DOI script.
