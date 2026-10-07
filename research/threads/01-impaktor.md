# Thread 01 — Impactor, target, site, energy (Chicxulub, K-Pg)

Window: T = 0 (first contact) to T+24 h. This thread covers the *initial conditions*: when, what, how big, how fast, from where, into what.
Certainty tags: **[F]** fact (measured), **[E]** extrapolation (model/scaling on known mechanisms), **[S]** speculation, **[C]** contested.
Source ids refer to `01-impaktor.json`. All numbers were read by me in the source itself (abstract or full text) unless marked "via X".

---

## 1. Summary for the simulation (baseline scenario)

| Quantity | Baseline | Plausible range | Tag | Main sources |
|---|---|---|---|---|
| Age | 66.052 Ma | ±0.043 Ma (full) | F | sprain2018, renne2018, sprain2015 |
| Season | boreal spring | spring–summer | E | during2022, depalma2021 |
| Impactor type | carbonaceous-type asteroid (CM/CR-like) | — | E | fischergodde2024, shukolyukov1998, kyte1998, desch2022 |
| Diameter (crater-scaled) | 13 km | 12.2–18 km | E | collins2020, artemieva2017, artemieva2009 |
| Diameter (Ir budget) | ~10 km | 8–12 km | E | alvarez1980, artemieva2009 |
| Bulk density | 2630 kg/m³ | 2385–2680 kg/m³ | E | collins2020, artemieva2009, christeson2009 |
| Mass | 3.0×10¹⁵ kg | 2.4–8.0×10¹⁵ kg | E | computed from collins2020; artemieva2017 states 2.5×10¹⁵ |
| Speed | 20 km/s | 12–20 km/s (min. 11.2) | E | collins2020, artemieva2017 |
| Angle (from horizontal) | 60° | 45–60° | C | collins2020, morgan2006 vs schultz1996 |
| Arrival azimuth (from) | NE (~45°) | 0–90° | C | collins2020 vs schultz1996, morgan2006 |
| Kinetic energy | ~6×10²³ J (~1.4×10⁸ Mt) | 4×10²³–3.4×10²⁴ J | C | computed from collins2020/artemieva2017; pope1997 |
| Sediment cover | 3 km | 2.8–4.0 km | F | collins2020, artemieva2017, kring2004 |
| Evaporite fraction | ~0.43 | 0.27–0.5 | C | gulick2019, artemieva2017 |
| Crust to Moho | 33 km | 30–33 km | E | collins2020, christeson2009 |
| Water depth | ramp: <50 m (S) → 1.5–2 km (NE) | 100–2000 m in impacted area | C | kaskes2023, artemieva2017, artemieva2009 |
| Crater centre (today) | 21.29° N, 89.53° W | — | F | collins2020 (after hildebrand1995) |
| Final crater diameter | ~180 km | 180–200 km | F | hildebrand1995, christeson2009, gulick2019 |
| Transient crater | ~100 km, within ~10 s | 72–100 km; 10–60 s | E | morgan1997, gulick2013, collins2020 |
| Paleolatitude | ~27° N | — | E | derived from gulick2019 inclination −46° |

---

## 2. Age and season (event.*)

- **Boundary / impact age [F].** Most precise published K-Pg age: **66.052 ± 0.008 (analytical) / ± 0.043 Ma (full)** — ⁴⁰Ar/³⁹Ar on sanidine from the IrZ tephra in Montana, within ~1 cm of the impact claystone [sprain2018, Abstract]. Direct dating of Chicxulub ejecta: glassy spherules from Gorgonilla Island (Colombia), **66.051 ± 0.031 Ma** [renne2018, Abstract]. Earlier pooled value 66.043 ± 0.010/0.043 Ma [sprain2015, Abstract]; Renne et al. showed impact and boundary to be synchronous within 32 kyr [renne2013, Abstract].
- **Superseded values**: 64.98 ± 0.05 Ma (melt rock) / 65.01 ± 0.08 Ma (Beloc tektites) [swisher1992] and ~65.95 Ma [kuiper2008] differ mainly through the age standard / calibration. They agree with the modern ages once recalibrated; do not use them as alternatives.
- **Not verified**: U-Pb ages (Clyde et al. 2016) — metadata only (see open questions).
- **Season [E].** Boreal spring [during2022]; boreal spring/summer [depalma2021]. Both are based on fish killed at Tanis (North Dakota, ~50° N paleolatitude). The two studies are independent and broadly agree. **Time of day: no constraint at all.**

