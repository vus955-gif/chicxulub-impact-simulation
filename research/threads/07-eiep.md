# Thread 07: Earth Impact Effects Program (EIEP). Equations, thresholds and test oracle

Prepared 2026-10-04. Scope: every equation of Collins, Melosh & Marcus (2005) that the program uses (marked `*` in the paper), plus the later corrections and updates, the threshold tables, the constants, and a test oracle obtained from the two official online calculators.

Certainty tags follow the project convention:

- **fact**: exact relation, definition, or observed behaviour of software.
- **extrapolation**: scaling law or model grounded in known mechanisms.
- **speculation**: heuristic without direct support.
- **contested**: competing versions exist (both sides are listed).

---

## 1. Sources and how each was verified

| id | What | Peer reviewed | Verification |
|---|---|---|---|
| `collins2005` | Collins G.S., Melosh H.J., Marcus R.A. (2005). *Earth Impact Effects Program: A Web-based computer program for calculating the regional environmental consequences of a meteoroid impact on Earth.* Meteoritics & Planetary Science 40(6): 817–840. doi:10.1111/j.1945-5100.2005.tb00157.x | yes | The DOI resolves to Wiley, which returned HTTP 403 to the automated fetch. Metadata was confirmed via the Crossref API. The full text came from the author-hosted journal PDF linked from the calculator: `https://impact.ese.ic.ac.uk/static/effects.pdf`, PDF pp. 1–24 = journal pp. 817–840. **Equations were transcribed from rendered page images.** The PDF text layer drops square roots and Greek letters; for example, Eq. 9 extracts as "0.0624 ρi" when it actually reads 0.0624 √ρi. |
| `collins2013errata` | Collins G.S. & Melosh H.J. (May 13, 2013). *Errata and Improvements in Earth Impact Effects Program.* A 6-page note appended as PDF pp. 25–30 of the same `effects.pdf`. | **no** | Read in full from page images. |
| `collins2017` | Collins G.S., Lynch E., McAdam R., Davison T.M. (2017). *A numerical assessment of simple airblast models of impact airbursts.* MAPS 52(8): 1542–1560. doi:10.1111/maps.12873 (CC-BY 4.0) | yes | Crossref metadata, plus full text from Imperial Spiral (`spiral.imperial.ac.uk/server/api/core/bitstreams/277e9ba5-…/content`), Early View pagination 1–19. The web-program section is on EV p. 15 = journal p. 1556. |
| `purdueImpactEarth2026` | *Impact: Earth!* web app, Purdue build `static/js/main.a4859e04.js` | no (software) | The physics runs client-side. The bundle was downloaded and its calculation functions were executed verbatim in Node.js. The live page was also driven in a browser for cases A, B and C, and it displayed the same values. |
| `imperialEIEP2026` | *Impact: Earth!* / EIEP server at Imperial College (`impact.ese.ic.ac.uk`, gunicorn) | no (software) | Queried with a GET to `/map` (Section 7.1). Legacy URLs are dead: `…/ImpactEarth/cgi-bin/*.cgi` returns 404, and `lpl.arizona.edu/impacteffects` redirects. |

Not listed as sources, because they were not opened:

- **Wünnemann, Collins & Weiss (2010)**, Rev. Geophys. 48, RG4006, doi:10.1029/2009RG000308. Crossref metadata confirms it exists; it is the basis of the 2013 tsunami additions.
- **Glasstone & Dolan (1977)**, the source of the threshold data in Tables 1 and 4.
- **Toon et al. (1997)**, used for comparison in the paper.

**Pagination key for `collins2005`:** Eqs. 1–4 are on pp. 818–819; Eqs. 5–12 on p. 820; Eqs. 13–20 on p. 821; Eq. 21 on p. 823; Eqs. 22–29 on p. 824; Eqs. 30–32 on p. 825; Eqs. 33–39 on p. 826; Eqs. 40–42 and Tables 1–2 on p. 827; Table 3 and Eqs. 43–47 on p. 828; Eqs. 48–53 on p. 829; Eqs. 54–58 on p. 830; Table 4 and Eqs. 59–64 on p. 831; Eq. 65 on p. 832; Table 5 on p. 833; Table 6 on p. 834. **There are no equations 60 or 61.**

---

## 2. Conventions, units and constants

The program takes six inputs:

- L0, the impactor diameter at the top of the atmosphere (m)
- ρi, the impactor density (kg m⁻³)
- v0, the velocity at the top of the atmosphere (m s⁻¹)
- θ, the trajectory angle to the horizontal
- the target type
- r, the distance along the surface (m)

The epicentral angle is **Δ = r/R_E in radians** (p. 819 and the Fig. 1 caption). SI units apply everywhere unless an equation explicitly uses r_km or D in km.

| Constant | Value | Where | Note |
|---|---|---|---|
| g_E | **not given numerically in the paper**; the code uses 9.8 m s⁻² | Purdue code; errata tsunami equations use 9.8 | |
| R_E | **not given numerically in the paper**; the code uses 6370 km (ejecta uses 637e4 m) | Purdue code | The Imperial server's map radii are consistent with 6371 km (inferred) |
| ρ0, H | 1 kg m⁻³, 8 km | p. 820 | exponential atmosphere |
| C_D | 2 in air; 0.877 in water | pp. 820, 832 | |
| f_p (pancake factor) | 7 | p. 821 | physically 2–4; 5–10 fits Tunguska |
| Target densities | sedimentary 2500; crystalline **2750**; water 1000; seafloor 2700 kg m⁻³ | p. 818 | Imperial server uses **2700** for crystalline; Purdue code uses **2750** for the seafloor |
| 1 Mt TNT | 4.18×10¹⁵ J (p. 819); the Table 6 caption says 4.2×10¹⁵ | | Purdue code 4.186×10¹⁵; Imperial ≈4.18×10¹⁵ (inferred) |
| η (luminous efficiency) | 3×10⁻³ (range 10⁻⁴–10⁻²) | p. 826 | |
| T* (transparency temperature) | 3000 K | p. 826 | air 2000–3000 K |
| σ | 5.67×10⁻⁸ W m⁻² K⁻⁴ | p. 826 | |
| Seismic efficiency | 10⁻⁴ (range 10⁻⁵–10⁻³) | p. 827 | built into Eq. 40 |
| Surface-wave speed | 5 km s⁻¹ | p. 827 | |
| P0 | 1 bar = 10⁵ Pa | pp. 830–831 | |
| c0 | ≈330 m s⁻¹ (code: 330) | p. 831 | |
| p_x, r_x (1 kt) | 75 000 Pa, 290 m | p. 830 | Mach region: r_x = 289 + 0.65 z_b (text) or 290 + 0.65 z_b1 (code) |
| D_c | 3.2 km | p. 824 | complex if D_tc > 2.56 km |
| ε_m (granite) | 5.2 MJ kg⁻¹ | p. 824 | |
| m_E, v_E, Γ_E | 5.83×10²⁴ kg (as printed; the modern value is 5.97×10²⁴), 29.78 km s⁻¹, 5.86×10³³ kg m² s⁻¹ (the printed unit "kg m³ s⁻¹" is a typo) | p. 832 | |

