# Thread 06 — Atmosphere, biosphere, paleogeography (T = 0 … T + 24 h)

Research notes for the Chicxulub first-24-hours simulation. Every number carries a source id in
square brackets (ids resolve in `06-atmosfera-biosfera-paleo.json → sources`). Certainty classes:
**fact** (measured), **extrapolation** (model / scaling grounded in known mechanisms),
**speculation** (hypothesis / model assumption without direct support), **contested**
(competing interpretations). Where I could read only an abstract, the locator says "Abstract".

Access limitations (important for auditing): AGU/Wiley, Elsevier, GSA and MDPI full texts were
blocked by bot-protection in this session; I did not try to defeat it. For those papers I used the
publisher abstract (via Crossref / OpenAlex / Nature page metadata) only. Full texts were read for:
Bardeen 2017, DePalma 2019, Gulick 2019, Lyons 2020, Vellekoop 2014, Kaiho 2016, During 2022,
Junium 2022, Miller 2020, Rodiouchkina 2025 (PMC/Europe PMC), Molina 2006 (Episodes PDF),
Sosa-Montes de Oca 2013 (PLoS ONE), Schulte 2006 (VLIZ PDF), Witts 2021 (AMNH), ODP Initial Reports
174AX and 207, Keller et al. 1994 (LPI/NTRS PDF), Maurrasse & Sen 1996 (CGS PDF), and the
Scotese & Wright 2018 PaleoDEM documentation plus the Map16 grid itself.

---

## 1. Volatiles and particulates — masses and how fast they were injected

### 1.1 Sulfur (the most contested quantity)

| Estimate | Value | Basis | Source |
|---|---|---|---|
| 3-D hydrocode (SOVA), oblique impact, gases above 25 km | **325 ± 130 Gt S** | model | [artemieva2017] Abstract |
| Same, as quoted by Gulick et al. | 325 ± 60 Gt S | secondary quote — **inconsistent with primary (±130)**; use primary | [gulick2019] Discussion |
| 2-D hydrocode, 10–30 km impactors, 20 or 50 km/s | 40–560 Gt S | model | [pierazzo1998] Abstract |
| Pierazzo 1998 tabulated for 15-km asteroid; with 50 % recombination | 152–253 Gt; 76–127 Gt | model (as tabulated) | [rodiouchkina2025] Table 1 |
| S concentration + δ34S in K-Pg layers (5 terrestrial sites), isotope dilution | **67 ± 39 Gt S (2SD)**, ~5× below Artemieva | empirical inversion | [rodiouchkina2025] Abstract, Results |
| Per-site: Tanis 58 ± 9, Dogie Creek 48 ± 14, Brownie Butte 104 ± 13, Knudsen's Coulee 71 ± 11, Knudsen's Farm 57 ± 5 Gt | | | [rodiouchkina2025] Results |
| >200 Gt SO2 globally into stratosphere | | model | [pope1997] Abstract |

* Model assumptions behind 325 Gt (from the comparison table in [rodiouchkina2025] Table 1): 10-km
  impactor at 18 km/s, 60° ± 10° obliquity, upper half of sediments 25 % anhydrite / lower half 60 %,
  incipient anhydrite decomposition at 30 GPa, full at 120 GPa; simulations run 15–30 s after impact;
  no anhydrite EOS and no recombination — hence possibly an overestimate (their footnote e).
* Supporting evidence that a lot of S was released and reached the stratosphere: mass-independent
  S-isotope anomalies (S-MIF) in Chicxulub ejecta at Brazos require stratospheric photochemistry
  [junium2022] Abstract/Significance; peak-ring impactites contain <1 % evaporite although the target
  sediments contained 30–50 % — consistent with degassing, or with evaporites preferentially
  fractured into larger clasts [gulick2019] Discussion.
* **Status: contested.** For a visual simulation keep two scenarios: "reference model" 325 Gt S and
  "empirical/low" ~67 Gt S.

### 1.2 Sulfur speciation — fast acid rain vs. long-lived stratospheric aerosol (contested)

