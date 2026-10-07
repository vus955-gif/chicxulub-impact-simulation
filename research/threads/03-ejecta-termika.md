# Thread 03 — Ejecta, thermal pulse, fireball, wildfires, temperature (T = 0 … T + 24 h)

Scope: Chicxulub impact (K-Pg, ~66 Ma). This file holds research notes. The machine-readable values are in `03-ejecta-termika.json`, and source IDs in [brackets] refer to that file's `sources` array.
Certainty scale used throughout: **fact** (measured/observed), **extrapolation** (model or scaling grounded in known physics), **speculation** (hypothesis without direct support), **contested** (published positions conflict).

How sources were checked: every source listed in the JSON was opened in this session. That means one of: the publisher page via doi.org, the full text on the publisher site (AGU/Wiley "free access", PNAS via PMC, Sci. Rep., ACP), an author-accepted manuscript in an institutional repository (Imperial Spiral, AMNH), or the Crossref-deposited abstract. Where only an abstract was read, the JSON `notes` field says so, and only numbers stated in that abstract are used. Some numbers come from a paper I could not open in full. Those are cited through the paper that quotes them ("X via Y") and are flagged.

---

## 1. Sequence of events with timing (consensus where it exists)

| Time after contact | Event | Key sources | Certainty |
|---|---|---|---|
| 0–20 s | Vapor/melt plume generated. Plume core initially >10,000 K, cooling to a few hundred to ~1000 K in about a minute (hydrocode, Pierazzo et al. 1998, *via* [kring2002] §2.2). | kring2002 | extrapolation |
| ~5–12 s | Fireball reaches its transparency radius and radiates at maximum: ~90–220 km radius by Collins et al. scaling (my calculation, see §4). | collins2005 | extrapolation (scaling far outside calibration) |
| 10–35 s | Basement ejecta max velocity 2.7 km/s at 10 s. At 35 s the upper plume (projectile + sediment vapor) moves >6 km/s and the lower plume ≤2 km/s; all basement material is below 70 km altitude. | artemieva2009 §4.1, Fig. 2 | extrapolation |
| seconds | Fireball radiation reaches southern USA "seconds after impact". | morgan2013 §6.2 [42] | extrapolation |
| 2–3 min | Earliest high-energy (plume) ejecta re-enter above Colorado (~2200 km) in the Kring & Durda model. | kring2002 §6 [59] | extrapolation (velocity-distribution dependent) |
| 5–10 min | Ejecta curtain still visible at 300 s. By 600 s, ejecta–atmosphere interaction is turning it into a fast outward-moving dust cloud. | artemieva2020 §3, Figs 1–2 | extrapolation |
| ~10 min | First ejecta at the top of the atmosphere 2000–2500 km downrange, at 4–4.5 km/s and 35–55° entry angle. | morgan2013 §4.2 [29] | extrapolation |
| ~10–15 min | Re-entry thermal pulse over the USA follows the fireball by 10–15 min. | morgan2013 §6.2 [42] | extrapolation |
| 13–14 min | High-energy ejecta begin entering the atmosphere above Amazonia. | kring2002 [59] | extrapolation |
| ~15 min | Low-energy (curtain) ejecta arrive in Colorado. | kring2002 [59] | extrapolation |
| 13–25 min (start ~15 min) | Ejecta-curtain spherules reach the top of the atmosphere above Tanis, ND (~3050 km). Most fall within 1–2 h. Shocked quartz from the "warm fireball" arrives ~38 min–2 h. | depalma2019 (ballistic recalculation) | extrapolation |
| tens of minutes | Trees charred (395–1022 °C) in Baja California (~2500 km) before the tsunami arrived. | santacatharina2022 | fact (charring) + inference (timing) |
| 18–20 min | High-energy ejecta reach the atmosphere above central Europe. | kring2002 [59] | extrapolation |
| ~33 min | First ejecta at the top of the atmosphere at 7000–8000 km (distal). | morgan2013 §4.2 [29] | extrapolation |
| 41–42 min / 46 min | Ejecta reach India / the antipode. | kring2002 [59] | extrapolation |
| ≤ 30 min | Ballistic flight times are all shorter than half an hour. | artemieva2009 §5.6 | extrapolation |
| ~1 h | Dust cloud reaches ~5000 km; some ejecta are already 8000 km out, at >50 km altitude and >1 km/s. Coarse fraction has settled; cloud mass stabilizes after ~1000–1200 s. | artemieva2020 §3, Fig. 3, Table 1 | extrapolation |
| ~1 h | Shocked quartz settles to the ground in Colorado, unless lofted by fire plumes. | kring2002 [59] | extrapolation |
| 2 h | ~25 % of high-energy ejecta have re-accreted. | kring2002 Abstract, [35] | extrapolation |
| 4–5 h | Fast-moving cloud has carried dust, soot and sulfate around the Earth. | morgan2022 (Key points) | extrapolation |
| "a few hours" | Ejected target carbon has circled the globe. | lyons2020 Abstract | extrapolation |
| 8 h | ~55 % of high-energy ejecta have re-accreted. | kring2002 | extrapolation |
| "after a few hours" | IR from re-entering ejecta has ceased (heat-fire view). | robertson2013 [30] | contested |
| within the first day | Charcoal delivered into the crater (reflected tsunami and/or airfall). | gulick2019 | fact (charcoal) + interpretation (timing) |
| 12–36 h (prescribed) | Global fires burn in the Bardeen et al. sensitivity run. This is a model input, not a prediction of ignition time. | bardeen2017 SI Fig. S8 | speculation (scenario) |
| 72 h | ~85 % of high-energy ejecta have re-accreted, in ~3 diminishing daily pulses near the antipode. | kring2002 [35], [44] | extrapolation |
| days–weeks | Spherules (hundreds of µm) settle out within days. The full K-Pg layer is deposited within days to ~2 weeks; the finest fraction stays aloft much longer. | artemieva2009 §6, kring2002 [45–46], toon2016 §2.1.1 | extrapolation |

