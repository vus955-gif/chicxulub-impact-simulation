/**
 * Wizualizacja chwili uderzenia na mapie 2D: przelot bolidu (T < 0) i błysk (T ≥ 0).
 * To SYMBOL, nie model: rozmiar na ekranie jest umowny (cały przelot to ~1 px mapy świata).
 * Przebieg jasności w czasie zakotwiczony w rejestrze: maksimum promieniowania kuli ognia
 * (fireball.t_max_radiation_eiep) i czas trwania promieniowania (fireball.radiation_duration_eiep).
 */

export interface FlashTimes { tEntry: number; tMaxRad: number; radDurS: number }

/** Postęp przelotu: 0 na wysokości 100 km (T = −tEntry), 1 w chwili kontaktu (T = 0); poza przelotem null. */
export function bolideProgress(t: number, tEntry: number): number | null {
  if (t >= 0 || t < -tEntry) return null;
  return 1 + t / tEntry;
}

/**
 * Względna jasność błysku w chwili t ≥ 0 (0…1):
 *  – krótki szczyt kontaktowy, gasnący w ciągu pierwszych sekund (skala logarytmiczna czasu),
 *  – narastanie promieniowania kuli ognia do maksimum w tMaxRad i wykładnicze wygasanie do końca radDurS.
 */
export function flashIntensity(t: number, f: FlashTimes): number {
  if (t < 0 || t > f.radDurS) return 0;
  const contact = t < 0.01 ? 1 : Math.max(0, 1 - Math.log10(t / 0.01) / Math.log10(f.tMaxRad / 0.01));
  const fireball = t <= f.tMaxRad
    ? 0.55 + 0.45 * (t / f.tMaxRad)
    : Math.exp((-3 * (t - f.tMaxRad)) / (f.radDurS - f.tMaxRad));
  return Math.min(1, Math.max(contact, fireball));
}

/** Krycie rozbłysku całej mapy (0…maxA): tylko przy kontakcie, gaśnie logarytmicznie do ~1 s. */
export function washOpacity(t: number, maxA = 0.32): number {
  if (t < 0 || t >= 1) return 0;
  if (t <= 0.01) return maxA;
  return maxA * (1 - Math.log10(t / 0.01) / 2);
}