* Impact experiments into anhydrite at >10 km/s: SO3 dominates over SO2 → rapid H2SO4
  aerosol, scavenged by coarse silicate ejecta and delivered to the surface **within a few days**,
  acidifying the surface ocean [ohno2014] Abstract.
* Opposing view used by most climate models: SO2 converts to sulfate aerosol over months–years in the
  stratosphere; forcing ~100× Pinatubo for ≥2 yr with saturation between ~30 and ~300 Gt S
  [pierazzo2003] Abstract; ≥26 °C global cooling, 3–16 yr sub-freezing [brugger2017] Abstract.
* [pope1997] (Abstract) explicitly proposes both: an early, intense sulfuric-acid rain from cooler
  plume parts and a second, prolonged (~12 yr) aerosol reservoir.

### 1.3 CO2 and H2O

* CO2: **425 ± 160 Gt** [artemieva2017]; 350–3500 Gt depending on impactor size/velocity, i.e. at most
  ~40 % increase of the end-Cretaceous atmospheric inventory [pierazzo1998]; >500 Gt [pope1997];
  warming <1 K, negligible relative to aerosol cooling [pope1997]. Beloc glass chemistry was used to
  argue for ~10^15 mol CO2 from vaporised marl [sigurdsson1991] Abstract (≈44 Gt CO2 by unit
  conversion — my arithmetic).
* H2O vapour: 200–1400 Gt [pierazzo1998]; >200 Gt into the stratosphere [pope1997]. Water injected with
  soot strongly affects early soot removal: with water a very large fraction of soot rains out within a
  few days [bardeen2017] Results (Lifetime of Soot…), Fig. S2.
* NOx: [toon1997] (Abstract) — ejecta plumes of large impacts may produce enough NO from shock-heated air
  to destroy the ozone shield. Prinn & Fegley (1987) is the classic NOx/acid-rain paper, but I could not
  open its abstract or text — numbers **not** included (see openQuestions).

### 1.4 Soot / black carbon (amount and origin contested)

* Boundary-clay inventory used by climate modellers: up to **56 000 Tg elemental carbon, of which
  15 000 Tg fine soot** (+41 000 Tg coarse) — Bardeen et al. citing Wolbach et al. 1990 (GSA SP 247)
  [bardeen2017] Introduction. Older Wolbach estimates were larger [bardeen2017].
* Original measurement: 0.36–0.58 % graphitic carbon in boundary clays, global abundance
  0.021 ± 0.006 g cm⁻² [wolbach1985] Abstract → ×5.1·10^18 cm² ≈ **1.1·10^17 g ≈ 107 Gt (76–138 Gt)**
  (my scaling). Soot isotopically uniform, coincident with the Ir layer, implying a fire that began before
  ejecta settled [wolbach1988] Abstract.
* Alternative/partial source — target rock: PAH evidence indicates fossil carbon ejected from the crater;
  **0.75–2.5 Gt black carbon**, circulated around the globe **within a few hours**; wildfires "more delayed
  and protracted" [lyons2020] Abstract. Oil-rich target scenario: 500 / 1500 / 2600 Tg BC
  [kaiho2016] Results.
* Counter-argument: target-derived soot far too small to explain the observed soot; global firestorms
  consistent with data [robertson2013] Abstract.

### 1.5 Fine silicate dust

* Grain-size data from the Tanis K-Pg layer show a larger contribution of **fine dust (~0.8–8.0 µm)**
  than previously appreciated; modelled atmospheric lifetime **~15 yr**, cooling up to 15 °C,
  photosynthetic shut-down for **almost 2 yr** [senel2023] Abstract.
* **Total dust mass: not verified.** The Senel et al. main text was paywalled; I did not use secondary
  press figures (see openQuestions).
* Dispersal mechanism for the first hours: ejecta-curtain/atmosphere interaction generates a fast dust
  cloud travelling at a few km/s that carries shocked minerals to distal sites [artemieva2020] Abstract;
  the cloud travelled above the stratosphere and circled the globe within a few hours, then settled
  into the stratosphere ([lyons2020] Introduction, summarising [artemieva2020]). Ballistic-only models
  cannot explain distal ejecta; transport via a hot expanding atmosphere is favoured
  [artemieva2009] Abstract.