## 2. Ejecta: mass, thickness and composition

### 2.1 Total mass / volume (model and scaling, never measured directly)
- Displaced volume of the ~100 km transient cavity is ~1×10⁵ km³. Ejected material forming the K/T deposits is >10⁴ km³ (">25 trillion metric tons", i.e. >2.5×10¹⁶ kg) [kring2002 §2.1 [9], scaling]. The same paragraph cites hydrocode values (Pierazzo et al. 1998, *via* Kring & Durda) of 2.6–8.4×10³ km³ vapor and 2.9–4.9×10⁴ km³ melt.
- Ejecta-curtain mass (ejection velocity >1 km/s) in the SOVA vertical-impact model: **4.8×10¹⁶ kg**. The high-velocity plume in that vertical model is only ~10¹⁴ kg (<1 % of the curtain) [artemieva2020 §4.1, Table 1].
- Total basement melt produced: 18,000–28,000 km³. ~80 % stays in or near the crater, and ~3 % leaves the crater at >1 km/s [artemieva2009 §4.2].
- Material ejected at >5 km/s (can reach distal sites ballistically): **770–1630 km³** across five impact scenarios [artemieva2009 §4.1]. The review figure is "several thousand gigatonnes … ejected at velocities exceeding 5 km/s" [morgan2022 Abstract].
- Mass of vapor-plume ("high-energy") ejecta used for the thermal calculation: **1–2.5×10¹⁶ kg** [kring2002 §5.1 [40]]. Compare ~10¹⁴ kg in the vertical SOVA model and 1.6–6.9×10¹⁴ kg reaching distal sites for 45–60° wet-target models [artemieva2020 §4.1]. This two-order-of-magnitude difference is **contested** and drives the size of the re-entry heat pulse (§3).
- Climate-model inputs for the K-Pg case: Type-2 spherules 2.3×10¹⁸ g (0.44 g cm⁻²); nanoparticles ≤2×10¹⁸ g (upper limit); soot 1.5–5.6×10¹⁶ g; impactor ~1.4×10¹⁸ g at 2.8×10²³ J [toon2016 Table 1]. For its GCM the dust paper used "in the order of 2×10¹⁸ g as an upper limit" of fine ejecta [senel2023 Ext. Data Fig. 9].

