/** Tekst dwujęzyczny (polski — źródłowy, angielski — tłumaczenie). */
export interface Txt { pl: string; en: string }

export type Certainty = 'fact' | 'extrapolation' | 'speculation' | 'contested' | 'predictive';
export type SourceType = 'article' | 'book' | 'chapter' | 'dataset' | 'software';

export interface Source {
  id: string;              // firstauthorYEAR[a-z]? , np. "collins2005"
  type: SourceType;
  authors: string;         // "Collins, G.S.; Melosh, H.J.; Marcus, R.A."
  year: number;
  title: string;
  container?: string;      // czasopismo / książka / repozytorium
  volume?: string;
  pages?: string;
  doi?: string;            // goły DOI, bez https://doi.org/
  url?: string;
  peerReviewed: boolean;
  verified: boolean;       // ustawiane przez scripts/verify-dois.ts
  notes?: string;
  notesEn?: string;         // tłumaczenie notatki pisanej po polsku (scripts/i18n-en.ts)
}

export interface TimeSpec {
  t: number;                 // sekundy względem T=0 (ujemne = prolog)
  range?: [number, number];
}

export interface Parameter {
  id: string;                // "<group>.<name>", np. "crater.final_diameter"
  group: string;
  label: string;             // etykieta PL
  labelEn?: string;          // etykieta EN (dołączana przy eksporcie)
  value: number | string | null;
  unit: string;              // jednostka do wyświetlenia: "km", "°", "kg/m³", "" …
  range?: [number, number] | null;
  certainty: Certainty;
  method: string;            // "measured" | "model:<srcId>" | "scaling:<opis>" | "derived:<fn>"
  sources: string[];
  locator?: string;          // miejsce w pracy: "Tab. 2; Fig. 3"
  notes?: string;
  notesEn?: string;
  methodEn?: string;
  time?: TimeSpec | null;    // dla zdarzeń na osi czasu
  derivedFrom?: string[];    // dla method "derived:*"
}

export interface Registry {
  parameters: Parameter[];
  sources: Source[];
}