### 1.6 Re-entry timeline of high-energy ejecta (key for the first day)

From trajectory calculations [kringdurda2002] Abstract: ~12 % of the vapour-plume ejecta escapes Earth;
**~25 % re-accretes within 2 h, ~55 % within 8 h, ~85 % within 72 h**; deposition concentrated near the
crater and at the antipode (India / Indian Ocean at 65 Ma), smeared in longitude by Earth's rotation;
atmospheric shock heating drawn out over a few days, in pulses.

### 1.7 Darkness — onset (not published as an explicit number)

* No paper I could read gives an explicit "darkness onset" time. Available constraints:
  * Soot in [bardeen2017] is a **model assumption**: fine and coarse soot injected over 24 h
    (Methods), specifically **hours 12–36** after impact (SI Text "Soot Emission and Removal", Fig. S1A);
    sharp increase in wet/dry deposition near hour 28. Heat from fires 4.6·10^22 J assumed (land biomass
    2 g cm⁻²) (SI Fig. S8 caption). Initial soot optical depth at 500 nm ≈700 (35 000 Tg, no water) or
    ≈500 (with water); ≈10 at most for 750 Tg (Results, Fig. 1B).
  * Outcome (≥15 000 Tg fine soot): surface light **<10⁻⁶ of normal (darker than full moonlight) for
    0.5–1 month**, below the 1 % photosynthesis proxy for **~2 yr**; 750 Tg → <1 % for <1 month
    [bardeen2017] Results, Fig. 2. Only soot can push light below the photosynthetic threshold for many
    months [tabor2020] Abstract; dust alone does so for ~2 yr in [senel2023].
  * If the early sulfate pulse were global, photosynthesis could stop for ~6 months [pope1997].
* **Implication:** darkening must be modelled as a ramp over hours–days (dust cloud within hours;
  re-entry 25–85 % over 2–72 h; soot in the 12–36 h window *if* fires are global). Treat as
  speculation/extrapolation, not a measured time.

---

## 2. Biosphere in the first 24 h

### 2.1 Thermal pulse from re-entering ejecta (contested)

* Global IR pulse lasting **several hours**, lethal to unsheltered organisms; survival patterns of
  non-marine vertebrates (burrowers, aquatic taxa) compatible with sheltering [robertson2004] Abstract.
* Re-entry radiation **50–150× solar for 1 to several hours** → global wildfires possible [melosh1990]
  Abstract.
* With self-shielding by settling spherules: peak **5–15 kW m⁻²**, above solar for only **~30 min**,
  >5 kW m⁻² for a few minutes (earlier calculations: >10 kW m⁻² for >20 min) [goldin2009] Abstract.
* Impact-angle asymmetry: downrange pulses can ignite flora several thousand km away; uprange pulses too
  low to ignite even susceptible fuel [morgan2013] Abstract. Laboratory: dry litter ignites, live fuel
  typically does not [belcher2015] Abstract.
* Charcoal: no charcoal or below-background charcoal in six non-marine K-Pg sequences from Colorado to
  Saskatchewan → no continent-wide wildfire in North America [belcher2003] Abstract; Robertson et al.
  argue the charcoal depletion is an artefact of deposition-rate correction [robertson2013] Abstract.
* Near field: charcoal in the crater fill (Site M0077) above the tsunami layer deposited **within a day**;
  interpreted as impact-related burning of forested Gulf margins, possibly the central Mexican shoreline
  ~800 km away ignited by the impact plume (hypothesis) [gulick2019] Abstract, Discussion.

### 2.2 Tanis (North Dakota, ~3000 km) — a minutes-to-hours snapshot

* Event Deposit emplaced **minutes to hours** after impact, < 1 h post-impact; capped by the 1–2 cm
  dual-layer K-Pg tonstein (Ir 3.8 ppb in the upper layer) [depalma2019] Significance, Abstract, Results.