### 2.2 Thickness vs distance (measured; event-deposit thickness, not pure fallout)
| Distance from crater centre | Observed K-Pg event deposit | Source |
|---|---|---|
| inside crater / <300 km from rim | thick polymict and monomict breccias (drill holes) | smit1999 Abstract |
| ~300–400 km ("very proximal": Guayal, Bochil, Albion, Cuba) | **10 to >80 m** event deposit | schulte2010 SOM Table S1 |
| 360 km (Albion Island, Belize) | ~1 m spheroid bed (0.10–1.72 m; up to four flows) + ~15 m diamictite (top eroded); blocks up to ~8 m | pope1999 |
| ~500–900 km ("proximal", Gulf of Mexico margin) | **dm to 10 m** event deposit (ejecta + mass flows + tsunami) | schulte2010 SOM Table S1 |
| <2500 km, shallow marine Gulf of Mexico | up to 9 m complex tsunami-influenced sequences; dm-thick gravity-flow beds in deep water | smit1999 Abstract |
| Haiti (Beloc; 860–910 km per kring2002, artemieva2009) | ~46–50 cm ejecta layer: basal 20–30 cm graded spherule bed + 20–40 cm upper unit; glass spherules 1–6 mm | hildebrand1990; kring2002 [13]; artemieva2009 §2.2 |
| 2000–4000 km (North America, Western Interior) | **0.5–2 cm** dual layer (lower spherule layer + upper "fireball" layer); Raton Basin 1–2 cm | artemieva2009 §1; kring2002 [13]; smit1999 (cm-thick, 2500–4000 km) |
| "intermediate" class incl. Atlantic sites (2100–4500 km) | 1–10 cm | schulte2010 SOM Table S1 |
| >4000–6000 km (distal, global) | **2–3 mm** (≤2–4 mm), near-constant | artemieva2009 §1, §2.1; artemieva2020 §1, §4.1; gulick2019 |

Note the paleodistance discrepancy for Beloc: 500 km in schulte2010 SOM against 860–910 km in kring2002 and artemieva2009. These are different paleogeographic reconstructions, and the simulation should pick one and state which.

### 2.3 Distal layer mass and spherules
- The distal layer (~3 mm, >6000 km) is ~3×10¹⁵ kg. Microkrystites make up ~66 % of it, or ~2×10¹⁵ kg [artemieva2020 §4.1, using Smit 1999].
- Global spherule volume is ~850 km³ (Smit 1999) within a total boundary-clay volume of 1000–1500 km³ [artemieva2009 §2.1, citing Smit 1999]. The modeled distal ejecta volume is ≥770 km³ [artemieva2009 §4.1].
- Spherule size decreases with distance:
  - Beloc averages 3–4 mm and Mimbral 3–5 mm (~1000 km); Blake Nose 1–3 mm (~1700 km); Gorgonilla ~1 mm (~3000 km); Tanis 0.3–1.4 mm (~3050 km) [depalma2019].
  - Distal microkrystites average ~250 µm (Smit 1999 *via* kring2002 [19]).
  - Kring & Durda quote a size–distance relation of ∝ R^−α with α = 2.0–2.5 (Vervack & Melosh 1992, *via* kring2002 [14]).
  - Vapor-plume condensation modelling gives ~250 µm spherules for a 10 km impactor at ~21 km/s [johnson2012].

