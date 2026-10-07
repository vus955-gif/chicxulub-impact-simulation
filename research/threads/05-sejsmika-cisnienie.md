# Thread 05 — Seismics, air blast, Lamb wave, sound (T = 0 … T + 24 h)

Groups: `seismic`, `airblast`, `sound` · machine-readable data: `05-sejsmika-cisnienie.json`
Certainty tags used below: **[F]** fact (measured/observed) · **[E]** extrapolation (model/scaling from known mechanisms) · **[S]** speculation · **[C]** contested.

How sources were checked: every source in the JSON was opened in at least one of these forms — full text (publisher OA, PMC/Europe PMC, institutional repository, author copy, OSTI), the PubMed record, or the journal page. DOIs and metadata were cross-checked against Crossref. When only the abstract was available, the JSON `notes` field says so and the source is used only for what its abstract states. Papers I could not open are listed only under *openQuestions* as "unverified lead".

---

## 1. Sequence of events (seismic and pressure phenomena)

Distances are great-circle distances from the crater centre. Times are seconds/minutes/hours after contact.

| Time after contact | Phenomenon | Basis |
|---|---|---|
| 0 – ~1 min | Seismic source forms. Momentum transfer and crater excavation; source time function half-duration ~58–60 s (model) | [E] meschede2011, leveque2024 |
| ~minutes (200–400 s periods) | Collapse and oscillation of the crater (central uplift) may extend the effective source duration | [E] leveque2024 (cites hydrocode work) |
| 1–2 min at ~500 km; 2.2 min at 1000 km; 5.8 min at Tanis (3050 km); 13 min at 90°; 20.2 min at the antipode (PKIKP) | First P-wave arrival (ak135) | [E] computed with obspy.taup / ak135 (kennett1995, crotwell1999, beyreuther2010); matches depalma2019 (P at Tanis 6 min) |
| 2 min (500 km) … 10.5 min (Tanis) … ~24 min (90°) | S-wave arrival | same |
| ~11.6 min (Tanis, G1 Love) / 13–14 min (Tanis, R1 Rayleigh) | Long-period surface waves | [E] dziewonski1981 group velocities; depalma2019 (Rayleigh 13 min) |
| Minutes after S and surface waves arrive | Slope failure along the Gulf of Mexico and Atlantic margins (Blake Nose >1600 km); liquefaction; gravity flows | [F] for the deposits; [E] for the minute-scale timing |
| ~1.27 h (G1), ~1.52 h (R1) | Surface waves converge at the antipode; focusing gives ~4 m peak displacement (3-D model) | [E] meschede2011 |
| 13 min – 2 h | Two ~10 m surges at Tanis while ejecta spherules fall | [F] deposit; [C] mechanism |
| ~20–50 min at 1000 km (shock-speed integration) or ≤50 min (r/c₀) | Air-blast front | [E] collins2005 scaling, beyond its validity range |
| ~0.9 h at 1000 km, ~2.7 h at Tanis, ~8.8 h at 90°, ~17.6 h at the antipode | Lamb-wave front (≈315 m/s) | [F] speed measured for Hunga 2022; [E] applied to Chicxulub |
| every ~3.05 h (R) / ~2.54 h (G) | Repeated passages of surface waves around the Earth: R1, R2, R3 …; about 7.9 circuits in 24 h | [E] |
| > 24 h | Lamb wave completes its first circuit (~35 h); tsunami reworking and gravity flows continue for days | [E] |

---

## 2. Seismic source: magnitude and seismic efficiency

**Scaling relation.** collins2005 (Eq. 40) write M = 0.67 log₁₀E − 5.87, where E is the impactor's kinetic energy in J. This is the Gutenberg–Richter energy–magnitude relation (log₁₀ Es[J] = 1.5 M + 4.8) with a seismic efficiency k = Es/E = 1e‑4 built in. The authors describe k = 1e‑4 as "the most commonly accepted figure", with a range of 1e‑5 to 1e‑3, after Schultz & Gault 1975 (p. 827). In their worked example (Table 6), an 18‑km body at 20 km/s (E = 1.65e24 J) gives **M = 10.4** and MMI X–XI at 200 km. [E]