* Calculated arrivals at Tanis: **P, S, Rayleigh waves at 6, 10, 13 min**; ejecta-curtain spherules
  launched at 30–60° reach the top of the atmosphere over Tanis at **13–25 min**; for ~45–50° launch,
  spherules begin arriving **~15 min**, the vast majority within **1–2 h**; shocked quartz from ~38 min
  [depalma2019] Chronology section.
* Run-up of the deposit **≥10 m**; scaling from the Tohoku seiche suggests seiches of order 10–100 m
  worldwide (rough scaling) [depalma2019] Discussion.
* Spherules (mostly 0.3–1.4 mm) in the gill rakers of **>50 %** of acipenseriform carcasses
  [depalma2019]; synchrotron tomography shows spherules only in gill rakers, not in the gut → fish alive
  and feeding when spherules fell and the seiche arrived [during2022] Results.
* **Season:** bone growth stopped early in the favourable growth season after a LAG; δ13C cycles →
  **boreal spring** (austral autumn) [during2022] Abstract, Results. Tanis at ~50° N palaeolatitude, winter
  4–6 °C, summer mean ~19 °C (regional reconstructions cited by [during2022]).
* Disputes: (i) seiche vs tsunami — DePalma et al. themselves note an impact tsunami would be strongly
  attenuated in a shallow, possibly discontinuous Western Interior Seaway [depalma2019]; (ii) a separate
  spring/summer study [depalma2021] was criticised for missing raw data and graph irregularities
  [during2024]. Other high-profile Tanis claims circulated only in popular media are not peer-reviewed and
  are excluded here.

### 2.3 Coasts and shelves

* Global tsunami model: up to 30 000× the energy of the 2004 Indian Ocean tsunami; flow speeds
  >20 cm s⁻¹ along shorelines worldwide and in the Central American Seaway, capable of scouring >10 000 km
  away [range2022] Abstract.
* Brazos (Texas): sandstone bed at mid–outer shelf depth interpreted as deposit of a tsunami **50–100 m
  high** [bourgeois1988] Abstract; later work: ejecta-bearing event deposit from multiple
  debris flows/turbidites — "multiple tsunami or tempestites", ejecta ~10 cm [schulte2006] Abstract, §4.6.
  Post-impact SSTs on average up to 2 °C lower, with drops up to 7 °C (months–decades) [vellekoop2014].
* El Mimbral: clastic unit up to 3 m in >400 m water depth; spherule bed → plant-debris-rich laminated beds
  (backwash) → ripple beds (oscillating currents / seiche); Ir 921 ± 23 pg/g at top [smit1992] Abstract.
* Crater: resurge crested the peak ring within an hour; reflected rim-wave tsunami reached the crater
  within a day [gulick2019] Abstract.
* Regional pattern of the ejecta/event deposits [smit1999] Abstract: thick breccias within ~300 km of the
  rim; Gulf of Mexico sites (<2500 km) with up to 9 m thick, tsunami-influenced, tektite-bearing sequences
  in shallow water and decimetre gravity-flow beds in deep water; centimetre tektite layers at
  2500–4000 km; a millimetre-thin distal layer worldwide (microkrystites, Ni-rich spinel).
* Dispute: a minority view treats the Gulf clastic units as turbidites/lowstand deposits and places the
  Chicxulub impact ~300 kyr before the boundary [keller1994; keller2004]; the consensus is a single impact
  at the boundary [schulte2010], with the impact within 33 kyr of the extinction [renne2013].

### 2.4 Primary production shutdown

* Onset within the first day is plausible but not quantified (see §1.7). Light falls below 1 % of normal
  for ~2 yr in soot (≥5000 Tg) or dust scenarios [bardeen2017; senel2023]. Fern spike in New Zealand with
  a large Ir anomaly → global devastation of land flora [vajda2001] Abstract. ~76 % of species went
  extinct (cited in [during2022; lyons2020]).

---

## 3. Paleogeography

### 3.1 PaleoDEM (Scotese & Wright 2018) — what Map16 is