### 2.4 Shocked quartz and iridium
- First mineralogical evidence of shocked quartz (Montana boundary claystone) [bohor1984].
- Maximum grain size falls with distance: 1250 µm in Haiti, ~500–640 µm in the Western Interior, ~110–190 µm in Europe and New Zealand, and ≤50 µm mean at Pacific sites [kring2002 Table 1]. Abundance, maximum size and mean size all decrease gradually with paleodistance, and the mean shock degree rises with distance [morgan2006].
- Total shocked-quartz volume: 0.044–0.141 km³ globally, of which 0.017–0.053 km³ is in the distal layer [artemieva2009 Table 1].
- Basement-derived quartz leaves the crater at <3 km/s, too slowly to reach distal sites ballistically. This requires non-ballistic transport (§6). Ballistic re-entry could also anneal shocked features (croskell2002).
- Iridium enrichment is ~30× (Gubbio, Italy), ~160× (Stevns Klint, Denmark) and ~20× (New Zealand) above background [alvarez1980].
  - Mean Ir fluence in the fireball layer is 40–55 ng cm⁻², and total Ir is 2.0–2.8×10⁸ kg [artemieva2009 §2]. Reported fluences range from 3 to 340 ng cm⁻² [kring2002 [4]].
  - Peak concentrations include 48 ppb at Stevns Klint (10,200 km), 8 ppb at Gubbio (9200 km) and 56 ppb at Starkville South, Colorado (2250 km) [schulte2010 SOM Table S1], and 3.8 ppb at Tanis [depalma2019].

## 3. Thermal pulse from re-entering ejecta — CONTESTED

### 3.1 The mechanism (agreed)
High-velocity ejecta re-enter at ~3–11 km/s and decelerate at roughly 70–100 km altitude. The kinetic energy heats the upper atmosphere and the particles, which radiate in the IR, partly downward [melosh1990; kring2002 §5; toon2016 §3]. Kring & Durda estimate a total energy deposited in the atmosphere of **4×10²³–1×10²⁴ J** [kring2002 [38]]. Per unit area, Melosh et al. 1990 give 1.3–5×10⁸ J m⁻², as quoted in [robertson2004 p. 762]. The models disagree on the net flux at the ground and its duration.

### 3.2 Model numbers, by position
**A. "Global heat pulse" (high, long) — Melosh et al. 1990; Kring & Durda 2002; Robertson et al. 2004, 2013**
- Melosh et al. 1990: the global radiation flux rises to **50–150× the solar input** for **1 to several hours** [melosh1990 Abstract]. Robertson et al. paraphrase this as "of the order of 10 kW m⁻²" for 1–several hours, with the ~70 km layer at **800–1100 K for several hours**. They also quote a 2–4×10⁵ J m⁻² ignition threshold from nuclear-weapons tables [robertson2004 p. 762].
- Kring & Durda 2002 report power delivered to the atmosphere of >100 kW m⁻² in places, peaking at **~350 kW m⁻²** (Fig. 8). About 1/3 reaches the ground, and >12.5 kW m⁻² for >20 min (37.5 kW m⁻² in the atmosphere) ignites vegetation. Ignition-capable areas lie on several continents, mainly near the crater and the antipode, with the pattern depending on the trajectory (Fig. 11). Heating comes in pulses over ~3 days near the antipode [kring2002 [40]–[44], [61]].
- Robertson et al. 2013 accept the Goldin & Melosh fluxes as still enough to ignite **tinder**. They argue that omitted effects (particle scattering and translucency, a reflective dust cap) would raise the flux, and that IR "ceased after a few hours" [robertson2013 [5], [30]].