---

## 3. Equations

`*` marks an equation the program implements. "Code" refers to the Purdue bundle.

### 3.1 Energy and recurrence

| Eq. | Form | Variables and validity |
|---|---|---|
| **1*** | `E = ½ m_i v0² = (π/12) ρi L0³ v0²` | J. Exact for a sphere (the program uses the relativistic form). Calculators label this "energy before atmospheric entry". |
| 2 | `N(>L) ≈ 1148 L_km^-2.354` | Not implemented. |
| **3*** | `T_RE ≈ 109 E_Mt^0.78` (yr) | E_Mt = E/4.18e15. **Both calculators now use a different law** (code: `max(piecewise power law in mass, 110 E_Mt^0.77)`). Case A gives 1.1e8 yr instead of 1.35e8 yr. |
| **4*** | Printed: `T_RL = (T_RE/2)(1 − cos Δ)`; errata (2013): `T_RL = T_RE / (2(1 − cos Δ))` | **contested**. Spherical-cap geometry gives `2 T_RE/(1 − cos Δ)`. Not needed for the simulation. |

### 3.2 Atmospheric entry (the paper restricts this procedure to L0 < 1 km, p. 820)

| Eq. | Form | Notes |
|---|---|---|
| 5 | `ρ(z) = ρ0 exp(−z/H)` | ρ0 = 1 kg m⁻³, H = 8000 m |
| 6 | `dv/dt = −3 ρ(z) C_D v² / (4 ρi L0)` | no ablation or gravity; straight path; flat Earth |
| 7 | `d ln v / dz = 3 ρ(z) C_D / (4 ρi L0 sin θ)` | |
| **8*** | `v(z) = v0 exp[−3 ρ(z) C_D H / (4 ρi L0 sin θ)]` | intact bodies; v_surface = max(v(0), terminal velocity) |
| **9*** | `log10 Y_i = 2.107 + 0.0624 √ρi` | Y_i in Pa, ρi in kg m⁻³; valid 1000–8000 kg m⁻³ |
| 10 | `Y_i = ρ(z*) v²(z*)` | transcendental; replaced by Eq. 11 |
| **11*** | `z* ≈ −H [ ln(Y_i/(ρ0 v_i²)) + 1.308 − 0.314 I_f − 1.303 √(1 − I_f) ]` | v_i = entry speed; valid only when I_f < 1 |
| **12*** | `I_f = 4.07 C_D H Y_i / (ρi L0 v_i² sin θ)` | I_f ≥ 1 means the body arrives intact. The **code uses 2.7185·(3C_D H/4)/… ⇒ coefficient 2.039** (see Section 8). |
| 13 | `d²L/dt² = C_D ρ(z) v² / (ρi L)` | pancake model |
| 14 | `L d²L/dz² = C_D ρ(z) / (ρi sin²θ)` | |
| **15*** | `L(z) = L0 √(1 + (2H/l)² [exp((z* − z)/(2H)) − 1]²)` | L(0) is the swarm width. Calculators report an ellipse L(0)/sin θ × L(0); case A gives 14.17 × 10.02 km. |
| **16*** | `l = L0 sin θ √(ρi / (C_D ρ(z*)))` | |
| **17*** | `v(z) = v(z*) exp{ −(3/4) [C_D ρ(z*)/(ρi L0³ sin θ)] ∫_z^{z*} e^{(z*−z')/H} L²(z') dz' }` | |
| **18*** | `z_b = z* − 2H ln[1 + (l/2H) √(f_p² − 1)]` | z_b > 0 means an airburst; z_b ≤ 0 means crater-forming. Negative z_b is unphysical: **the code clamps it to 0, but the Imperial server does not** (Section 7.4). |
| **19*** | `∫_{z_b}^{z*} … = (l L0²/24) α [8(3 + α²) + 3α (l/H)(2 + α²)]`, with α = √(f_p² − 1) | airburst branch |
| **20*** | **Errata form:** `∫_0^{z*} … = (H³ L0² / (3 l²)) {3[4 + (l/H)²] e^{z*/H} + 6 e^{2z*/H} − 16 e^{3z*/(2H)} − 3(l/H)² − 2}` | The printed 2005 form has a typo ("34 + …"). The code implements the errata form. |

The airblast energy rule (Collins 2017; both calculators print "the larger of these two energies…"): `E_airblast = max(½ m v_i², ½ m (v0² − v_i²))`. The paper's Table 6 confirms that the 2005 program used the impact energy only. The 40-m iron case reproduces 0.004 bar and 0.96 m/s only under that rule.

### 3.3 Water layer (marine impacts)

| Eq. | Form | Notes |
|---|---|---|
| **65*** | `v_seafloor = v_surface exp[−3 ρw C_D d_w / (2 ρi L sin θ)]` | ρw = 1000 kg m⁻³, C_D = 0.877, d_w is the water depth (m), L is the diameter after atmospheric traverse. The code constant is 3·1000·0.877 = 2631. |

How the program uses the two energies:

- The water-layer transient crater uses Eq. 21 with constant **1.365**, ρt = 1000 and v_surface.
- The seafloor crater uses v_seafloor and ρt = 2700 (code: 2750).
- Airblast and thermal effects use E_surface.
- Seismic and ejecta effects use E_seafloor.
- The 2005 paper explicitly computes no tsunami. The 2013 note adds one (Section 3.9).

### 3.4 Craters and melt