---

## 3. Impactor (impactor.*)

### 3.1 Composition and origin
- **Carbonaceous-type asteroid [E, strongly supported].** Three independent geochemical lines agree:
  - Ru isotopes from three K-Pg sites show a carbonaceous-type asteroid that formed beyond Jupiter's orbit [fischergodde2024, Abstract].
  - Cr isotopes (Stevns Klint, Caravaca) match a carbonaceous chondrite [shukolyukov1998, Abstract].
  - A 2.5-mm fossil meteorite from the North Pacific K/T boundary is carbonaceous-chondrite-like. Its survival suggests a low (asteroidal) impact speed [kyte1998, Abstract].
- **Subtype [C].** Desch et al. summarise the evidence. The fossil meteorite allows CV/CO/CR or possibly CM, but not CI. ε⁵⁴Cr points to CM-like material (CR/CH/CB have the same ε⁵⁴Cr). PGE ratios favour CM or CO and rule out CI. Overall: **CM or CR** [desch2022, "Geochemical arguments"]. The primary ε⁵⁴Cr and PGE papers were not opened (see open questions).
- **Comet vs asteroid [C → asteroid strongly favoured].** Siraj & Loeb proposed a fragment of a long-period comet that broke up near the Sun, with D ≈ 7 km [siraj2021]. Desch et al. rebutted this: a comet would deliver only ~4% of the observed Ir, Chicxulub-scale comet impacts recur on timescales >2 Gyr, and the comet population does not match CM/CR [desch2022]. The 2024 Ru data also point to an asteroid.
- **Source family [C].** The Baptistina-family hypothesis [bottke2007] is weakened by spectroscopy: 298 Baptistina looks S-type-like, with olivine/pyroxene and albedo ~20% [reddy2009]. The source region remains open.

### 3.2 Size and mass
- **Crater-scaled diameter [E].** Size is never measured directly. It is the value that reproduces the seismically constrained crater (transient cavity ~90–100 km) for an assumed speed, angle and density.
  - Collins et al. 2020 (iSALE3D, ρ = 2630 kg/m³) [collins2020, SI Table 1]:
    - at 20 km/s: **12 / 13 / 14 / 16 km** for 90 / 60 / 45 / 30°;
    - at 12 km/s: 16 / 17 / 18 / 21 km.
  - Artemieva & Morgan 2017: **12.2 km** at 60°, 18 km/s, 2.6 g/cm³, mass 2,500 Gt [artemieva2017, §4].
  - Artemieva & Morgan 2009: 12 km (90°), 14.4 km (45°), 16 km (30°) at 18 km/s [artemieva2009, §3].
  - Goderis et al. 2021 quote "approximately 12 km" (citing Collins 2020) [goderis2021].
  - Christeson et al. 2009 ran 10, 14 and 20 km bodies at 12 km/s to test Moho deformation [christeson2009].
- **Geochemical diameter [E].** Alvarez et al. 1980: **10 ± 4 km** [alvarez1980]. Artemieva & Morgan 2009 redo the calculation [artemieva2009, §2]:
  - global Ir 2.0–2.8×10⁸ kg, Ir 500 ng/g, globally dispersed fraction 0.22–0.5;
  - this gives 0.8–2.5×10¹⁵ kg, i.e. **8–12 km** at 2600 kg/m³;
  - they note this is "too small to produce the 180–200 km diameter Chicxulub crater".
  - Os isotopes agree with the Ir-based size to within 50% [paquay2008; their numerical value was not read].
- **Mass (computed) [E].** Baseline 3.0×10¹⁵ kg (Collins 60°/20 km/s). The scenario range is 2.4–8.0×10¹⁵ kg. Collins notes that for a fixed *mass* the results barely depend on the assumed density.

### 3.3 Density [E]
- **The real bulk density is unknown.** Collins et al. state that the bulk porosity is undetermined [collins2020, Methods].
- **Model values**:
  - 2600 kg/m³, described as "typical for large asteroids with a porosity of 20–30%" [artemieva2009];
  - 2630 kg/m³ (SI Table 1) vs 2650 kg/m³ (Methods text) in the same paper [collins2020] — an internal inconsistency;
  - 2680 kg/m³ [christeson2009, Table 1].