**B. "Self-shielded / regional pulse" (lower, short) — Goldin & Melosh 2009; Morgan et al. 2013**
- Goldin & Melosh 2009 used two-phase flow with spherule and air opacity at **distal** sites. The surface flux peaks at **5–15 kW m⁻²**, exceeds the solar norm for only **~30 min**, and is above 5 kW m⁻² for only **a few minutes**. Early-arriving spherules shield the surface from radiation emitted by later ones. An opaque cap of submicron dust could override the shielding [goldin2009 Abstract].
- Morgan et al. 2013 used 3D SOVA ejection and ballistic flight with dusty-flow re-entry, radiation and self-shielding, for 45° and 60° impacts:
  - Peak surface flux for a 45° impact, downrange (0–30° azimuth), digitized from Fig. 4: **~56 kW m⁻²** at 2000–2500 km lasting ~1–2 min; **~55 kW m⁻²** at 4000–5000 km lasting ~2–3 min; **~20 kW m⁻²** at 7000–8000 km lasting ~5 min. At 60–90° off the downrange axis the distal value drops to ~7 kW m⁻², with a tail of ~10 min.
  - Uprange sites (120–180°) beyond 3000 km receive a **negligible** pulse (§5.2, §6.4, Fig. 3).
  - A 100 % reflective dust cap would **~double** the flux (same duration). Semi-transparent spherules give +50–70 % flux and ~2× duration. Size-distribution changes give ±20 %, and the atmosphere below the spherules absorbs ~40 % [morgan2013 §5.2, §6.1, Fig. 7].
  - Some pulses exceed 10 kW m⁻² for several minutes. The authors conclude that fires were "widespread but not global" [morgan2013 §6.4].
- The figure's time axis appears to run from the onset of re-entry at each site. Combined with the §4.2 arrival times (10 min proximal, 33 min distal), peaks fall at about T + 11 min (proximal) and T + 35 min (distal). This mapping is **my inference**; the paper does not state it explicitly.

**C. Observational upper bounds from charcoal (North America) — Belcher et al.**
- Charcoal in six non-marine North American sequences (Colorado to Saskatchewan) is absent or below background. Belcher et al. 2003 infer **<19 kW m⁻² at the ground** and <95 kW m⁻² delivered to the atmosphere [belcher2003].
- From eight sites they infer ground temperatures ≤545 °C at any point and not above 325 °C for any significant period. That corresponds to a maximum irradiance <19 kW m⁻² and ≤6 kW m⁻² for more than a few hours [belcher2005].
- Fire-propagation-apparatus experiments reproducing the modelled pulses found that **dry litter can ignite, live fuels typically do not**. The intense, short downrange proximal and intermediate pulse is insufficient for live fuel; the longer distal pulse might ignite live fuels [belcher2015].

### 3.3 Ignition thresholds used in the literature
- 51 kW m⁻² for ≥2 min: spontaneous ignition of wood.
- 20 kW m⁻² for ≥20 min: piloted ignition of wood.
- 28 kW m⁻² for ≥1 min: foliage and litter.
- Continental-scale fires need 2–6×10¹⁵ kg of ejected plume mass and global fires 1–2×10¹⁶ kg. That corresponds to craters ≥85 km for continental and ~135 km for global fires [durda2004 Abstract].
- The required exposure grows with event energy as E^(1/6) (Glasstone & Dolan scaling, used by [collins2005 Eq. 39] and [morgan2013 §3.3]).

### 3.4 Assessment
- The mechanism (radiation from re-entering ejecta) is not in dispute.
- Magnitude, duration and geographic uniformity **are**. The most physically complete published models (opacity, self-shielding, asymmetric 3D ejection) [goldin2009; morgan2013] give short pulses: minutes, not hours. Those pulses are strong downrange at 2000–5000 km, weaker at distal sites, and negligible uprange beyond ~3000 km.
- The older hour-long ~10 kW m⁻² global pulse [melosh1990; robertson2004] did not include self-shielding.
- Two unmodelled factors could each raise fluxes by ~2×: a reflective submicron dust or rock-vapor cap [johnson2012; toon2016; morgan2013 §6.1], and translucent spherules.
- For the simulation: use Morgan et al. 2013 as the baseline, show the Goldin & Melosh distal envelope, and treat Melosh 1990 as an upper-end, unshielded scenario.

## 4. Fireball (vapor plume): near-field thermal effects