| Eq. | Form | Units and validity |
|---|---|---|
| **21*** | `D_tc = 1.161 (ρi/ρt)^{1/3} L^0.78 v_i^0.44 g_E^−0.22 sin^{1/3} θ` | All SI (m). Gravity regime, rock. The constant is uncertain (0.8–1.5). In water the constant is 1.365. **The code effectively uses 1.16132** (`1.6·(m/ρt)^{1/3}·(1.61 g L/v²)^−0.22`), which is +0.027 %. |
| **22*** | `D_fr ≈ 1.25 D_tc` | simple crater (D_tc ≤ 2.56 km) |
| **23*** | `V_br ≈ 0.032 D_fr³` | |
| **24*** | `t_br = 2.8 V_br (d_tc + h_fr) / (d_tc D_fr²)` | |
| **25*** | `d_tc = D_tc / (2√2)` | code: D_tc/2.828 |
| **26*** | `d_fr = d_tc + h_fr − t_br` | simple crater |
| **27*** | `D_fr = 1.17 D_tc^1.13 / D_c^0.13` | km, with D_c = 3.2 km. The form is dimensionally homogeneous, so metres with D_c = 3200 m work too. Applies when D_tc > 2.56 km. No crater is quoted if D_tc > 1500 km (melt province). |
| **28*** | `d_fr = 0.4 D_fr^0.3` (km) | **superseded** |
| **28u (errata Eq. 9)** | `d_fr = 0.294 D_fr^0.301` (km) | that is, 36.76 D_fr(m)^0.301 m (code: 37·D^0.301). **Used by both calculators.** |
| 29 | `V_m = 0.25 (v_i²/ε_m) V_i` | requires v > 12 km/s, similar densities, vertical impact |
| **30*** | `V_m = 8.9×10⁻¹² E sin θ` | m³, with E in J (seafloor energy for marine impacts). About 10× more for ice. Overestimates by ~2× for θ ≤ 15°; underestimates for giant impacts (geotherm ignored). |
| **31*** | `t_m = 4 V_m / (π D_tc²)` | |
| 44 | `V_e = (π/2)[h_tr D_tr² + d_tc((D_tr⁴ − D_tc⁴)/(4D_tc²) − (D_tr² − D_tc²)/2)]` | |
| 45 | `D_tr = D_tc √((d_tc + h_tr)/d_tc)` | |
| 46 | `V_tc = π D_tc³ / (16√2)` | Combined with V_e = V_tc this gives h_tr = D_tc/14.1. |
| **48*** | `h_fr = 0.07 D_tc⁴ / D_fr³` | The text says "Equation 31", which is a typo for Eq. 47. |

### 3.5 Thermal radiation (only if v_i ≥ 15 km/s)

| Eq. | Form | Notes |
|---|---|---|
| **32*** | `R_f* = 0.002 E^{1/3}` | m, with E in J. Derived from R_f = 13 L0 (range 10–15) at 20 km/s and 2700 kg m⁻³. |
| **33*** | `T_t = R_f* / v_i` | s; time of maximum radiation |
| **34*** | `Φ = η E / (2π r²)` | J m⁻². η = 3×10⁻³. Weather and absorption are ignored, so this is an upper estimate. |
| **35*** | `τ_t = η E / (2π R_f*² σ T*⁴)` | duration of irradiation; T* = 3000 K |
| **36*** | `f = (2/π)(δ − (h/R_f*) sin δ)`, with δ = arccos(h/R_f*) | f = 0 if h ≥ R_f*. Refraction is ignored. The program reports f·Φ. |
| **37*** | `h = (1 − cos Δ) R_E` | Δ = r/R_E in radians |
| 38 | `Φ_ign ≈ T_ign ρ c_p √(κ τ_t)` | physical motivation only |
| **39*** | `Φ_ign(E) = Φ_ign(1 Mt) · E_Mt^{1/6}` | scaling applied to Table 1 |

### 3.6 Seismic effects (distance units matter)

| Eq. | Form | **Distance variable** |
|---|---|---|
| **40*** | `M = 0.67 log10 E − 5.87` | E in J (seafloor energy for marine). Seismic efficiency 10⁻⁴ is built in; ×10 efficiency means +0.67 M. |
| **41a*** | `M_eff = M − 0.0238 r_km` | **r_km in kilometres**, r_km < 60 |
| **41b*** | `M_eff = M − 0.0048 r_km − 1.1644` | **r_km in kilometres**, 60 ≤ r_km < 700 |
| **41c*** | `M_eff = M − 1.66 log10 Δ − 6.399` | **Δ = r/R_E in radians**, r_km ≥ 700 |
| **42*** | `T_s = r_km / 5` | s, with r_km in km |

Evidence that Δ in Eq. 41c is in radians:

1. The paper defines Δ = r/R_E "in radians" (p. 819 and the Fig. 1 caption).
2. The Purdue code computes `M − 1.66*log10(r_km/6370) − 6.399`.
3. The Imperial server's MMI-IV map radius for case A (Δ = 0.45486 rad) reproduces M = 9.83107 exactly, but only with radians.

The regimes do not join smoothly:

- At 60 km, 41a gives M − 1.428 and 41b gives M − 1.452, a step of −0.024.
- At 700 km, 41b gives M − 4.524 and 41c gives M − 4.807 (R_E = 6370 km), a step of −0.28. With degrees the step would be about 3.2 magnitudes.

M_eff is then mapped to MMI through Table 2.

### 3.7 Ejecta

| Eq. | Form | Notes |
|---|---|---|
| 43 | `t_e = (h_tr/8)(D_tr/r)³` | The exponent −3 has a range of −2.5 to −3.5. The printed symbol looks like d_tr, but the derivation implies D_tr. |
| **47*** | `t_e = D_tc⁴ / (112 r³)` | m, with r in m from the crater centre. A lower bound (no bulking). Reported only outside the final rim. If E < 200 Mt and r > R_f*, the program reports "blocked by atmosphere". |
| **49*** | `T_e = (2 a^{1.5} / √(g_E R_E²)) [2 atan(√((1−e)/(1+e)) tan(Δ/4)) − e √(1−e²) sin(Δ/2) / (1 + e cos(Δ/2))]` | s. Single launch point at 45°; no atmosphere and no rotation. Valid for v_e²/(g_E R_E) ≤ 1 (r < ~10 000 km). If T_e > 1 h the program reports condensed-vapour fallout. |
| **50*** | `e² = ½[(v_e²/(g_E R_E) − 1)² + 1]` | **e is taken negative** when v_e²/(g_E R_E) ≤ 1 |
| **51*** | `a = v_e² / (2 g_E (1 − e²))` | |
| **52*** | `v_e² = 2 g_E R_E tan(Δ/2) / (1 + tan(Δ/2))` | 45° launch |
| **53*** | `d = d_c (D_fr / (2 r_km))^α`, with α = 2.65 and d_c = 2400 (D_fr/2)^−1.62 | **D_fr in km, r_km in km, d in m.** Fitted to Venus ejecta parabolas. The paper omits it for r < 2 crater radii; the code computes it everywhere. |

