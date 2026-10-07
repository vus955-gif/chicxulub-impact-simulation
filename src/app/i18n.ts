/**
 * Język interfejsu (PL/EN). Polski jest językiem źródłowym; teksty angielskie podawane obok w miejscu użycia
 * (L('…', '…')) albo jako obiekty { pl, en } w modułach, które budują opisy (sonda, legenda, przewodnik).
 * Zmiana języka przebudowuje interfejs ({#key ui.lang} w App.svelte), więc liczby i etykiety odświeżają się razem.
 */
import { ui } from './state.svelte';
import { CERTAINTY_LABEL, CERTAINTY_LABEL_EN, setNumberLocale } from '../model/registry/format';
import type { Certainty, Parameter, Source, Txt } from '../model/registry/types';
import type { LangKey } from './url-state';

export type { Txt };

export const L = (pl: string, en: string): string => (ui.lang === 'en' ? en : pl);
export const tx = (t: Txt | string): string => (typeof t === 'string' ? t : ui.lang === 'en' ? t.en : t.pl);
export const certLabel = (c: Certainty): string => (ui.lang === 'en' ? CERTAINTY_LABEL_EN[c] : CERTAINTY_LABEL[c]);

export const pLabel = (p: Pick<Parameter, 'label' | 'labelEn'>): string => (ui.lang === 'en' && p.labelEn ? p.labelEn : p.label);
export const pNotes = (p: Pick<Parameter, 'notes' | 'notesEn'>): string | undefined => (ui.lang === 'en' && p.notesEn ? p.notesEn : p.notes);
export const pMethod = (p: Pick<Parameter, 'method' | 'methodEn'>): string => (ui.lang === 'en' && p.methodEn ? p.methodEn : p.method);
export const sNotes = (s: Pick<Source, 'notes' | 'notesEn'>): string | undefined => (ui.lang === 'en' && s.notesEn ? s.notesEn : s.notes);
export const siteName = (s: { name: string; nameEn?: string }): string => (ui.lang === 'en' && s.nameEn ? s.nameEn : s.name);
export const obsText = (o: { text: string; textEn?: string }): string => (ui.lang === 'en' && o.textEn ? o.textEn : o.text);

export function setLang(l: LangKey): void {
  setNumberLocale(l === 'en' ? 'en-US' : 'pl-PL');
  document.documentElement.lang = l;
  document.title = l === 'en' ? 'Chicxulub — the first 24 hours' : 'Chicxulub — pierwsze 24 godziny';
  ui.lang = l;
}

/** Język startowy: z adresu (#lang=…), inaczej z języka przeglądarki. */
export const browserLang = (): LangKey => (typeof navigator !== 'undefined' && /^pl\b/i.test(navigator.language) ? 'pl' : 'en');