- **Energy.**
  - 1.2–3×10⁸ Mt; 1.5×10⁸ Mt is used in the Morgan model [morgan2013 §2.4, §3.3].
  - 2.8×10²³ J = 6.8×10⁷ Mt for a 20 km/s impact [toon2016 Table 1].
  - "About 10²³ J" [morgan2022 Abstract].
  - These span ~1×10²³–1.3×10²⁴ J. That is a factor of ~10, which depends on the impactor parameters (thread 01/02).
- **Plume physics.**
  - The vapor starts at >100 GPa and >10,000 K. The fireball is opaque until it cools to the transparency temperature: ~2000–3000 K for air, ~6000 K for silicate vapor [collins2005].
  - Plume material is generated within the first ~20 s. The core is initially >10,000 K and cools to ~few hundred–1000 K in ~1 min, with edges >1000 K during the first minute. The rising column is ≲2× the transient-crater diameter, i.e. ≲200 km (Pierazzo et al. 1998, *via* [kring2002 §2.2, §3]).
  - In 3D SOVA at 35 s, the upper plume (projectile + sediment) moves >6 km/s and the lower part ≤2 km/s [artemieva2009 Fig. 2].
  - High-energy ejecta mostly stay within 50,000 km of Earth, but several percent reach ≥100,000 km [kring2002 [34]].
  - A shock-devolatilized CO₂/H₂O "warm fireball" may follow the initial silicate-vapor fireball and carry shocked quartz [alvarez1995].
- **Scaling estimate** (my calculation from Collins et al. 2005, Eqs. 32–35: R* = 0.002 E^(1/3); t = R*/v; τ = ηE/(2πR*²σT*⁴); η = 3×10⁻³, T* = 3000 K):
  - R* ≈ 93 / 131 / 216 km at E = 1×10²³ / 2.8×10²³ / 1.26×10²⁴ J.
  - Maximum radiation at ≈ 5–12 s.
  - Irradiation lasts ≈ 20–47 min.
  - τ scales linearly with η, which is uncertain over 10⁻⁴–10⁻². The duration could therefore lie anywhere from ~1 to ~150 min.
  - These are **extrapolations ~8 orders of magnitude beyond the nuclear-test calibration** (warning in [morgan2013 §3.3]).
- **Ignition radius from the fireball** (contested; extrapolation):
  - ~1250 km (Toon et al. 1997 scaling, *via* morgan2013).
  - ~1500 km (Collins et al. 2005 model, *via* morgan2013).
  - up to 3000 km on a clear day (Shuvalov & Artemieva 2002, *via* morgan2013), reduced to **~2400 km** with E^(1/6) threshold scaling [morgan2013 §2.4, §3.3, §6.4].
  - 1000–1500 km [gulick2019 "Evidence for Fire"].
- **Ground truth:** charred tree trunks in Baja California (~2500 km) formed at 395–1022 °C (median 716 °C) within tens of minutes, before the tsunami arrived. This fits ignition by the plume or by ejecta re-entry [santacatharina2022].

## 5. Wildfires — global vs regional (CONTESTED)

**Evidence for large or global fires**
- The boundary clay holds 0.36–0.58 % graphitic carbon (soot), equal to 0.021 ± 0.006 g cm⁻² globally, or ~10 % of present biomass [wolbach1985].
- Elemental C (mainly soot) is enriched 10²–10⁴-fold at five sites in Europe and New Zealand. It is isotopically uniform and coincides with the Ir layer, which suggests a single global fire that started before the ejecta settled [wolbach1988].
- Mean values at 11 sites are 11 ± 3 mg cm⁻² elemental C and 2.2 ± 0.7 mg cm⁻² soot, giving ~7×10¹⁶ g combusted C (Wolbach et al. 1990, *via* morgan2013 [5]).
- Wolbach's latest numbers as used in models are 56,000 Tg elemental C, of which 15,000 Tg is fine soot; an earlier estimate was 70,000 Tg [bardeen2017 Introduction].
- The "heat-fire" view [robertson2004; robertson2013]:
  - Low charcoal reflects uncorrected sedimentation rates and destruction in firestorms.
  - Uncharred organics come from standing water.
  - Target carbon (≤6×10¹⁶ g within 35 km × 3 km) is 1–2 orders of magnitude too little to supply the soot, at a 3–10 % soot yield.
