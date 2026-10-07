# Thread 02: Crater (groups `crater`, `crust`)

Scope: how the Chicxulub crater formed (contact to about 10 min), what the crater looked like, the peak-ring rocks, the Hole M0077A stratigraphy, and what happened inside the crater during the first 24 h. Parameter values with full locators are in `02-krater.json`. Citations use the source ids `[id]`.

**Certainty labels:** **F** = fact (measured or observed), **E** = extrapolation (model or scaling), **S** = speculation, **C** = contested.

---

## 0. Source access and verification status

| id | What I opened | Use |
|---|---|---|
| morgan2016 | PubMed abstract and the full accepted manuscript (Glasgow Enlighten), including Fig. 1 rendered and inspected | iSALE snapshots at 0, 1, 3, 4, 5 and 10 min; peak-ring lithology, density, Vp, shock |
| riller2018 | PubMed abstract and the full accepted manuscript (Glasgow), including Methods and rendered Fig. 2 | Stage timing in s; snapshots at 0, 20, 184, 340 and 600 s; model set-up |
| gulick2019 | Full text (PMC6765282) | Day-1 sequence, M0077A depths, dam-break resurge |
| collins2020 | Full text (Europe PMC), Supplementary Information PDF, Fig. 2 image | 3D oblique models; crater metrics (Supplementary Table 1); time of maximum uplift |
| kaskes2022 | Full text (NSF PAR) | Suevite units and depths; day-1 timing |
| schulte2021 | Full text (Glasgow, open access) | Thicknesses of the melt sub-units; melt volume and sheet dimensions (as secondary citations) |
| kring2020, goderis2021, lowery2018, schmieder2020 | Full texts (Europe PMC) | Shock pressure, 3-km melt sheet, Unit 1G depths, diameter of 180 km |
| gulick2013, christeson2021, kring1995, rae2019 | **Abstract only** (publisher abstract via the Crossref API; Wiley blocked) | Ring radii, melt, resurge-layer thickness |
| morgan1997, hildebrand1995, morgan2022, gulick2008 | Abstract on nature.com | Transient cavity of about 100 km; diameter of about 180 km |
| sharpton1993, pope1996, kring2016 | PubMed abstracts | Outer rings; surface rings; peak-ring model |
| feignon2020 | Abstract via the HAL API | Shock pressure of 16–18 GPa |
| degraaff2022 | Abstract (VU Amsterdam repository) | Origin of the melt units |
| rae2019data | GitHub iSALE input files (not peer reviewed) | Alternative model set-up |

The following could not be opened and are **not** used as sources: Hildebrand et al. 1991 (Geology), the Expedition 364 Proceedings (behind a Cloudflare challenge), Collins et al. 2002 and 2008, Morgan et al. 2000, Barton et al. 2010, and Gulick et al. 2026 (Marine Geology review). They are listed in `openQuestions`.

---

## 1. Mechanism and sequence (contact to about 10 min, iSALE dynamic-collapse model)

The reference model is the 2D axisymmetric iSALE run of [morgan2016], reprocessed in [riller2018]:

- impactor 14 km in diameter, 12 km/s, 2650 kg/m³, vertical
- 200 m cells, 35 cells per projectile radius
- target: 3 km carbonate, 30 km granite crust, dunite mantle
- run length 600 s [riller2018 Methods]

[collins2020] repeats the run in 3D with oblique impacts (500 m cells, 33 km crust, 16–21 km impactors at 12 km/s or 13–16 km at 20 km/s). It finds that a 45–60° impact from the NE fits the observed asymmetries best.