### 3.8 Air blast

| Eq. | Form | Notes |
|---|---|---|
| **54*** | `p = (p_x r_x / (4 r1)) [1 + 3 (r_x/r1)^1.3]` | **p in Pa, r1 in m (1-kt scaled)**; p_x = 75 kPa, r_x = 290 m; fitted to a 1-kt surface burst. **contested at large energies**: the paper (p. 831) says it "probably overestimates the blast wave effects by a factor of 2–5" above 10⁴ Mt (the text says "Equation 44"). |
| **55*** | `p = p0 exp(−β r1)` | regular-reflection region (2005) |
| **56a*** | `p0 = 3.14×10¹¹ z_b^−2.6` | 1-kt-scaled z_b in m; superseded |
| **56b*** | `β = 34.87 z_b^−1.73` | superseded |
| **2017 Eq. 7** | `p(r) = 3.14×10¹¹ (r² + z_b²)^{−2.6/2} + 1.8×10⁷ (r² + z_b²)^{−1.13/2}` | Replaces Eqs. 55–56 in the web program; 1-kt-scaled r and z_b in m (`collins2017`, p. 1556). The code blends 54 and 7 linearly over ±0.00328 z_b1² m around r_m1; this is not in the paper. |
| **57*** | `r1 = r / E_kt^{1/3}`; `z_b1 = z_b / E_kt^{1/3}` | E_kt = E/4.18×10¹² J (code: 4.186×10¹²) |
| **58*** | `r_m1 = 550 z_b1 / (1.2 (550 − z_b1))` | Mach region starts here. A surface burst has r_m1 = 0. Above z_b1 = 550 m there is no Mach region. |
| **59*** | `u = (5p / (7P0)) · c0 / (1 + 6p / (7P0))^{0.5}` | m s⁻¹; perfect-gas Rankine–Hugoniot with γ = 1.4; P0 = 10⁵ Pa, c0 = 330 m s⁻¹ |
| 62 | `T_b = ∫_0^r dr / U(r)` | formal |
| 63 | `U = c0 (1 + 6p/(7P0))^{0.5}` | not used |
| **64*** | `T_b = r / c0` | Code: `√(r² + z_b²)/c0` with z_b ≥ 0. |

### 3.9 Global effects and the 2013 additions (non-peer-reviewed note)

- **Momentum.** M_i = m_i v_i and Γ_i = m_i v_i R_E cos θ, compared against Table 5 ratios.
- **Global state.** V_tc/V_E > 0.5 means the Earth is "disrupted"; 0.1–0.5 means "strongly disturbed".
- **Length of day** (note Eq. 6): `ΔT_E = (5/(4π R_E)) (m_i/M_E) cos θ · v_i · T_E²`. This is an upper bound. The Purdue page shows "up to 1.50 ms" for case A.
- **Tsunami** (note Eqs. 10–22). Water depth H_w is assumed constant along the path. These are **speculation-grade heuristics**:
  - Rim wave: `A_rw_max = min(D_tc/14.1, H_w)` at `R_rw = 3D_tc/4`; then `A_rw = A_rw_max (R_rw/r)`.
  - Collapse wave, only if H_w > 2L: `A_cw_max = 0.06 min(d_tc, H_w)` at `R_cw = 5D_tc/2`; then `A_cw = A_cw_max (R_cw/r)^q` with `q = 3 e^{−0.8 L/H_w}` (L/H_w < 0.5).
  - Minimum arrival time: `T_min = r / min(√(1.56 D_tc (1 + 39.5 (A/D_tc)²)), √(9.8 H_w)(1 + A/(2H_w)))`.
  - Maximum arrival time: `T_max = r / √(1.56 D_tc tanh(6.28 H_w / D_tc))`.
  - Note Eq. 20 contains 2π²A²/λ² ≈ 19.7(A/λ)², but Eq. 21 uses 39.5. This is an internal factor-of-2 inconsistency.

---

## 4. Threshold tables

**Table 1 (p. 827).** Thermal exposure needed to ignite or burn at 1 Mt (MJ m⁻²). Scale by E_Mt^{1/6} (Eq. 39).

| Material | Clothing | Plywood | Grass | Newspaper | Deciduous trees | 3rd-degree burns | 2nd-degree burns | 1st-degree burns |
|---|---|---|---|---|---|---|---|---|
| MJ m⁻² | 1.0 | 0.67 | 0.38 | 0.33 | 0.25 | 0.42 | 0.25 | 0.13 |

**Table 2 (p. 827).** Richter (effective) magnitude to MMI:

| Magnitude | 0–1 | 1–2 | 2–3 | 3–4 | 4–5 | 5–6 | 6–7 | 7–8 | 8–9 | 9+ |
|---|---|---|---|---|---|---|---|---|---|---|
| MMI | – | I | I–II | III–IV | IV–V | VI–VII | VII–VIII | IX–X | X–XI | XII |

Table 3 (p. 828) gives the MMI descriptions.

**Table 4 (p. 831).** Air-blast damage. d1 is the distance from a 1-kt burst; p is the peak overpressure.

| d1 (m) | p (Pa) | Damage |
|---|---|---|
| 126 | 426 000 | cars and trucks largely displaced, grossly distorted |
| 133 | 379 000 | highway girder bridges collapse |
| 149 | 297 000 | cars and trucks overturned |
| 155 | 273 000 | multistory steel-framed buildings: extreme distortion, incipient collapse |
| 229 | 121 000 | highway truss bridges collapse |
| 251 | 100 000 | truss bridges: substantial distortion |
| 389 | 42 600 | multistory wall-bearing buildings collapse |
| 411 | 38 500 | wall-bearing buildings: severe cracking |
| 502 | 26 800 | wood-frame buildings almost completely collapse |
| 549 | 22 900 | wood-frame interior partitions blown down; roof severely damaged |
| 1160 | 6 900 | glass windows shatter |