* Map16 = **"KT Boundary (latest Maastrichtian, 66 Ma)"**, stratigraphic age 66 Ma (Ogg, Ogg & Gradstein
  2012 time scale); **"Plate Tectonic Model Age" = 65 Ma** in the **PALEOMAP Global Plate Model v2d3
  (Scotese 2016b)** — that is why files are named `Map16_PALEOMAP_1deg_KT_Boundary_65Ma.nc` /
  `Map16_065Ma.csv` [scotese2018] Table 1 + footnote 3; [scotese2016]. (Note: the Table 1 footnote cites
  Ogg et al. 2012 while the reference list gives Ogg et al. 2008 — minor inconsistency in the PDF.)
* **How bathymetry was assigned** [scotese2018] pp. 4–6: modern topography/bathymetry (Smith & Sandwell
  1997; Antarctica BEDMAP; Arctic IBCAO) at 6′ resolution is rotated to palaeopositions with the
  PALEOMAP plate model; oceanic crust is "unsubsided" with the **Stein & Stein (1992) depth–age relation**
  [stein1992]; shelves, epeiric seas, lowlands and mountains are then hand-edited as grey-scale values
  (40 m vertical step) from lithofacies databases and tectonic reasoning. Authors call the grids a "first
  draft": subducted ocean floor bathymetry, palaeoshorelines and high-/low-stand shorelines need revision;
  mountain heights likely overestimated. Sea level: Haq-type curves too high, Miller et al. (2005) too
  low; reducing Haq & Schutter by 30–40 % fits flooding better.
* My checks of the 1° CSV (`Map16_065Ma.csv`, 361×181 nodes, 40 m quantisation): area-weighted land
  28.3 %, shelf (0…−200 m) 5.8 %, −200…−2000 m 7.8 %, deeper 58.0 %; mean ocean depth 3754 m (4398 m for
  cells deeper than 2000 m); range −5880…+3000 m.
* **Tsunami travel-time caveat:** 1° cells cannot represent the Yucatán shelf/ramp or narrow seaways;
  the DEM is in palaeo-coordinates (rotate Chicxulub with PALEOMAP v2d3 before sampling depths).

### 3.2 Seaways, Atlantic, sea level

* **Western Interior Seaway:** In Map16 the North-American interior band (palaeo-lon −95…−69°,
  palaeo-lat 42–64°) has no cells below sea level (minimum +80 m) — i.e. **no continuous seaway**.
  Literature: marine tongues (Breien, Cantapeta) and brackish/marine fossils in the upper Hell Creek Fm
  of North Dakota, with the WIS connectivity "not presently known" [depalma2019]; a restricted WIS
  persisted through the latest Cretaceous in the western Great Plains and expanded as the Paleocene
  Cannonball Sea [boyd2011] Abstract; Brazos lay "at the entrance to the Western Interior Seaway" in
  regional reconstructions [schulte2006 §1.1; vellekoop2014]. → **contested / unresolved at 1°.**
* **Central American Seaway:** open deep-water passage between the Americas in Map16; open in the global
  tsunami model [range2022].
* **Atlantic width (Map16, contiguous water incl. shelves along palaeo-parallels; my measurement):**
  equatorial ≈2100 km (deep part ≈1450 km); 30° S ≈3500 km; 40° N ≈4100 km; 50° N ≈1650 km.
  Order-of-magnitude: roughly half of present-day widths.
* **Sea level:** ~60–70 m above present for 58–66 Ma (δ18O–Mg/Ca method; authors flag pre-48 Ma values as
  suspect) [miller2020] Materials and Methods; long-term Cretaceous peak 100 ± 50 m [miller2005] Abstract.

---

## 4. K-Pg sites (12) — summary (details & Polish texts in `sites.input.json`)