| Phase | Time after contact | What happens | Basis |
|---|---|---|---|
| Contact, compression, shock | 0 to ~5 s | Shock pressure >10 GPa passes through the future peak-ring rock in less than 5 s. Melt forms where pressure exceeds 60 GPa. | [riller2018] Methods, Ext. Data Fig. 2 (E) |
| Excavation and transient-cavity growth | to ~20–60 s | Bowl-shaped cavity lined with melt. Ejecta curtain overturns. The Moho is pushed down. Pervasive grain-scale fracturing ("T < 30 s"). | [riller2018]; [collins2020] "first minute"; [gulick2013] "within 10 s" (**C**, see §7) |
| Start of collapse | from ~20 s | Cavity floor starts to rebound. Walls slump inward. Cataclasite zones form (20 < T < 150 s). | [riller2018] (E) |
| Central uplift grows and overshoots | ~20–184 s; maximum ~3 min | Crust rises above the pre-impact surface: crest about 10–20 km in the models. The rim collar of sediments slumps inward. | [riller2018] Fig. 2c (184 s); [collins2020] (T≈3 min); [morgan2016] Fig. 1C (E) |
| Central uplift collapses outward | 160–300 s | The over-heightened uplift falls down and outward. Peak-ring rock is thrust over the inward-slumped transient-rim sediments (imbricate thrusting). Pressures in peak-ring rock stay raised (50–100 MPa) from ~100 to 250 s. | [riller2018] (E) |
| Peak ring formed | ~4–5.7 min | Topographic ring at about 35–45 km radius in the 2D model. | [morgan2016] Fig. 1D–E; [collins2020] Fig. 2d; [riller2018] Fig. 2d (E) |
| Melt injected into thrust zones | 250–600 s | Melt is trapped between thrust sheets, as seen at 1220–1316 mbsf. Shear faults stop forming inside it. | [riller2018] (E from core structures) |
| Final crater | ~10 min, then settling | The geometry barely changes after ~5 min. The peak ring spreads slowly under gravity (normal-sense ductile bands). | [morgan2016] Fig. 1F; [riller2018] Fig. 2d inset; [schulte2021] |

**Rock-weakening mechanism.** Acoustic fluidisation is supported by the core [riller2018]: quasi-continuous rock flow early on, then increasingly localised faulting. The block-model parameters used in the simulations, however, imply 100–500 m blocks vibrating at a few Hz. The cataclasite spacing in the core (~3.5 m, or 2.3 m including ultra-cataclasites) implies much smaller blocks. Which parameters are right is **contested**, and this affects model timing by tens of seconds and the overshoot height.

---

## 2. Snapshots for the animated cross-section

Coordinates below were **read by eye from the published figures** (±1–2 km). Radial distance is r; height relative to the pre-impact surface is z (negative = below). They are keyframe guides, not published numbers.

### 2a. Set A: [riller2018] Fig. 2 (same model as [morgan2016] Fig. 1; vertical, 2D)

Base layers: sediments 0 to −3 km (light grey), crust −3 to −33 km, mantle below −33 km.

**T = 0 s**
- Flat surface.
- Impactor sphere with a radius of about 7 km touches the surface at r = 0.
- The future peak-ring parcel lies at r ≈ 10–23 km, z ≈ −7 to −11 km ("depth of 10 km and a radius of 16 km").

**T = 20 s**
- Deep bowl with its floor at z ≈ −28 km on the axis.
- The cavity wall crosses z = 0 at r ≈ 24–25 km.
- The wall continues as a near-vertical overturning curtain to above +20 km.
- The surrounding surface is gently raised (rim uplift).
- The Moho is pushed down to ≈ −37 km beneath the centre.
- The peak-ring parcel sits on the cavity wall at r ≈ 25 km, z ≈ −1 to −9 km.

**T ≈ 60 s** ([morgan2016] Fig. 1B)
- The cavity is still open.
- The floor has already risen slightly, to ≈ −25 km.
- The wall stands at r ≈ 37–42 km and carries a curtain up to +20 km.
- A continuous red melt lining covers the floor and walls.

**T = 184 s** (≈ maximum of the central uplift)
- The central uplift reaches at least +20 km near the axis (thin spikes, which may be numerical).
- Its flank falls through +10 km at r ≈ 12 km and 0 km at r ≈ 20 km.
- An annular depression lies at r ≈ 30–40 km, z ≈ −7 km.
- A wedge of inward-slumped sediment has its tip at r ≈ 40 km, z ≈ −8 km.
- The rim collar is raised to ≈ +2 km at r ≈ 60–70 km.
- The Moho is raised to ≈ −30 km at the centre and slightly depressed (≈ −34 km) at r ≈ 40 km.
- Peak-ring material and a patch of melt sit on the uplift flank at r ≈ 20–32 km.

**T ≈ 240 s** ([morgan2016] Fig. 1D, 4 min)
- The uplift has collapsed to roughly 0 to +3 km near the axis.
- Melt (red) is spreading outward.
- Peak-ring material has moved out to r ≈ 30–37 km.

**T = 340 s**
- The floor lies at ≈ −2.5 km at r = 0.
- The peak ring forms a subdued high at r ≈ 35–42 km, z ≈ −1 km.
- The annular trough is at r ≈ 45–50 km, z ≈ −2 km.
- The outer area at r ≈ 60–75 km stands at about +1 km.
- The sediment wedge runs under the peak ring, with its tip at r ≈ 33–35 km, z ≈ −10 km.
- M0077A lies on the peak ring at r ≈ 40–45 km.