- For E_ref = 4.184e23 J (1e8 Mt), Eq. 40 gives M = 9.96. For the 6e23 J in 01-impaktor (`energy.kinetic_literature`) it gives **10.06**. For the 2.7e23 J used in thread 04 it gives 9.83. Each order of magnitude in k shifts M by ±0.67. [E]
- **Values in the literature** — all are scaling estimates; none is measured **[C]**:
  - Mw ~9–11 for k = 1e‑2 to 1e‑5 and E ≈ 3e23 J. The authors add that "such extrapolations depend upon the seismic frequency" (richards2015).
  - Mw ~10–11.5 (depalma2019). It cites meschede2011, which gives no magnitude.
  - "Equivalent Mw > 10", required by the distance of the slope failures (richards2015 citing day2005). The day2005 abstract, as rendered by OpenAlex, says "<11"; leveque2024 cite day2005 for "Mw 11".
  - "magnitude > 11" (schulte2010, citing Toon et al. 1997, which I could not open).
  - Mw 11 adopted as model input (leveque2024).
- **Seismic efficiency [C]:**
  - 1e‑4 default (collins2005; meschede2011, where τ = 58 s corresponds to k ≈ 1e‑4 and ~1e19 J radiated).
  - 1e‑4 to 1e‑5 for Chicxulub (Shishkin 2007 as reported by meschede2011).
  - ~1e‑3 for impacts and ~1e‑5 for airbursts (khazins2018).
  - 1e‑2 to 1e‑5 overall range (richards2015).
  - ~1e‑6 for small impacts into Martian regolith (wojcicka2020) — not transferable, but shows how strongly k depends on scale and target.
- **Source geometry:** impact seismic sources have a significant deviatoric moment-tensor component. Oblique impacts approach a double couple (froment2024, small-scale simulations). A Chicxulub radiation pattern has not been published.

**Takeaway:** present Mw ≈ 10–11 as an order-of-magnitude, contested estimate. Do not present a single number as fact.

---

## 3. Body waves — ak135 / TauP (citation verified)

- **ak135:** Kennett, B. L. N.; Engdahl, E. R.; Buland, R. (1995) *Constraints on seismic velocities in the Earth from traveltimes*, Geophys. J. Int. 122(1):108–124, doi:10.1111/j.1365‑246X.1995.tb03540.x. Verified on the OUP page and in Crossref; the abstract proposes "a preferred model, ak135". [kennett1995]
- **Software:** TauP method paper (crotwell1999, SRL 70:154–160) and ObsPy (beyreuther2010, SRL 81:530–533).
- **Cross-check** (obspy 1.5.1, model ak135, source depth 1 km): first P / first S at
  - 500 km: 1.15 / 2.04 min
  - 1000 km: 2.18 / 3.88 min
  - 1600 km: 3.41 / 6.08 min
  - 3050 km: 5.79 / 10.47 min
  - 5000 km: 8.28 / 14.93 min
  - 10 000 km: 13.0 / 23.5 min (SKS)
  - 130°: Pdiff 15.0 min
  - 180°: PKIKP 20.2 min

  These reproduce depalma2019's P = 6 min and S = 10 min at Tanis. The S wave is absent beyond ~100° (core shadow); only SKS and diffracted phases arrive there.

---

## 4. Surface waves: group velocities, orbits, attenuation

**PREM Table V** (dziewonski1981, pp. 317–328, read from page images) gives group velocities computed for anisotropic PREM. The "Note added in proof" states that the values are correct for ₀S₁₁ and all higher modes.

| Mode | Period | Group velocity U | Q (computed) |
|---|---|---|---|
| Rayleigh ₀S₂₀ | 347 s | 4.011 km/s | — |
| Rayleigh ₀S₂₄ | 306 s | 3.758 km/s | — |
| Rayleigh ₀S₃₂ | 250 s | 3.578 km/s | 176 (observed 180 ± 5) |
| Rayleigh ₀S₃₅–₃₆ (minimum, Airy phase) | 235–230 s | **3.568 km/s** | — |
| Rayleigh ₀S₆₀ | 153 s | 3.660 km/s | 133 |
| Rayleigh ₀S₁₀₀ | 98 s | 3.758 km/s | 118 |
| Rayleigh ₀S₁₆₅ | 61 s | 3.837 km/s | — |
| Love ₀T₂₀ | 360 s | 4.462 km/s | — |
| Love ₀T₃₀ | 258 s | 4.388 km/s | — |
| Love ₀T₃₉ (minimum) | 205 s | **4.381 km/s** | — |
| Love ₀T₅₉ | 142 s | 4.385 km/s | — |

Using a representative U_R ≈ **3.65 km/s** (range 3.57–3.84) and U_L ≈ **4.385 km/s**, with circumference 40 030 km (R = 6371 km) — all [E]:

- **Circuit time:** Rayleigh ~10 970 s (2.90–3.12 h); Love ~9130 s (~2.54 h).
- **Arrival at the antipode:** R1 ~5480 s (1.45–1.56 h); G1 ~4560 s.
- **Rayleigh circuits in 24 h:** ~7.9, so a station sees about R1…R16 (minor-arc and major-arc passages alternate). Rₙ₊₂ = Rₙ + one circuit time.
- **Anelastic decay per circuit**, exp(−π f t_circ / Q):
  - ~0.45 at 250 s
  - ~0.19 at 150 s
  - ~0.05 at 100 s
  - ~0.34 for Love waves at ~200 s

  Late orbits are therefore dominated by periods of ~200–300 s. Apply geometric spreading ∝ 1/√(sin Δ) in addition, with focusing near the source point and the antipode.
- **Polar phase shift:** each antipodal passage adds a 90° phase shift (shown for Lamb waves in matoza2022, citing Brune et al. 1961; the same applies to seismic surface waves).
- **Group vs phase velocity:** the R wave train is dispersed. ~300 s energy arrives first (U ≈ 3.76–4.0 km/s), then shorter periods, and the Airy phase at ~230 s (3.57 km/s) arrives last. G waves are nearly non-dispersive at ~4.38–4.46 km/s.
- **Collins Eq. 42** uses 5 km/s for the "main shaking" arrival. That is too fast for teleseismic surface waves (see disagreements); use the PREM values.
- **Lateral variations:** ekstrom2011 (GDM52, 25–250 s) gives 3-D phase and group velocity maps. Path-dependent changes are of order a few per cent.

---

## 5. Ground-motion amplitudes (model results)

- **3100 km (≈ Tanis), Mw 11 radial point source.** Normal-mode synthetic (PREMQL6, 40–500 s band, half-duration 60 s, depth 10 km): radial displacement up to **≈ ±19 m**, velocity **≈ 1.2 m/s**, acceleration **≈ 0.1 m/s²** (~0.01 g). The largest motions are at ~750–900 s (leveque2024, Fig. 2; values read from the plot). [E]
  - For the visualisation: far from the crater, the long-period motion is a slow heave of tens of metres over minutes, not violent high-frequency shaking.
  - High-frequency shaking is not modelled in any source I could open (open question).
- **Antipode:** peak displacement **~4 m** in a 3-D Earth versus **15 m** for a point source in a spherically symmetric Earth. Dynamic stress **>15 bar**, strain **2e‑5**. "Channels" of stress five times higher along the paths, and "chimneys" of >50 bar in the mantle beneath the antipode (meschede2011). [E]
- **Global:** peak stresses of 2–4 bar and seismic energy densities of ~0.1–1 J/m³ in the upper ~200 km of the mantle. This exceeds historical thresholds for triggering eruptions (richards2015). [E]

---

## 6. Seismically triggered phenomena in the first hours

- **Gulf of Mexico margin collapse.**
  - The K-Pg "cocktail" — reworked microfossils, impact material and lithics — was deposited by giant sediment gravity flows after the Gulf margins collapsed (bralower1998). [F] deposit / [E] trigger
  - The largest known mass-wasting deposit: on average 10–20 m thick on the upper slope and 90–200 m on the lower slope and basin floor, in 31 wells (denne2013). [F]
  - About **1.05e5 km³** redistributed in the northern Gulf and **>1.98e5 km³** gulf-wide, through seismic and megatsunami processes, "blanketing the gulf … within days" (sanford2016). [F] volume / [C] process share
- **Distant slope failure.** Slumping on Blake Nose, **>1600 km** from the crater, in 1300–2600 m water depth, attributed to impact seismicity (klaus2000). [F] deposit / [E] trigger
- **Liquefaction argument.** The largest tectonic earthquakes cause liquefaction only out to ~500 km, so failures at >1000 km imply an equivalent Mw > 10 (richards2015, day2005). [E]
  - day2005 also link widespread liquefaction and slope failure to methane-hydrate release (300–1300 GtC). That consequence lies beyond 24 h.