The Purdue code mislabels the 22 900 Pa threshold as "steel-framed… incipient collapse". The code also has an extra "glass may shatter" threshold at ≥ 690 Pa. The Imperial map uses its own layer labels (1 kPa, 5 kPa, 20 kPa).

**Wind (p. 831):**

- u > 40 m s⁻¹: about 30 % of trees are blown down.
- u > 62 m s⁻¹: up to 90 % of trees are blown down and the rest are stripped.

**Table 5 (p. 833).** Global effects:

| Ratio | Effect |
|---|---|
| M_i/M_E < 0.001 | no noticeable orbit change |
| 0.001–0.01 | noticeable orbit change |
| 0.01–0.1 | substantial orbit change |
| > 0.1 | orbit totally changed |
| Γ_i/Γ_E < 0.01 | no noticeable change in rotation or tilt |
| 0.01–0.1 | noticeable |
| 0.1–1 | substantial |
| > 1 | total |

**Regime and validity switches:**

| Switch | Threshold |
|---|---|
| fireball | v_i ≥ 15 km s⁻¹ |
| melt | v_i ≳ 12 km s⁻¹ |
| intact impactor | I_f ≥ 1 |
| pancake factor | f_p = 7 |
| complex crater | D_tc > 2.56 km |
| melt province | D_tc > 1500 km |
| seismic regimes | 60 km and 700 km |
| ejecta limited to the fireball | E < 200 Mt |
| condensed-vapour fallout | T_e > 1 h |
| validity of Eq. 49 | r < 10 000 km |
| no fragment size reported | r < 2 R_crater |
| no Mach region | z_b1 > 550 m |
| airblast overestimate (×2–5) | E > 10⁴ Mt |
| factor-of-2 overpressure band (2017, airbursts) | r < 3 z_b |

---

## 5. Later corrections and updates, and whether the calculators implement them

| Update | Content | Purdue app (`main.a4859e04.js`) | Imperial server |
|---|---|---|---|
| Errata 2013, Eq. 4 | corrected T_RL (still geometrically doubtful) | recurrence is computed with a different law | same printed value as Purdue (1.1e8 yr, case A) |
| Errata 2013, Eq. 20 | corrected integral | **yes** (code matches the errata form) | presumably yes; not separable for these cases |
| Errata 2013, Eq. 9 | d_fr = 0.294 D^0.301 km | **yes** (37 D_m^0.301) | **yes** (prints 1.2 km for case A; 1.23 km expected) |
| Errata 2013, length of day | ΔT_E | **yes** ("up to 1.50 ms") | prints only qualitative tilt and orbit text |
| Errata 2013, tsunami | rim and collapse waves | a "Tsunami" panel exists (water targets) | `tsunamiRadii` map layer exists |
| Collins et al. 2017 (i) | airblast energy = max(KE lost in atmosphere, impact KE) | **yes** | **yes** ("The larger of these two energies…") |
| Collins et al. 2017 (ii) | Eq. 7 replaces Eqs. 55–56 | **yes**, plus an undocumented linear transition zone | not testable with crater-forming cases |
| Collins et al. 2017 (iii) | factor-of-2 band for r < 3 z_b | not seen in the display code | not seen |
| (undocumented) | constants: D_tc prefactor 1.16132, Mt = 4.186e15 J, recurrence law, crystalline 2700 at Imperial, seafloor 2750 at Purdue | see Section 8 | see Section 8 |

---

## 6. Independent re-implementation (consistency check of the transcription)