**T = 600 s** (inset)
- Final state.
- Arrows show the peak ring spreading outward.

### 2b. Set B: [morgan2016] Fig. 1 (0, 1, 3, 4, 5, 10 min)

The same model as Set A, with the peak shock pressure of the peak-ring tracers colour-coded from 0 to 60 GPa and melt above 60 GPa shown in red.

- **5 min and 10 min:** a near-final crater. A melt sheet (red) covers r ≈ 0–35 km, about 2–4 km thick, with a deeper root near the axis. Blue peak-ring tracers sit at r ≈ 38–45 km.
- **Fig. 1G:** the depth-converted seismic profile Chicx-R3 shows the real equivalent:
  - Cenozoic cover about 1 km thick
  - peak ring at r ≈ 40–52 km
  - Mesozoic slump blocks dipping beneath its outer edge
  - crystalline basement deeper than ~5–9 km

### 2c. Set C (oblique, 3D): [collins2020] Fig. 2

Impact at 60°, 17 km impactor, 12 km/s; x is positive uprange, and the impact comes from the right.

**T = 20 s**
- Cavity about 60 km wide at z = 0, with its floor at ≈ −31 km.
- The downrange curtain rises above +25 km; the uprange curtain only to about +10 km.
- The Moho is pushed down to ≈ −38 to −40 km.

**T = 180 s**
- The central uplift crest reaches ≈ +10 km and is shifted and tilted downrange.
- Annular depressions lie at x ≈ −40 and +30 km, both about −8 km deep.
- There is a rim bulge of about +3 km downrange.

**T = 300 s**
- The floor lies at about −2 to −3 km.
- Peak-ring tracers sit at x ≈ −40 and +20 to +30 km; the peak-ring centre is offset downrange by about 5% of the crater diameter.
- Troughs at about −5 km lie outside the peak ring.

**Supplementary Table 1** (crater metrics):

| Quantity | Value |
|---|---|
| Apparent crater diameter | 120–152 km |
| Transient crater diameter | 72–91 km |
| Peak-ring diameter | 67–71 km (inner 45–57, outer 80–89 km) |

These model diameters are smaller than the observed values.

### 2d. Recommended keyframes

The model geometry is a guide, not a measurement.

| key | t (s) | state |
|---|---|---|
| K0 | 0 | contact |
| K1 | 20 | growing cavity, about 25–30 km radius and 28–31 km deep, with the curtain |
| K2 | 30–60 | transient cavity at its maximum (about 100 km across in geophysics, 72–91 km in 3D models); floor starts to rise |
| K3 | 180 | central uplift at its maximum, 10–20 km above the surface |
| K4 | 240 | uplift collapsing, material moving outward |
| K5 | 300–340 | peak ring formed |
| K6 | 600 | final crater; slow spreading afterwards |

For the 3D or oblique option, use Set C (60°, from the NE).

---

## 3. Final crater geometry: elements to draw

**Centre:** 21.29° N, 89.53° W [collins2020]. Morgan 2016 used 21.30° N, 89.54° W. The peak-ring centre is offset about 7.6 km to the SW and the mantle-uplift centre about 9.3–10 km to the NNE [collins2020 SI Fig. 1].

| Element | Radius or size | Certainty | Source |
|---|---|---|---|
| Central basin with coherent melt sheet | melt lens about 65 km wide, 2.2–4.4 km thick (<3 km in the Gulick 2013 abstract); >500 m seismically mapped; 70–75% of all melt | E/C | [schulte2021] (citing Barton 2010), [gulick2013], [christeson2021] |
| Peak ring | radius about 40–45 km (diameter ~80–90 km, derived); width ~10 km where high, ~15 km where low; relief ~400 m above the crater floor (500 m in the dam-break set-up); thin intermittent melt cap | F/E | [morgan2016], [kring2020], [christeson2021], [gulick2019] |
| Annular trough | between the peak ring and the terrace zone; ~500 m of melt near the peak ring, thinning outward | E | [christeson2021] |
| Terrace zone | slump blocks of Mesozoic sediments stepping down from the inner rim into the annular trough; the innermost blocks lie under the outer edge of the peak ring | F (seismic) | [gulick2013], [morgan2016] |
| Inner rim | 70–85 km radius | F | [gulick2013] |
| Crater "diameter" | about 180 km (gravity-gradient and cenote ring) or about 200 km (Expedition literature) | C | [hildebrand1995], [kring1995], [morgan2016], [gulick2019] |
| Cenote ring (surface) | about 83 km radius | F | [pope1996] |
| Outer ring faults | out to 130 km radius (sets at 70–130 km) | F | [gulick2013] |
| Outer ring of the multi-ring basin | about 240–300 km diameter | C | [kring2020], [pope1996], [sharpton1993] |
| Rim gap to the NNE | opening toward the deep pre-impact basin, water up to ~2 km deep | E | [gulick2019], [kaskes2022], [gulick2008] |
| Crater floor depth on day 1 | "600- to 1,000-m-deep" | E | [gulick2019] |
| Deep structure | central structural uplift >10 km; Moho raised by 1–2 km | E/F | [gulick2013] |