- **Seiches and Tanis, North Dakota.**
  - Two ~10 m surges contain impact spherules in fish gills and are capped by the Ir-rich tonstein (depalma2019). [F]
  - Window between ~13 min and 2 h after impact. Ejecta-curtain spherules arrive 13–25 min after impact (launch angles 30–60°); shocked quartz arrives ~38 min to 2 h (depalma2019). [E/C]
  - DePalma et al. interpret a seismically coupled seiche, with amplitudes "of the order 10 to 100 m" scaled from the Tohoku 2011 fjord seiches. **[S]**
  - leveque2024 (sharing authors with depalma2019): a direct tsunami needs >10 h and is ruled out. Resonant seiching "cannot be scaled up directly from earthquakes to impacts" and needs tens of minutes to build up. Direct seismic excitation reproduces 10 m surges only if the source lasts "many minutes". Other candidates are triggered faulting under the Western Interior Seaway, slope failure into it, and atmospheric pressure waves from the ejecta curtain. The mechanism remains "incompletely resolved". **[C]**
  - during2022 describe the deposit as an "impact-induced seiche deposit", but they adopt this from depalma2019 rather than test it.
  - I found no independent peer-reviewed rebuttal; published criticism is in the news media, which does not qualify as a source here. A separate DePalma 2021 *Sci. Rep.* paper (on the season of impact, not the seiche) carries an editor's note about data reliability. I did not use it.
- **Analogue:** after Tohoku 2011, seiches of 1.0–1.5 m (trough to peak, periods 67–100 s) formed in Norwegian fjords ~8000 km away. They were triggered by horizontal S waves and began about 30 min after origin (bondevik2013). [F]
- **Context beyond 24 h (contested):** possible triggering of the Deccan pulse (richards2015) and of mid-ocean-ridge magmatism of 1e5–1e6 km³ (byrnes2018).

---

## 7. Air blast (overpressure and wind versus distance)

**Method (collins2005, Eqs. 54, 57, 59, 62–64).** Peak overpressure comes from a fit to a 1-kt nuclear surface burst:

p = (pₓ rₓ / 4r₁)(1 + 3(rₓ/r₁)^1.3), with pₓ = 75 kPa and rₓ = 290 m, scaled by r₁ = r / E_kt^(1/3).

Wind behind the front: u = (5p/7P₀) c₀ / √(1 + 6p/7P₀), with P₀ = 1e5 Pa and c₀ = 330 m/s. Arrival time is either r/c₀ (Eq. 64) or integrated over the shock speed U = c₀√(1 + 6p/7P₀) (Eqs. 62–63).

**Caveats stated by the authors:**
- The fit uses data from a "very small explosion" with a uniform atmosphere and a flat Earth; neither assumption holds for large impacts.
- Agreement with numerical plume models holds for 1–10 000 Mt. Above that, the formula "probably overestimates the blast wave effects by a factor of 2–5". Chicxulub, at ~1e8 Mt, is four orders of magnitude above this limit.
- Their Table 6 example (18 km, 1.65e24 J) gives **77 bar and 2220 m/s at 200 km**. My back-calculation shows this equals Eq. 54 evaluated with ~0.5 E, which the paper does not explain (handed to thread 07).

Values for E_ref = 4.184e23 J. Range: lower bound = (E = 1e23 J) ÷ 5; upper bound = E = 1.65e24 J. All [E].

| Distance | Overpressure p | Wind u | SPL (dB re 20 µPa) | Arrival (integrated / r/c₀) |
|---|---|---|---|---|
| 200 km* | 4.6 MPa (0.32–13 MPa) | 1.7 km/s | 227 | 45 s / 606 s |
| 500 km | 0.60 MPa (0.04–1.65 MPa) | 570 m/s (86–1000) | 210 | 5 min / 25 min |
| 1000 km | 137 kPa (11–359 kPa) | 219 m/s (24–419) | 197 | 19 min / 51 min |
| 2000 km | 35 kPa (3.1–85 kPa) | 73 m/s (7–152) | 185 | 60 min / 101 min |
| 3000 km | 17 kPa (1.6–39 kPa) | 38 m/s (4–79) | 179 | 105 min / 152 min |

With the 01-impaktor energy (6e23 J), the values at 500 / 1000 / 2000 / 3000 km become p = 780 / 175 / 44 / 21 kPa and u = 663 / 261 / 88 / 46 m/s. Recompute everything once the energy is fixed, using the formula above with r₁ = r / (E / 4.184e12 J)^(1/3).

\*At 200 km the site lies inside the fireball radius (236 km in collins2005 Table 6) and the vapour-plume / ejecta-curtain region. A separate "air blast" value is not physically meaningful there.