- Charcoal is present in the Chicxulub crater fill from the **first day** (tsunami- and airfall-delivered) [gulick2019], and charred trees are found in Baja California [santacatharina2022]. Both point to fires near the impact (≤~2500 km) within minutes to hours.

**Evidence against global fires, or for a non-biomass soot source**
- Charcoal at North American non-marine sites is 4–8× below background, and ~99 % of the organic matter is uncharred [belcher2003; belcher2005].
- The pPAH signature points to combustion of hydrocarbons, not living biomass [belcher2009].
- Carbon cenospheres suggest combustion of fossil organic matter in the target; ~10¹⁸ g fossil organic matter was excavated (*via* morgan2013) [harvey2008].
- Target-derived black carbon of 7.5×10¹⁴–2.5×10¹⁵ g circled the globe within hours. The wildfires were "more delayed and protracted" [lyons2020].
- Stratospheric soot of 500–2600 Tg came from the oil-rich target area [kaiho2016].

**Middle position**
- Re-analysis shows that charcoal flux per unit time was not low: 3–7500× higher than background once deposition time is accounted for [morgan2013 §3.1].
- Target combustion yields only 2–2.6×10¹⁶ g of organic C (Model 4), 3–4× less than the black carbon observed [morgan2013 §3.2].
- Fires were therefore **widespread but not global** immediately after impact, with post-impact fires added over months [morgan2013 §6.4, §7].

**Assessment.** Physical modelling [goldin2009; morgan2013; belcher2015] and the North American charcoal record argue against instantaneous global ignition. Proximal fires within ~1000–2500 km are well supported (Gulf/Caribbean margins, Mexico, possibly the southern USA). The soot inventory requires some combination of biomass fires (possibly delayed) and target carbon, and the split between them is unresolved. For T ≤ 24 h, the defensible picture is: fires near the crater and in downrange land areas, scorched or desiccated vegetation elsewhere, and global ignition only as a contested upper-end scenario.

## 6. Distal ejecta transport — contested mechanism

- **Classic view:** spherules condense in the vapor plume and travel ballistically worldwide, concentrated near the crater and at the antipode [kring2002; johnson2012; melosh1990].
- **Newer view:** ballistic transport cannot explain the near-constant 2–3 mm thickness or the presence of basement-derived shocked quartz, which is ejected at <3 km/s.
  - Ejecta re-entering an atmosphere heat it, and the expanding atmosphere redistributes fine ejecta laterally. This is "floating of impact debris", which may redistribute globally within several hours [artemieva2009 §5.5].
  - The ejecta curtain's interaction with the atmosphere makes a dust cloud moving up to 3 km/s that reaches distal sites. 10–30 % of curtain mass stays aloft longer when the size distribution is fine-rich [artemieva2020].
  - The review gives global transport in 4–5 h [morgan2022].
- Implication for the thermal pulse: radiation is emitted where ejecta **re-enter**, not where they finally settle [morgan2013 §1, §2.5].

## 7. Surface / air temperature during the first hours — what exists

**There is no published time-resolved simulation of near-surface air temperature for the first hours that couples the fireball, ejecta re-entry radiation and atmospheric dynamics.** Toon et al. 2016 state: "We are not aware of any simulations of the first few hours after the impact" [toon2016 §2.1.1]. The available numbers are indirect:

- **Upper atmosphere (re-entry layer):**
  - 800–1100 K at ~70 km for several hours (Melosh 1990, *via* robertson2004 p. 762).
  - 1000–2000 K (toon2016 §4 "Implications").
  - Local temperatures >2300 °C estimated from spinel chemistry (Kyte & Bohor 1995, *via* kring2002 [38]).