The scratch script `paper_eiep.py` implements (kept in the research session's temporary working folder, not in this repository, together with the verbatim Purdue harness `purdue_run.js` / `purdue_assembled.js` and the raw Imperial HTML `caseA/B/C.html`)  Eqs. 1–65 as printed, with errata Eqs. 20 and 9, g = 9.8 and R_E = 6370 km. It reproduces the paper's own **Table 6** (p. 834):

- **40-m iron:** E = 1.33e16 J (table 1.3e16); 50 % velocity loss; D_fr = 1.18 km (table 1.2); M = 4.93 (table 4.9); 0.0041 bar and 0.96 m/s under the pre-2017 airblast rule (table 0.004 bar, 0.96 m/s).
- **1.75-km impactor:** E = 1.50e21 J; D_fr = 23.75 km (table 23.7); R_f = 22.9 km (table 23); T_t = 1.15 s (table 1.2); Φ = 14.8 MJ m⁻² (table 14.8); τ_t = 298 s (table 300); M = 8.32 (table 8.3); T_e = 206 s (table 206); 0.797 bar and 145 m/s (table 0.80 bar, 145 m/s).
- **18-km impactor:** E = 1.65e24 J; D_fr = 185.6 km (table 186); R_f = 236 km (table 236); M = 10.36 (table 10.4); T_e = 206 s.

Two entries in Table 6 are **not** reproduced: the 18-km ejecta thickness (Eq. 47: 117 m, table 137 m) and its overpressure (Eq. 54: 131 bar, table 77 bar). These are recorded under disagreements.

Against the oracle, the same script matches the calculator code to within 0.03 % for craters (the 1.161 vs 1.16132 prefactor), 0.1 % for ejecta thickness and overpressure (Mt definition), and exactly for thermal, seismic and ejecta arrival.

---

## 7. Oracle

### 7.1 How the calculators were queried

- **Imperial server.** The form at `https://impact.ese.ic.ac.uk/ImpactEffects` submits a GET to `https://impact.ese.ic.ac.uk/map`. For distance-only mode the parameters are:

  ```
  input_method=distanceonly&distance=<km>&distanceUnits=km&diam=<m>&diameterUnits=m&diameterSelect=&pdens=<kg/m3>&pdens_select=&vel=<km/s>&velocityUnits=1&velocity_select=0&theta=<deg>&angle_select=0&target_type=sedimentary|crystalline|water&wdepth=<m>&wdepthUnits=meters
  ```

  The page prints the energy, atmospheric-entry, air-blast and crater sections. **It prints no thermal, seismic or ejecta section.** Those effects appear only as map-circle radii, in radians, in inline JavaScript (`fireballRadii`, `seismicRadii`, `ejectaRadii`, `craterRadii`, `airblastRadii`). The page draws these radii with 6.37e6 m, but **converting with 6371 km reproduces the Purdue-code crater and fireball values to ≤ 5×10⁻⁶ relative** (case A: ≤ 2×10⁻⁷), so the server most likely uses 6371 km (inferred).
- **Purdue app.** `https://www.purdue.edu/impactearth/` computes everything in the browser. The calculation functions were extracted verbatim from `static/js/main.a4859e04.js` and executed in Node.js, wired exactly as the React components do. The live page was then driven in a browser with the same inputs. **The displayed values matched in every case** (Section 7.3).

### 7.2 Raw Imperial server text (2026-10-04)

Case A (distance 1000 km; 10 km, 2600 kg/m³, 20 km/s, 45°, sedimentary):

```
Target Density 2500 kg/m 3 | Target Type Sedimentary Rock
Energy Before Atmospheric Entry 2.7 x 10 23 Joules = 6.5 x 10 7 MegaTons TNT
Average Impact Interval ... 1.1 x 10 8 years .
Breakup Altitude: The projectile begins to breakup at an altitude of 60992 meters = 200107 ft
Projectile Condition: ... strikes the surface at velocity 20.0 km/s = 12.4 miles/s
Atmospheric Energy Loss: 3.6 x 10 20 Joules = 85093.37 MegaTons.
Impact Energy: 2.7 x 10 23 Joules = 6.5 x 10 7 MegaTons .
Fragment Dispersion: ellipse of dimension 14.17 km by 10.02 km
Air Blast: Arrival Time ... approximately 50 minutes, 38 seconds after impact.
Peak Overpressure 93467.476 Pa = 0.935 bars = 13.272 psi
Maximum Wind Velocity 164.162 m/s = 367.22 mph
Sound Intensity 99.0 dB (May cause ear pain)
Damage: Glass windows will shatter. / Up to 90 percent of trees blown down... / Multistory wall-bearing buildings will collapse. / Wood frame buildings will almost completely collapse.
Transient Crater diameter: 65.0 km ( = 41.0 miles ) | Transient Crater Depth 23.0 km ( = 14.0 miles )
Final Crater diameter: 110.0 km ( = 70.0 miles ) | Final Crater Depth 1.2 km ( = 0.76 miles )
The crater formed is a complex crater . | melted or vaporised 1711.23 km 3 = 410.54 miles 3
Roughly half the melt remains in the crater, where its average thickness is 510.0 meters
map JS: craterRadii=[0.008869671339274018, 0.005122454616992695]
        fireballRadii=[0.020337627546907856, 0.169909889566918, 0.20202445590810647]
        ejectaRadii=[[0.01,0.3971982693679183],[0.1,0.18436310518284502],[1,0.08557377303468718],[10,0.03971982693679183],[100,0.018436310518284506]]
        seismicRadii=[[3,0.008869671339274018],[4,0.4548559096651068],[7,0.08706129022600596],[9,0.05441335426618805],[12,0.005478726139821616]]
        airblastRadii=[0.07950133675882273,0.09779926347315494,0.4164355734985953,1.0417198967366377]
```

Case B (same impactor, distance 3000 km). Every line is identical to case A except:

```
Arrival Time ... approximately 2 hours, 31 minutes, 33 seconds after impact.
Peak Overpressure 12776.11 Pa = 0.128 bars = 1.814 psi
Maximum Wind Velocity 28.59 m/s = 63.955 mph | Sound Intensity 82.0 dB | Damage: Glass windows will shatter.
```

Case C (distance 100 km; 1000 m, 3000 kg/m³, 17 km/s, 45°, crystalline). **The server shows "Target Density 2700 kg/m 3"**:

```
Energy Before Atmospheric Entry 2.3 x 10 20 Joules = 5.4 x 10 4 MegaTons TNT | interval 4.9 x 10 5 years
Breakup altitude 54044 meters = 177312 ft | strikes the surface at velocity 17.0 km/s
Atmospheric Energy Loss 3.0 x 10 18 Joules = 705.31 MegaTons | Impact Energy 2.2 x 10 20 Joules = 5.4 x 10 4 MegaTons
Fragment Dispersion: ellipse 1.62 km by 1.15 km
Air Blast arrival approximately 5 minutes, 25 seconds | Peak Overpressure 52854.556 Pa = 0.529 bars = 7.505 psi
Maximum Wind Velocity 103.355 m/s = 231.198 mph | Sound 94.0 dB
Transient Crater diameter 10.0 km | depth 3.6 km | Final Crater diameter 14.0 km | depth 650.0 meters | complex
melted or vaporised 1.41 km 3 | melt thickness 17.0 meters
map JS: craterRadii=[0.0010989107492036714, 0.0008069968339221156]
        fireballRadii=[0.001906589333881113, 0.019383538382143285, 0.06176075597408333]
        ejectaRadii=[[0.01,0.033796025529766203],[0.1,0.015686725471945523],[1,0.007281132978653149],[10,0.003379602552976621],[100,0.0015686725471945524]]
        seismicRadii=[[3,0.11754249066424395],[4,0.08489455470442603],[7,0.01959868278479018],[9,0.005041212236425665],[12,0]]
```

### 7.3 Live Purdue page text (2026-10-04)

**Case A:**

```
Energy before atmospheric entry: 2.72x 10^23 Joules (6.50 x10^7 Megatons TNT) | interval 1.1 x 10^8 years
length of day change up to 1.50 milliseconds
Transient Crater Diameter: 65.3 km | Transient Crater Depth: 23.1 km | Final Crater Diameter: 113 km | Final Crater Depth: 1.23 km | complex
melted or vaporized 1.71e+3 km3 | average thickness 511 m
Time for maximum radiation: 6.48 seconds | Visible fireball radius: 51.2 km | 11.6 times larger than the sun
Thermal Exposure: 3.64 x 10^7 Joules/m2 | Duration of Irradiation: 28.1 minutes | Radiant flux 21.6
Clothing ignites; third degree burns; Newspaper; Plywood; Deciduous trees; Grass ignite
Seismic arrival approximately 200 seconds | Richter Scale Magnitude: 9.8 | MMI at 1000 km: IV, V
Ejecta arrive approximately 8.24 minutes | fine dusting | Average Ejecta Thickness: 16.2 cm | Mean Fragment Diameter: 1.72 mm
Air blast arrive approximately 50.5 minutes | Peak Overpressure: 102000 Pa = 1.02 bars | Max wind velocity: 175 m/s | 100 dB
```

**Case B:**

```
Thermal Effects: The fireball is below the horizon. There is no direct thermal radiation.
Seismic arrival approximately 600 seconds | Magnitude 9.8 | MMI at 3000 km: III, IV
Ejecta arrive approximately 17.0 minutes | Average Ejecta Thickness: 6.00 mm | Mean Fragment Diameter: 93.4 microns
Air blast approximately 2.53 hours | Peak Overpressure: 13700 Pa = 0.137 bars | Max wind velocity: 30.5 m/s | 83 dB
```

All crater and energy lines are identical to case A.

**Case C** ("Crystalline Rock" in the Purdue app means ρt = 2750):

```
Energy before atmospheric entry: 2.27x 10^20 Joules (5.42 x10^4 Megatons TNT) | interval 4.9 x 10^5 years
Transient Crater Diameter: 10.2 km | Depth: 3.61 km | Final Crater Diameter: 13.9 km | Depth: 654 m | complex
melted 1.41 km3 | thickness 17.2 m
Time for maximum radiation: 719 milliseconds | Visible fireball radius: 11.4 km | Thermal Exposure: 9.82 x 10^6 Joules/m2
Duration of Irradiation: 2.63 minutes | Radiant flux 62.2 | Clothing ignites, 3rd-degree burns, ... grass ignites
Seismic arrival approximately 20 seconds | Magnitude 7.8 | MMI at 100 km: VII, VIII
Ejecta arrive approximately 2.40 minutes | Average Ejecta Thickness: 9.74 cm | Mean Fragment Diameter: 8.86 cm
Air blast approximately 5.05 minutes | Peak Overpressure: 89500 Pa = 0.895 bars | Max wind velocity: 159 m/s | 99 dB
```

### 7.4 Why the Imperial airblast differs (reverse engineering, inferred)

For crater-forming impacts the paper sets the burst altitude to 0 (p. 830). The Purdue code clamps z_b < 0 to 0.

The Imperial numbers are reproduced only under a different assumption. The server uses the **negative** z_b from Eq. 18 (case A: −75 268.5 m; case C: −39 614.7 m) in two places:

- in `r_x = 290 + 0.65 z_b1` (Mach-region branch of Eq. 54);
- in the arrival time `T_b = √(r² + z_b²) / 330`.

Comparison of the Imperial server with this hypothesis (server text vs. model):

| Probe | p server (Pa) | p model (Pa) | T_b server | T_b model (s) |
|---|---|---|---|---|
| A, 100 km | 14 680 404.827 | 14 680 412.259 | 6 min 19 s | 379.3 |
| A, 1000 km | 93 467.476 | 93 467.518 | 50 min 38 s | 3038.9 |
| B, 3000 km | 12 776.11 | 12 776.115 | 2 h 31 min 33 s | 9093.8 |
| C, 10 km | 7 577 289.991 | 7 577 388.978 | 2 min 3 s | 123.8 |
| C, 30 km | 645 222.641 | 645 230.780 | 2 min 30 s | 150.6 |
| C, 100 km | 52 854.556 | 52 855.138 | 5 min 25 s | 325.9 |
| C, 300 km | 8 193.156 | 8 193.225 | 15 min 16 s | 917.0 |
| C, 1000 km | 1 752.715 | 1 752.726 | 50 min 32 s | 3032.7 |

- The overpressure residual is ≤ 1.3×10⁻⁵, and the server's times are the model times truncated to whole seconds.
- Winds follow Eq. 59 exactly (164.162, 28.590 and 103.356 m/s).
- The airblast is identical for sedimentary and crystalline targets, as expected.

**Interpretation.** This is an implementation artefact, not physics: a negative "burst altitude" has no meaning. For a paper-consistent oracle, use the Purdue / surface-burst values. The Imperial values are kept in the oracle's `imperialServer` block.

### 7.5 Conversions and the values written to `07-eiep-oracle.json`

`expected` holds the full-precision Purdue-code values. Every one agrees with the live Purdue display after rounding. Conversions used: km→m ×10³; km³→m³ ×10⁹; cm→m ×10⁻²; min→s ×60; "x h y min z s"→s; bar→Pa ×10⁵.

| Key | A | B | C |
|---|---|---|---|
| energy_J (entry, Eq. 1) | 2.722713633e23 (page 2.72e23; Imperial 2.7e23) | same as A | 2.269800692e20 (page 2.27e20; Imperial 2.3e20) |
| transientDiameter_m | 65 270.33 (page 65.3 km; Imperial map 65 270.3; text 65.0 km) | same as A | 10 220.08 (page 10.2 km; Imperial ρt = 2700: 10 282.8 / "10.0 km") |
| transientDepth_m | 23 080.03 (23.1 km; Imperial 23.0 km) | same as A | 3 613.89 (3.61 km; Imperial 3.6 km) |
| finalDiameter_m | 113 017.37 (113 km; Imperial map 113 017.4; text 110.0 km) | same as A | 13 905.92 (13.9 km; Imperial 14 002.3 / 14.0 km) |
| finalDepth_m | 1 228.00 (1.23 km; Imperial 1.2 km) | same as A | 653.59 (654 m; Imperial 650 m) |
| meltVolume_m3 | 1.711232e12 (1.71e3 km³; Imperial 1711.23 km³) | same as A | 1.409889e9 (1.41 km³; Imperial 1.41 km³) |
| fireballRadius_m | 129 571.05 (Imperial map 129 571.0) | same as A | 12 146.93 (Imperial map 12 146.9) |
| thermalExposure_Jm2 | 3.636992e7 (3.64e7; f = 0.2801) | **0** (fireball below the horizon: h = 693 km > R_f) | 9.817284e6 (9.82e6) |
| magnitude | 9.831071 (9.8; Imperial map gives 9.83107) | 9.831071 | 7.764708 (7.8; Imperial map gives ≈7.761–7.764) |
| effectiveMagnitude | 4.766942 (Eq. 41c) | 3.974921 (Eq. 41c) | 6.120308 (Eq. 41b) |
| ejectaThickness_m | 0.1620485 (16.2 cm; Imperial-derived 0.1620484) | 0.00600180 (6.00 mm; Imperial-derived 0.0060018) | 0.0974091 (9.74 cm; Imperial-derived at ρt = 2700: 0.09982) |
| ejectaArrival_s | 494.449 (8.24 min) | 1021.475 (17.0 min) | 144.169 (2.40 min) |
| overpressure_Pa | 101 901.24 (102 000; **Imperial 93 467.476**) | 13 682.56 (13 700; **Imperial 12 776.11**) | 89 488.19 (89 500; **Imperial 52 854.556**) |
| wind_ms | 175.487 (175; **Imperial 164.162**) | 30.512 (30.5; **Imperial 28.59**) | 158.682 (159; **Imperial 103.355**) |

How the Imperial-derived values were obtained:

- **Ejecta thickness:** `0.01 m × (r₀.₀₁ / r)³`, where r₀.₀₁ is the 1-cm ejecta radius × 6371 km.
- **Imperial M:** from the MMI-IV radius via Eq. 41c (case A), or from the MMI-VII radius via Eq. 41b (case C). The Imperial seismic-radius inversion is approximate: regime-2 radii differ by up to 0.004 magnitude.

The `extra` block in the oracle file adds further values:

- impact (surface) energy;
- v_i (A: 19 986.93 m/s; C: 16 889.24 m/s);
- breakup altitude z* (A: 60 992.72 m; C: 54 045.08 m);
- T_t (A: 6.483 s; C: 0.7192 s);
- τ_t (A: 1683.8 s; C: 157.85 s);
- T_s (200, 600 and 20 s);
- mean fragment size (A: 1.717 mm; B: 93.4 µm; C: 8.864 cm);
- T_b (3030.3, 9090.9 and 303.0 s).

**Suggested test tolerances:**

- 0.5 % relative for continuous quantities, which absorbs the 1.161 vs 1.16132 prefactor and the 4.18 vs 4.186 Mt definitions.
- 10⁻³ absolute for magnitudes.

---

## 8. Disagreements and implementation deviations

1. **Airblast for crater-forming impacts.**
   - Paper and Purdue: surface burst.
   - Imperial: unclamped negative z_b, giving −8 % (A), −7 % (B) and −41 % (C) in p, plus a later arrival.
   - This is inferred, but fits to ~10⁻⁵.
2. **Airblast at Chicxulub energies.** The paper itself warns of a ×2–5 overestimate above 10⁴ Mt. Its own Table 6 (77 bar at 200 km for the 18-km case) is below what Eq. 54 gives (131 bar).
3. **I_f coefficient.**
   - Paper: 4.07.
   - Purdue code: effectively 2.039.
   - The Imperial server matches neither: one probe (L = 100 m, ρ = 8000, 15 km/s, vertical) gave z* = 12 093 m, against 12 142 m (paper) and 12 167 m (Purdue). Another probe (50 m iron, 12 km/s, 90°) produced **HTTP 500**.
   - This is irrelevant for km-size impactors.
4. **D_tc prefactor.** Paper 1.161; code 1.16132.
5. **Recurrence law.** Paper Eq. 3; calculators `max(piecewise in mass, 110 E^0.77)`.
6. **Crystalline target density.** Paper and Purdue 2750; Imperial 2700. Seafloor: paper 2700; Purdue code 2750.
7. **Complex-crater depth.** Eq. 28 (0.4 D^0.3) was replaced by 0.294 D^0.301. The replacement comes from the non-peer-reviewed 2013 note.
8. **Eq. 4.** Both the printed and the "corrected" forms disagree with spherical-cap geometry (2 T_RE/(1 − cos Δ)).
9. **Table 6 vs printed equations.** For the 18-km case: ejecta thickness 137 m vs 117 m, and overpressure 77 bar vs 131 bar. The cause is unknown.
10. **Melt-velocity check.** The code compares v in m/s with 12, so it is always true. This has no effect at these speeds.
11. **Fragment size.** The paper says it is not reported for r < 2 crater radii; the code computes it anyway.

---

## 9. What this means for the Chicxulub 24-hour simulation

These points concern how the equations apply; they are not new results.

- EIEP is a **regional, first-order** tool (from the impact site to a few thousand km). The authors state these limitations themselves:
  - The entry model is applied only for L < 1 km (p. 820).
  - The airblast assumes a uniform atmosphere and a flat Earth, and is overestimated 2–5× above 10⁴ Mt (p. 831).
  - Ejecta are ballistic from a single point at 45°, with no atmosphere and no rotation (p. 829). Distal fallout of condensed vapour is not modelled.
  - Thermal radiation counts only the direct fireball (T* = 3000 K, η = 3×10⁻³). Re-entry heating by ejecta, the global-wildfire mechanism, is discussed only qualitatively (p. 833).
  - Global atmospheric effects (dust, sulfate, CO₂) are explicitly excluded (p. 833).
- **Thermal radiation reaches only within the horizon distance of the fireball.** For a 10-km, 20-km/s impactor (case A), R_f = 129.6 km. The fireball is entirely below the horizon beyond about 1287 km (Imperial's "fireball visible" radius is 0.20202 rad). Clothing ignites out to about 1082 km (Imperial's map radius).
- **Seismic.** M ≈ 9.8 for case A. The far-field regime (Eq. 41c) depends on Δ in radians. The 700-km step is about 0.28 in M_eff.
- **Calculator presets** (software only, not evidence):
  - Purdue's "Chicxulub" button: L = 18 km, ρ = 2750, 20 km/s, 45°, water target 100 m deep.
  - Imperial's template: "Chicxulub (14 km)".
  - Paper Table 6: 18 km, 2700 kg m⁻³, 20 km/s, crystalline. Its outputs are D_fr ≈ 186 km, R_f = 236 km and M = 10.4.

---

## 10. Open questions

- Should the Imperial airblast for crater-forming impacts be confirmed with the authors? Its server code is not public.
- The Imperial entry model differs from Eqs. 11–12 for small, strong impactors. The cause is unknown.
- The Imperial distance-only mode prints no thermal, seismic or ejecta values. The oracle for those quantities rests on the Purdue code, which was checked against the live page.
- Why does Table 6 differ for the 18-km case (137 m, 77 bar)?
- These effects are outside EIEP and need dedicated threads: ejecta re-entry radiation, spherule fallout, the global tsunami, and atmospheric injection.
- **Unverified leads** (not opened): Wünnemann et al. 2010 (Rev. Geophys. 48, RG4006; metadata confirmed via Crossref only); Glasstone & Dolan 1977; Toon et al. 1997 (Rev. Geophys. 35:41–78).