The final crater is very flat: about 200 km wide but only about 1 km deep. Any cross-section of the final state needs vertical exaggeration; [morgan2016] Fig. 1G uses about 2.5×. During the first ~3 min the relief is tens of kilometres, so no exaggeration is needed then. A cross-fade of the exaggeration from 1× to about 5–10× after ~300 s, with a visible label, is recommended.

---

## 4. Peak ring: rocks, origin and shock

**Rock types** [morgan2016; riller2018; degraaff2022; kring2020]:
- Coarse-grained, alkali-feldspar-rich granitoid, locally aplitic, pegmatitic or syenitic.
- Pre-impact mafic and felsic sheet intrusions: dolerite, dacite, felsite, aplite and pegmatite dikes.
- Impact-generated dikes of melt rock and breccia.
- A thick zone of mingled melt rock and fault breccia at 1220–1316 mbsf, interpreted as melt trapped in a thrust zone.

**Deformation** (all F):
- pervasive fractures
- cataclasite and ultra-cataclasite
- 602 striated shear faults
- shatter cones in pre-impact dikes at 1129–1162 mbsf
- planar deformation features (PDFs) in quartz (up to 4 sets)

**Physical properties** (F) [morgan2016]:
- Density 2.10–2.55 g/cm³ (mean 2.41).
- Vp 3.5–4.5 km/s (mean 4.1).
- Both are anomalously low for granite because of fracturing and porosity.

**Origin depth** (E):
- Mid-crust at about 8–10 km [morgan2016], about 10 km [riller2018], or 10–12 km (mean, for 45–90°) [collins2020].
- The only observational constraint is that the rock comes from deeper than 3 km: it differs from the basement found just below the sediments in nearby wells.
- The rock travelled more than 20 km during cratering [morgan2016].

**Shock pressure** (F):
- About 16–18 GPa (963 PDF sets, slight decrease with depth) [feignon2020].
- About 15–20 GPa [kring2020].
- The preliminary estimate of 10–35 GPa [morgan2016] is superseded.
- This implies post-shock heating of about 170 °C; the melt was superheated above 1700 °C [kring2020, citing Abramov & Kring 2007].

**Formation model:** dynamic collapse is confirmed [morgan2016; riller2018]. The nested melt-cavity hypothesis does not predict basement lying above sediments and was rejected for Chicxulub. The Displaced Structural Uplift model [kring2016] is compatible with this.

---

## 5. Hole M0077A stratigraphy (mbsf) for the animated column

The site is at 21.45° N, 89.95° W, about 45.6 km from the centre [morgan2016]; other authors give ~40 km [kring2020; kaskes2022]. Core runs from 505.70 to 1334.73 mbsf [gulick2019].