- **Rough sanity check (my calculation):** Eq. 54 applied to Hunga Tonga (100–200 Mt, vergoz2022) gives 340–430 Pa at 756 km. The observed value was 1473 Pa peak to peak (matoza2022). The formula agrees with observation to about a factor of 2–4, but Hunga was a long-duration source, so this is only indicative.
- **No Chicxulub-specific peer-reviewed air-blast model** that I could open exists in the literature; Toon et al. 1997 and Kring 2007 are unverified leads. Far from the crater (≫ scale height), energy is guided by the stratified atmosphere — a Lamb wave plus acoustic modes, decaying as ~r^‑1/2 — whereas Eq. 54 decays as ~1/r. Beyond ~1000 km the error of Eq. 54 can therefore go either way.

---

## 8. Global Lamb (pressure) wave — Hunga Tonga 2022 analogue

**Measured for Hunga [F]:**
- **Speed:**
  - group velocity ~315 m/s; theoretical ~310 m/s for a 16 km scale height (matoza2022)
  - phase speed 318.2 ± 6 m/s at the surface and 308 ± 5 to 319 ± 4 m/s in the stratosphere (wright2022)
  - "nominal" 310 m/s (vergoz2022)
- **Passages:** at least 4 minor-arc (A1, A3, A5, A7) and 3 major-arc (A2, A4, A6) passages in 6 days, about as many as for Krakatau 1883 (matoza2022). Each antipodal passage adds a 90° phase shift.
- **Waveform:** the pressure rise lasts 7–10 min and does not look like a shock. Dominant periods are 1700–2500 s, about four times longer than for the largest nuclear test (matoza2022).
- **Amplitude:** 1473 Pa peak to peak at 756 km, decreasing with distance. Decay is ~r^‑1/2 at intermediate range and constant or slightly increasing beyond ~10 000 km because of focusing on the sphere (vergoz2022). Surface friction limits the wave's lifetime to days.
- **Source energy [C]:** 100–200 Mt TNT (vergoz2022) versus 10–28 EJ (wright2022). Nuclear-test yield relations give "unphysically large" yields for Hunga (matoza2022).
- **Ocean coupling:** the Lamb wave drove a tsunami "forerunner" that arrived more than 2 h earlier than conventional tsunamis (kubota2022). The onset at tide gauges coincided with the ~2 hPa Lamb pulse; deep-sea gauges recorded 5 hPa (matoza2022). A 2-D horizontal long-wave model reproduces Lamb-wave arrival times well (amores2022). This is a useful implementation shortcut.

**Applied to Chicxulub [E]:**
- Front at ~315 m/s (range 303–324 m/s):
  - 1000 km at ~53 min
  - Tanis at ~2.7 h
  - 90° at ~8.8 h
  - **antipode at ~17.6 h (17.1–18.3 h)**
- One full circuit takes ~35 h, so it is **not completed within the 24 h window**.
- A warmer Maastrichtian atmosphere would raise the speed by at most ~1% (mechanism: speed follows the mean lower-atmosphere sound speed).
- **Amplitude, period and nonlinearity [S]:** no published model exists. The source exceeds Hunga by ~1e5–1e6 in energy, so the near field is a strong shock, and ejecta re-entry heats the upper atmosphere at the same time. Any amplitude chosen for the simulation is an artistic or speculative choice; label it as such.

---

## 9. Audible sound and infrasound

- No published loudness-versus-distance relation for Chicxulub was found. The JSON gives SPL computed from the Collins overpressure as SPL = 20 log₁₀(p / 20 µPa): ~210 dB at 500 km, ~197 dB at 1000 km, ~179 dB at 3000 km. [E]
  - Above ~194 dB (p ≥ 1 atm) the disturbance is a shock wave, not linear sound.
- **Hunga analogues [F]:**
  - Audible sound was reported ~10 000 km away (matoza2022).
  - Infrasound travels at 220–270 m/s (stratospheric duct), 270–320 m/s (thermospheric duct), and 250–290 m/s for direct arrivals lasting ~2 h. It arrives after the Lamb wave (vergoz2022, matoza2022).
  - Infrasound (<300 s) circled the Earth up to 8 times (vergoz2022).
- For Chicxulub, audible booms over most of the globe are plausible but unpublished. **[S]**

---

## 10. Key disagreements (details in the JSON)

