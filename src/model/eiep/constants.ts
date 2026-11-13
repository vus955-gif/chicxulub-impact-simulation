// Stałe zgodne z Collins, Melosh & Marcus 2005 i z implementacją kalkulatora Impact: Earth! (Purdue);
// praca nie podaje liczbowo g ani R_E — wartości z kodu kalkulatora (research/threads/07-eiep.md).
export const G_EARTH = 9.8;         // m/s²
export const R_EARTH = 6.37e6;      // m
export const D_C_EARTH = 3200;      // m — średnica przejścia krater prosty/złożony (s. 823–824)
export const J_PER_KT = 4.184e12;   // J na kilotonę TNT (definicja; EIEP zaokrągla do 4.18e12 — różnica 0,1 %)
export const J_PER_MT = 4.184e15;   // J na megatonę TNT
export const DEG = Math.PI / 180;
export const SIGMA_SB = 5.670374419e-8; // W/(m²·K⁴) — stała Stefana–Boltzmanna (CODATA 2018)
// Termika kuli ognia (s. 826, eq. 35). Te same wartości są w rejestrze jako fireball.luminous_efficiency
// i fireball.transparency_temperature — zgodność pilnuje tests/eiep.test.ts.
export const LUMINOUS_EFFICIENCY = 3e-3; // η — sprawność świetlna (niepewna o ~2 rzędy wielkości)
export const FIREBALL_T_STAR = 3000;     // K — T*, temperatura kuli ognia, przy której staje się przezroczysta