| Unit (scheme) | Top | Base | Thickness | Notes | Source |
|---|---|---|---|---|---|
| Unit 1: post-impact sedimentary rock (incl. 1G) | 505.70 | 617.33 | 111.63 m | Paleogene pelagic/hemipelagic | [gulick2019] |
| Subunit 1G "transitional unit" | 616.58 | 617.33 | 0.75 m | micrite to claystone; deposited over weeks to years; Ir layer near the top (~616.55–616.60) | [goderis2021], [lowery2018], [kaskes2022] |
| Unit 2: suevite (Expedition scheme) | 617.33 (617.34) | 721.62 | 104.28 m | | [gulick2019] |
| tsunami layer (part of Unit 2A) | 617.34 | 617.44 | 0.10 m | unidirectional cross-bedding; perylene and PAH peak; charcoal just above | [gulick2019] |
| seiche interval (Unit 2A, ~25 graded beds) | 617.34 | 627 | ~9.7 m | | [gulick2019] |
| bedded suevite (Kaskes scheme) | 617.33 | 620.88 | 3.5 m | well sorted, bedded; seiche-dominated | [kaskes2022] |
| graded suevite | 620.88 | 710.01 | 89 m | fining upward; resurge settling | [kaskes2022] |
| resurge-crest interval (Gulick) | 698 | 706 | 8–10 m | more rounding and sorting; low sonic velocity | [gulick2019] |
| non-graded suevite | 710.01 | 715.60 | 5.6 m | hyaloclastite-like; melt-water interaction; reversed palaeomagnetic signal like the melt rock below | [kaskes2022] |
| Subunit 2C top (Expedition) | 712.83 | 721.62 | | melt-rich "suevite" | [kaskes2022] citing Expedition report |
| brecciated impact melt rock (Kaskes reclassification) | 715.60 | 721.62 | 6 m | reclassified from 2C to 3A | [kaskes2022] |
| Unit 3: impact melt rock (3A over 3B) | 721.62 | 747.02 | 25.41 m | 3A/3B boundary at 737.56; green schlieren come from seawater interaction | [gulick2019], [kaskes2022] |
| Unit 4: shocked granitoid basement with dikes | 747.02 (Morgan 2016: 748) | 1334.73 (TD) | ~588 m | | [kaskes2022], [gulick2019], [kring2020] |
| mingled melt rock and fault breccia zone within Unit 4 | 1220 (1250) | 1316 | | thrust zone | [riller2018], [morgan2016] |

Discrepancies (all of 1 cm to 1 m): 617.33 vs 617.34; 747.02, 747.03 and 747.14; 748 for the top of the basement in Morgan 2016.

[schulte2021] divides the melt sequence into 3B (21.61 m), 3A (16.39 m), 2C-2 (5.65 m) and 2C-1 (2.72 m), 46.37 m in total. This sum does not fit a base at 747.02 mbsf and is unresolved.

---

## 6. The first day inside the crater

**Within minutes**
- The fluidised basement forms the peak ring (~5 min).
- Melt drapes the rising and collapsing central uplift and peak ring. Melt drains off the highs and ponds in depressions on the peak ring; M0077 sits in such a depression [schulte2021].
- **E**

**Within tens of minutes (≈5–30 min)**
- About 40 m of melt rock and melt-rock breccia (Units 3 and 2C) caps the peak ring. It was emplaced quickly and stayed above 580 °C: the palaeomagnetic inclinations are uniformly negative [gulick2019].
- An initial, debris-poor incursion of seawater arrives at M0077 in less than 30 min [kaskes2022]. It quench-fragments the hot melt (phreatomagmatic melt-water interaction; Kelvin–Helmholtz mingling [schulte2021]). The result is the 5.6 m non-graded suevite and the brecciated top of the melt.
- **E**

**30–60 min**
- The main resurge enters through the NNE rim gap from the deep (~2 km) pre-impact basin and crests the peak ring, depositing ~8–10 m of sorted layer at 698–706 mbsf.
- Timing comes from a simplified 1D dam-break model (h0 = 0.5–2 km; flooding to the peak-ring level, "500 m above the crater floor", in 30–60 min if the water at the rim was deeper than 1 km). It neglects drag and the interaction of water with melt, both of which could delay flooding [gulick2019]. Complete flooding took longer.
- **E**

**Hours**
- Settling in the flooded crater, with seiches driven by aftershocks and slumping, forms the 80–89 m graded suevite and then the bedded suevite with about 25 graded beds.
- The erosional contact at 642.57 mbsf is attributed to a gravity flow [gulick2019]. [kaskes2022] notes an abrupt drop in clast size at ~642 mbsf.
- **S** for any specific hour. Only "hours" is supported.

**Within 24 h**
- The reflected rim-wave tsunami returns and leaves the 10 cm cross-bedded layer, which is enriched in terrestrial perylene and PAHs and carries reworked Maastrichtian foraminifera.
- Charcoal sits about 4 cm above it in basal 1G.
- Tsunami models put arrival on the far side of the Gulf at 2–3 h after impact, so the return is within the first day [gulick2019].
- **S/E**

**Total thickness of day-1 deposits**
- At M0077: about 130 m (617.33–747.02 mbsf) [gulick2019; kring2020]. **F** for the thickness.
- Across the crater: the seismically mapped graded-suevite (resurge) layer averages 187 ± 58 m and is roughly uniform over the annular trough, peak ring and central basin. So the resurge was energetic enough to carry debris across the whole peak ring [christeson2021].
- [gulick2013] (abstract) states that slope collapse, ejecta, ground surge and tsunami filled the annular trough and annular basin with sediment up to 3 km and 900 m thick respectively. The timing is not stated and probably extends far beyond day 1.