1. Magnitude: 9–11.5. Both magnitude type and efficiency are uncertain. **[C]**
2. Seismic efficiency: 1e‑5 to 1e‑3; 1e‑6 for small Mars impacts. **[C]**
3. Tanis mechanism: seismic seiche versus long-source direct excitation, triggered faulting, slope failure or atmospheric forcing. Direct tsunami is excluded by timing. **[C]**
4. Margin collapse trigger: seismic shaking alone versus seismic shaking plus megatsunami reworking. **[C]** on process share
5. Air-blast scaling is valid to 1e4 Mt only; above that it likely overestimates by 2–5×. Table 6 implies ~0.5 E.
6. Hunga energy (Mt versus EJ) and therefore any energy scaling of Lamb amplitude.
7. Collins' 5 km/s surface-wave speed versus PREM's 3.6–3.8 km/s.

## 11. Main unknowns

- No Chicxulub-specific Lamb-wave or far-field blast model.
- High-frequency shaking and MMI at Gulf margins and teleseismic distances.
- Radiation pattern of an oblique impact.
- Effective source duration: 1 min versus "many minutes".
- Western Interior Seaway geometry, which controls seiches.
- The exact wording of the magnitude in day2005.
- Toon 1997, Kring 2007, Bermúdez 2026 and Morgan 2022 were not opened (see openQuestions).

## 12. Implications for the visual simulation

1. **Body waves:** compute P, S, PKP, SKS etc. with obspy TauP and ak135 (kennett1995). Draw the P front reaching the antipode at ~20 min and the S shadow zone beyond ~100°.
2. **Surface waves:**
   - Animate concentric rings: Love (G) at 4.385 km/s ahead of Rayleigh (R) at ~3.65 km/s, with the Airy-phase tail at 3.57 km/s.
   - Rings converge at the antipode at ~1.27 h (G1) and ~1.52 h (R1), focus there (≈4 m heave), and re-emerge. Repeat about every 3.05 h (R) and 2.54 h (G); add a 90° phase flip at each antipodal passage.
   - Amplitude per circuit ×0.45 at 250 s (×0.05 at 100 s), times 1/√(sin Δ).
   - Peak long-period heave of ~tens of metres at ~3000 km for Mw 11. Tag it "model".
3. **Triggered processes:**
   - Start Gulf and Atlantic margin failures (Blake Nose >1600 km) when S and surface waves arrive, i.e. minutes after impact. Run turbidity and gravity flows for hours to days.
   - Show Tanis surges between 13 min and 2 h, tagged "hypothesis / contested".
4. **Air blast:**
   - Draw a shock front that slows from supersonic to ~c₀. Use Collins numbers only as order-of-magnitude values, with an uncertainty band of roughly ×5 down and ×3 up.
   - Do not draw a separate blast inside ~300 km, where plume and ejecta dominate.
5. **Lamb wave:**
   - A pressure ring at ~315 m/s reaching the antipode at ~17.6 h; it does not close a full circuit within 24 h.
   - Optionally force a sea-surface "forerunner" travelling with it (kubota2022 mechanism). It can be simulated as a 2-D horizontal long-wave field (amores2022).
   - Treat amplitude as speculative.
6. **Sound:** derive from overpressure (SPL); mark >194 dB as shock. Infrasound follows at 220–320 m/s.
7. **Label all values honestly:** the HUD should carry certainty tags (fact / model / hypothesis / contested) for every number.

---

## Sources (ids as in JSON)

**Seismic source, magnitude and efficiency**
- collins2005 — MAPS 40:817
- schulte2010 — Science 327:1214
- meschede2011 — GJI 187:529
- richards2015 — GSA Bull 127:1507
- day2005 — GSA SP 384:239
- khazins2018 — Sol. Syst. Res. 52:547
- wojcicka2020 — JGR Planets 125
- froment2024 — GJI 238:156

**Tanis and seiches**
- depalma2019 — PNAS 116:8190
- leveque2024 — JGR Solid Earth 129
- during2022 — Nature 603:91
- bondevik2013 — GRL 40:3374

**Margin collapse and deposits**
- bralower1998 — Geology 26:331
- klaus2000 — Geology 28:319
- sanford2016 — JGR 121:1240
- denne2013 — Geology 41:983

**Context beyond 24 h**
- byrnes2018 — Sci. Adv. 4

**Earth models and software**
- dziewonski1981 — PEPI 25:297
- kennett1995 — GJI 122:108
- crotwell1999 — SRL 70:154
- beyreuther2010 — SRL 81:530
- ekstrom2011 — GJI 187:1668

**Hunga Tonga analogue (Lamb wave, infrasound, ocean coupling)**
- matoza2022 — Science 377:95
- wright2022 — Nature 609:741
- kubota2022 — Science 377:91
- vergoz2022 — EPSL 591:117639
- amores2022 — GRL 49