- **Meteorite analogues**:
  - Murchison (CM2) bulk density is ~10% below 2650, i.e. ~2385 kg/m³ (computed from Collins' statement);
  - CM/CR meteorites average ~23% porosity [macke2011, Abstract].
- A rubble-pile macroporosity would lower the bulk density further [S — no Chicxulub-specific constraint].

### 3.4 Speed [E]
- **No observation constrains the speed.** Collins uses 20 km/s as the "more probable" value, "close to Earth's mean and median asteroid impact speed" (citing Le Feuvre & Wieczorek 2011, not opened). About 25% of impacts are slower than 15 km/s. The minimum is the escape velocity, 11.2 km/s [collins2020, Results/Methods].
- **Other model choices**: 18 km/s [artemieva2009, artemieva2017]. Pierazzo et al. used 20 km/s for an asteroid and 50 km/s for a comet [pierazzo1998].
- **Comet speeds (~50 km/s) are disfavoured** by the composition evidence.

### 3.5 Angle and direction [C]
- **Steep, from the NE** [collins2020]. 3D models compared with geophysics give **45–60°, preferred ~60°, arriving from the NE (northeast-to-southwest)**; angles below 30° are ruled out.
  - The diagnostic offsets are measured from the nominal centre: mantle-uplift centre ~10 km NNE (uprange for 60°); peak-ring/central-gravity centre ~7.6 km SW (downrange) [collins2020, Fig. 1, Fig. 5, SI Fig. 1].
  - Bearings computed from Collins' coordinates: ≈ 6° and ≈ 223°.
- **Steep, possibly from the SE**: angle >45°, with a possible uprange direction to the SE ± 45°. Based on shocked-quartz shock level and near-symmetric distal shocked-quartz sizes [morgan2006].
- **Shallow, from the SE**: **20–30°, from the SE toward the NW**, based on geophysical asymmetries [schultz1996].
- **From the SW**: Hildebrand et al. 1998 (LPSC abstract, *not peer-reviewed*; known only via collins2020).
- **Caveat**: the crater's asymmetry correlates with pre-existing undulations of the end-Cretaceous shelf, so the trajectory cannot be read from structure alone [gulick2008, Abstract].
- **Baseline for the simulation**: 60° from the NE (azimuth ~45° as a cardinal value, not a fitted one). Flag it as contested.
- **Base rates**: 1/4 of impacts are steeper than 60° and 1/15 steeper than 75° [collins2020]; 50% fall between 30 and 60° [artemieva2017].

### 3.6 Atmospheric entry (no published Chicxulub number → compute)
- No Chicxulub-specific entry duration was found. Shuvalov & Artemieva modelled "the flight through the atmosphere" but give no number in the part I read [shuvalov2002]. Artemieva & Morgan mention only a "short entry time" [artemieva2009].
- **Computed here [E]**:
  - Time from 100 km altitude to the surface, t ≈ h/(v·sin θ): ≈ 5.8 s at 20 km/s and 60°. Range ≈ 2.5–17 s across 50–100 km starting altitude, 12–20 km/s, 30–90°.
  - At 60° the 100-km entry point lies ~58 km horizontally NE of ground zero (100 km for 45°).
  - The air column (~1.0×10⁴ kg/m²) is ~0.05% of the impactor's column mass, so deceleration and ablation are negligible. The body arrives at essentially full speed.
  - The body (12–17 km) is larger than the atmospheric scale height (~8 km): the leading face touches the sea while the trailing face is still ~10–15 km up.
  - Contact-to-full-penetration time is ~D/v ≈ 0.65 s (13 km, 20 km/s) to 1.4 s (17 km, 12 km/s).

---

## 4. Energy (energy.*) [C]
- **Explicit literature value**: 0.7–3.4×10³¹ erg = **0.7–3.4×10²⁴ J** [pope1997, Abstract]. This predates the 3D models and drilling constraints.
- **From modern scenario parameters** (E = ½mv², computed here):
  - Collins 60°/20 km/s: **6.05×10²³ J**;
  - Collins 45°/20 km/s: 7.6×10²³ J;
  - Collins 60°/12 km/s: 4.9×10²³ J;
  - Collins vertical: 4.1–4.8×10²³ J;
  - Collins 30°: 0.9–1.1×10²⁴ J;
  - Artemieva 2017 (2,500 Gt, 18 km/s): 4.05×10²³ J;
  - Artemieva 2009 (45°, 18 km/s): 6.6×10²³ J.
- **Collins et al. conclude that earlier kinetic-energy estimates from 2D vertical simulations need no dramatic revision for a ~60° angle** [collins2020, Implications; paraphrased]. The best-supported range is therefore ~5–8×10²³ J (~1.2–1.9×10⁸ Mt TNT).

---

## 5. Target (target.*)

- **Sedimentary cover [F]**: ~3 km on average [collins2020]; "3 km-thick carbonate platform" [kring2004]. It varies laterally: 3.8 ± 0.2 km west of the centre, ≥2.8 km to the south (well Y-2), and 3.3–3.5 km assumed for the SW [artemieva2017, §4].
- **Lithology [C]**:
  - Gulick 2019: 30–50% evaporites. The Yaxcopoil-1 slump block holds 27% anhydrite and >70% carbonate; the deeper target may hold 49–60% anhydrite [gulick2019].
  - Artemieva 2017 two-layer scenario: upper half 75% calcite / 25% anhydrite, lower half 40% / 60% (mean ≈ 0.43 anhydrite, computed) [artemieva2017].
  - The M0077 peak-ring suevite contains <1% evaporite. Interpretations: non-linear (more efficient) degassing, or preferential export of non-porous evaporite clasts [gulick2019].
  - Kaskes et al. argue that CO₂ back-reaction means current models overestimate CO₂ release [kaskes2023, Abstract]. This matters for the gas thread.
- **Water depth [C]**: the target was a **carbonate ramp deepening to the NE**.
  - <50 m south of the impact site; **100–2,000 m within the impacted area** [kaskes2023, citing gulick2008 and Snedden & Galloway 2019].
  - "Fairly shallow sea… up to 1.5 km deep to the northeast of the point of impact", modelled as a water layer R/4 ≈ 1.5 km [artemieva2017, §4].
  - ">2 km water" in the N/NE quadrant [artemieva2009]; "struck in shallow water" [range2022, Abstract].
  - **The ground-zero depth is not fixed by the sources I read.** The JSON baseline of 1500 m is Artemieva's modelled upper case, not a measured value. The simulation should use a spatially varying ramp.
  - The water layer is thin relative to the impactor (D/H ≳ 6–100): it barely affects cratering but supplies steam and water. In the R/4 case the ejected steam is ~0.8 of the projectile mass and the ejected water ~0.67 [artemieva2017, §3].
- **Crust [E]**:
  - Models use 3 km of sediment + 30 km of crystalline crust over mantle [christeson2009; artemieva2009], or 33 km of crust including the tracer-tracked sediments [collins2020, Methods].
  - The observed Moho is upwarped 1.5–2 km at the centre and depressed 0.5–1 km at a radius of 30–55 km [christeson2009, Abstract].
- **Densities for scaling [E]**:
  - granitic crust 2630 kg/m³ and dunite mantle 3310 kg/m³ [collins2020, SI Table 1];
  - non-porous calcite 2600 kg/m³ and wet porous (20%) calcite 2280 kg/m³ [artemieva2017].

---

## 6. Site (site.*)

- **Nominal crater centre [F]**: **21.29° N, 89.53° W**. It is the geometric centre of the rim, defined by the horizontal-gravity-gradient maximum and the cenote ring [collins2020, Fig. 1; hildebrand1995].
  - Central gravity high: 21.24° N, 89.58° W.
  - Maximum mantle uplift: 21.38° N, 89.52° W.
- **Diameter [F, definition-dependent]**:
  - ~180 km [hildebrand1991; hildebrand1995];
  - 180–200 km [christeson2009; artemieva2009];
  - ~200 km [gulick2019; ormo2021];
  - Gulick 2013: inner rim at 70–85 km radius, outer ring faults at 70–130 km radius [gulick2013].
- **Transient crater [E]**: ~100 km [morgan1997]; 50 km radius "within 10 s" [gulick2013]; "within tens of seconds" [gulick2019]. Coarse 3D runs give 72–91 km [collins2020, SI Table 1].
- **Paleolatitude [E]**: the expected C29r inclination is ~−46° [gulick2019]. With the dipole formula this gives ≈ 27° N (computed). Cross-check against the paleogeography thread.

---

## 7. First-minutes sequence relevant to this thread

These times are model-based [E] unless stated.

| t after contact | Event | Source |
|---|---|---|
| −(3…17) s | Bolide crosses the atmosphere from ~100 km altitude; bow shock; no significant deceleration | computed (§3.6) |
| 0 | Leading face contacts the sea surface at ground zero (ramp; depth hundreds of m to ~1.5 km) | definition |
| 0 → ~1 s | Projectile penetrates water and sediments; shock wave; impactor and near-field target vaporise and melt | computed D/v; collins2020 |
| ≤10 s → tens of s | ~100-km transient cavity, lined with melt; target down to the Moho is involved | gulick2013, gulick2019, christeson2009 |
| ~3 min | Maximum central uplift, then collapse | collins2020, Methods ("T ≈ 3 min") |
| ~5 min | Crater essentially formed; peak ring present | collins2020, Fig. 2–3 (simulations to 5 min) |
| tens of min | Peak ring covered by ~40 m of melt-rich breccia | gulick2019 |
| 30–60 min | Resurge crests the peak ring (if water at the rim is >1 km) | gulick2019 (dam-break model) |
| within 1 day | Reflected rim-wave tsunami re-enters the crater | gulick2019 |

The last four rows belong to the crater and tsunami threads; they are listed only to anchor the timeline.

---

## 8. Implications for a visual simulation

1. **Trajectory**: descend from the NE at ~60°, i.e. over the Gulf of Mexico. At 20 km/s the vertical speed is ~17.3 km/s and the horizontal speed ~10 km/s. Expose the angle (45–60°) and azimuth (NE quadrant) as controls. Keep the 20–30°/SE alternative as a labelled "contested" option.
2. **Scale cue**: the body (≈13 km) is bigger than the atmospheric scale height. It should look like a mountain falling through a thin skin of air, not a meteor burning up. There is no meaningful ablation.
3. **The entry is very short** (≈6 s from 100 km). If the passage is to be visible, show it in slow motion and label it so.
4. **The sea is a thin film** relative to the impactor. At t=0, render a ramp (shallow S/SW, deeper NE), not a deep ocean.
5. **Use the composition label "carbonaceous asteroid"**: dark (low-albedo, CM/CR-like). This is consistent with the evidence; colour and albedo of the actual body remain [S].
6. **Season and time of day**: boreal spring is supported. Time of day is a free artistic choice and must be labelled as such. Paleolatitude ~27° N (to be confirmed).
7. **Energy readout**: show ~6×10²³ J (~1.4×10⁸ Mt TNT) with a range of 4–8×10²³ J. The older 10²⁴ J values are not the current baseline.

---

## 9. Disagreements (short) — details in JSON

- Angle/azimuth: steep NE [collins2020] vs shallow SE [schultz1996] vs steep with possible SE uprange [morgan2006]; target heterogeneity caveat [gulick2008]. Steep is well supported; the azimuth is weak.
- Size: crater-scaled 12–18 km vs Ir-based 8–12 km [artemieva2009].
- Comet vs asteroid: asteroid strongly favoured [desch2022, fischergodde2024] vs [siraj2021].
- Subtype: CM vs CR (CI excluded).
- Energy: 0.7–3.4×10²⁴ J [pope1997] vs ~4–8×10²³ J (modern).
- Water depth at ground zero: not pinned down.
- Evaporite fraction and its fate.

## 10. Unknowns / leads
See `openQuestions` in the JSON. Key gaps:
- No published ground-zero water depth (needs the full text of gulick2008 or ormo2021).
- No published entry-duration number.
- No fitted azimuth.
- Primary numbers not read: Renne 2013, Clyde 2016 (U-Pb), Le Feuvre & Wieczorek 2011, Trinquier 2006, Goderis 2013, Morgan et al. 2022 review, Nesvorný et al. 2021.

Access notes: several repository copies sat behind bot challenges (Cloudflare/Anubis). I did not bypass them, so those papers count as not read.