**After day 1 (context only)**
- The transitional unit took weeks to years.
- The Ir-rich dust settled within about 20 years [goderis2021; kaskes2022].
- Life returned within years [lowery2018].
- A long-lived hydrothermal system altered about 1.4 × 10⁵ km³ of crust. The thermal model cited by [kring2020] gives crater-wide activity lasting about 1.5–2.3 Myr.

---

## 7. Disagreements

Full detail is in the JSON.

1. **Crater diameter** (180, 200, or 240–300 km): mostly a question of which ring is defined as the rim.
2. **Transient-cavity timing:** 10 s [gulick2013] vs < 30 s [riller2018] vs ~1 min [collins2020; morgan2016]. The snapshots favour about 20–60 s.
3. **Transient diameter:** ~100 km from geophysics vs 72–91 km in the 3D models.
4. **Peak-ring diameter:** ~80–90 km from observations vs 67–71 km in the 3D models; no opened source states one value.
5. **Overshoot height:** ≥ 15–20 km in 2D vs ~10 km in 3D; this is model-dependent.
6. **Weakening mechanism parameters:** the acoustic-fluidisation block size implied by the core and by the models differs.
7. **Shock pressure:** the preliminary 10–35 GPa range was refined to 16–18 GPa.
8. **Melt-sheet thickness:** <3 km, 2.2–4.4 km, 3–7 km (including breccia), or >500 m (seismic lower bound).
9. **Time of water arrival:** <30 min (first incursion) vs 30–60 min (resurge crest). Largely compatible.
10. **Unit boundaries at M0077A:** classification schemes differ.

---

## 8. Unknowns

- Exact transient-cavity depth and uplift height. These were only read from figures. Rerunning the model would need the original iSALE output or the public input files (the Rae 2019 inputs, 12 km impactor at 15 km/s).
- A primary measured peak-ring diameter and relief map. The likely sources are Morgan et al. 2000, the full text of Gulick 2013, and Gulick et al. 2026; none was opened.
- The volume of the central melt sheet and the depth to its base; the central basin has never been drilled.
- The 3D pattern of resurge through the NNE gap. The day-1 interpretations rest on a single drill site.
- Absolute times within "hours" and "within a day".
- The water depth over the crater site before the impact. This belongs to the ocean/tsunami thread; here only the ~2 km NE basin and the 0.5–2 km dam-break heights are available.

---

## 9. Implications for the visual simulation

1. **Use one coherent model for the 0–600 s cross-section.** The [morgan2016]/[riller2018] run (2D, vertical) has published snapshots at 0, 20, 60, 180–184, 240, 300, 340 and 600 s. Interpolate between them. Label all of this as "model". For an oblique option use [collins2020] Fig. 2 (60° from the NE: tilted uplift, curtain higher downrange, peak-ring centre offset about 5 km downrange).

2. **Layers and colours that follow the papers:**
   - 0–3 km sediments (carbonate and evaporite) in light grey or sand
   - crust down to 33 km
   - mantle
   - melt in red (shock above 60 GPa)
   - peak-ring parcel tracked from 8–12 km depth, coloured by peak shock pressure (16–18 GPa when it lands)

3. **Overshoot height:** draw 10–20 km with a visible uncertainty band. Do not present the axial spikes as real.

4. **After about 5 min, switch to the day-1 view:**
   - final topography with exaggeration
   - a melt pond in the central basin, 2–4 km thick and about 65 km wide
   - a thin melt cap on the peak ring
   - resurge entering from the NNE gap at about 30–60 min
   - the column at M0077A filling bottom-up: melt (~40 m) → non-graded suevite (5.6 m) → resurge crest (~8–10 m) → graded suevite (~89 m) → bedded suevite or seiche beds (3.5–10 m) → tsunami layer (10 cm) before 24 h

   The 1G cap (75 cm) is post-day-1.

5. **Show the timing uncertainty bands** from the JSON (`time.range`) rather than single times, especially after 10 min.

6. **Present-day versus day-1 geometry:** present-day depths below seafloor (for example the peak-ring top at 617 mbsf) include ~600 m of later Cenozoic burial. For day 1, place the peak-ring crest about 400 m above a crater floor that is 600–1000 m deep.