- **Near-surface air, IR only, far from fuel:** raised by **only ~10 K**, because the atmosphere is largely transparent to the IR (Melosh 1990, *via* robertson2004 p. 763). This is an extrapolation and has not been re-examined by later self-shielding models.
- **Analogy, not a temperature:** "oven set on 'broil' (~260 °C)" describes the radiant flux level of 5–15 kW m⁻² [goldin2009]. It must **not** be shown as an air temperature.
- **Ground surface, inferred from charcoal (North America):** ≤545 °C at any point, not >325 °C for any significant period [belcher2005]. This is contested, because it rests on the charcoal interpretation.
- **Local fire temperatures:** wood charring at 395–1022 °C (median 716 °C) in Baja California [santacatharina2022].
- **Soil:** with the surface held at 1000 K, warming by 1 K at 10 cm depth takes 2–20 h, so burrows >10 cm deep were shelters [robertson2004 p. 763].
- **Global mean surface temperature with global fires prescribed:** +10 °C while fires burn (prescribed at hours 12–36; 4.6×10²² J of combustion heat), falling to ~+2 °C after a week [bardeen2017 SI Fig. S8]. This is conditional on the contested global-fire assumption, and the authors note the spike would be smaller if fires lasted longer.
- Beyond 24 h, the climate shifts to cooling over months to years: −15 °C from dust [senel2023], up to −28 °C over land with 15,000 Tg soot [bardeen2017], and 500–2600 Tg soot scenarios in [kaiho2016].

## 8. Implications for a visual simulation (T = 0 … 24 h)

1. **0–60 s:** a fireball of ~100–200 km radius, brightest at ~5–12 s and cooling below air transparency (~3000 K) over minutes (scaling only). The plume shows a fast upper part (>6 km/s) and a slow, dense lower curtain (≤2 km/s).
2. **1–10 min:** a conical ejecta curtain expanding outward. Proximal blanket deposition: metres to tens of metres at 300–400 km (Albion Island ~16 m) and dm to m at ~500–1000 km.
3. **10–40 min:** a "re-entry front" sweeping outward. Sky glow and a downward IR pulse begin ~10 min at 2000–2500 km and ~33 min at 7000–8000 km.
   - Intensity should be azimuth-dependent: strongest downrange, negligible uprange beyond ~3000 km.
   - Downrange direction is itself contested: SW in Collins et al. 2020 (impact from the NE), NW in Morgan et al. 2006 (uprange to the SE). Offer both or let the user choose.
   - Pulse duration is minutes at any point (self-shielded models). A toggle for the "Melosh 1990 hours-long" scenario is advisable.
4. **Fires:** certain within ~1000–1500 km, likely to ~2400 km, regional downrange beyond that. Global ignition is a contested option. Emphasize scorched or desiccated vegetation outside ignition zones.
5. **1–5 h:** the dust cloud wraps the globe (4–5 h) and the sky darkens. Spherule "rain" falls through hours to days, with millimetre spherules settling in ~1 h from 85 km.
6. **Temperature overlays:** show the upper-atmosphere layer at ~1000–2000 K. Near-surface air should change only modestly in the IR-only case (~+10 K, model-extrapolated), with a local fire-driven increase where fires burn. Do not depict a global "oven" air temperature.
7. **Layer thickness legend:** 10–80+ m (≤400 km), dm–10 m (≤1000 km), 0.5–2 cm (2000–4000 km), 2–3 mm (global).

## 9. Unknowns / open issues (see JSON `openQuestions`)
- Impact azimuth and angle control the thermal-pulse map; they are contested.
- The size distribution and mass flux of ejecta at the top of the atmosphere are unknown, and they control self-shielding.
- The existence of a reflective submicron rock-vapor or nanoparticle cap is unknown; it could double the flux.
- There is no coupled radiative-hydrodynamic simulation of the first hours (toon2016).
- The fireball luminous efficiency η is uncertain by two orders of magnitude.