| id | coordinates (present) | coord source | key observations |
|---|---|---|---|
| tanis | 46.10 N, 103.51 W (approx.; SW North Dakota) | osm_nominatim (Bowman Co. centroid, chosen by me) | seiche/surge deposit, fish with spherules, spring [depalma2019; during2022] |
| hell_creek | 47.531 N, 107.017 W (Brownie Butte) | osm_nominatim (PBDB 47.6/−107.0 cross-check) | Ir-bearing boundary, terrestrial extinction [smit1984]; S 104 ± 13 Gt [rodiouchkina2025] |
| beloc | 18.378 N, 72.588 W (village; outcrops ~1–3 km) | osm_nominatim | tektite glass [sigurdsson1991]; reworked marker bed 40–72.5 cm [maurrasse1991; maurrasse1996]; Ar–Ar age [izett1991] |
| el_mimbral | 23.217 N, 98.667 W | keller1994 | 3-m clastic unit [smit1992] |
| brazos | 31.132 N, 96.824 W | vellekoop2014 (cross-check [witts2021]) | tsunami/event bed [bourgeois1988; schulte2006]; S-MIF [junium2022]; ammonites below boundary [witts2021] |
| gubbio | 43.365 N, 12.583 E | iugs_gubbio | 1-cm clay, Ir 3000 ppt [alvarez1990] |
| stevns_klint | 55.267 N, 12.423 E | unesco_stevns | Ir ×160 [alvarez1980]; 100–150 m depth [rodiouchkina2025] |
| el_kef | 36.154 N, 8.649 E | molina2006 | GSSP, 1–3 mm rust layer, Ir 16.25 ppb |
| caravaca | 38.077 N, 1.878 W | sosamontesdeoca2013 | 2–3 mm ejecta layer [sosamontesdeoca2013]; Ir/Os [smit1980] |
| bass_river | 39.612 N, 74.437 W | miller1998 | 6-cm spherule bed [olsson1997] |
| demerara_rise | 9.301 N, 54.199 W (ODP 1259B) | shipboard2004 | 2-cm graded air-fall spherules, Ir 1.5 ppb [macleod2007] |
| woodside_creek | 41.917 S, 174.067 E | pbdb | Ir 153 ng/g in basal 2 mm [brooks1984] |

Present-day great-circle distances from Chicxulub (21.3 N, 89.5 W; my calculation) for orientation:
Tanis ≈3040 km, Brownie Butte ≈3310, Beloc ≈1800, El Mimbral ≈970, Brazos ≈1310, Bass River ≈2490
(ODP: ~2500), Demerara ≈4000 (MacLeod: ~4500), Gubbio ≈9320, Stevns ≈8800, El Kef ≈9320,
Caravaca ≈8370, Woodside Creek ≈12 090 km. [rodiouchkina2025] quotes ~6400/5500/900/3000 km for
Stevns/Caravaca/Brazos/Tanis — basis not stated (palaeo-distances?), so not adopted.

---

## 5. Implications for the visual simulation (first 24 h)

1. **Timeline anchors** (seconds after contact): S/CO2 release assessed at 15–30 s (hydrocode window);
   dust cloud at a few km/s, globe-circling within hours; Tanis: P 360 s, S 600 s, Rayleigh 780 s,
   first spherules ~780–1500 s, bulk by 3600–7200 s, shocked quartz ~2280 s; re-entry fractions
   25 % @ 7200 s, 55 % @ 28 800 s, 85 % @ 259 200 s; soot injection (if global fires) 43 200–129 600 s;
   crater tsunami return + charcoal ≤ 86 400 s.
2. **Sky/lighting:** do not hard-code a darkness onset. Drive opacity from (a) ejecta re-entry fraction,
   (b) optional soot ramp (12–36 h), (c) sulfur scenario switch (325 vs 67 Gt S). Full darkness
   (<10⁻⁶) is a multi-day/weeks phenomenon in models, not a T+24 h state.
3. **Thermal glow / fires:** show heterogeneous ignition — strongest downrange and near the Gulf rim;
   allow a "Goldin & Melosh" mode (~30 min pulse) vs a "Melosh/Robertson" mode (hours).
4. **Season:** boreal spring (leafing northern forests; southern autumn).
5. **Map:** PaleoDEM Map16 (66 Ma strat., 65 Ma plate model) — narrower Atlantic, open CAS, no
   continuous WIS at 1° (residual Dakota seaway possible), sea level +60–70 m (contested). Rotate site
   coordinates with PALEOMAP v2d3 before placing markers on the palaeo-map.
