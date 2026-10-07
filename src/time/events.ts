/** Zdarzenia osi czasu z rejestru (parametry z polem time) i nazwy faz. */
import type { Certainty, Parameter, Txt } from '../model/registry/types';

export interface TimelineEvent { id: string; group: string; label: string; labelEn?: string; t: number; range?: [number, number]; certainty: Certainty; sourceIds: string[] }

export function eventsFromParams(params: Parameter[]): TimelineEvent[] {
  return params
    .filter((p) => p.time && Number.isFinite(p.time.t))
    .map((p) => ({ id: p.id, group: p.group, label: p.label, labelEn: p.labelEn, t: p.time!.t, range: p.time!.range, certainty: p.certainty, sourceIds: p.sources }))
    .sort((a, b) => a.t - b.t);
}

export const nextEvent = (ev: TimelineEvent[], t: number) => ev.find((e) => e.t > t + 1e-9);
export const prevEvent = (ev: TimelineEvent[], t: number) => [...ev].reverse().find((e) => e.t < t - 1e-9);

export interface PhaseThresholds { transientMax: number; peakRing: number; final: number }

export function phaseAt(t: number, thr: PhaseThresholds): Txt {
  if (t < 0) return { pl: 'Przelot przez atmosferę', en: 'Atmospheric entry' };
  if (t < 1) return { pl: 'Kontakt i kompresja', en: 'Contact and compression' };
  if (t < thr.transientMax) return { pl: 'Wykop krateru przejściowego', en: 'Excavation of the transient crater' };
  if (t < thr.peakRing) return { pl: 'Wypiętrzenie i zapadanie dna', en: 'Uplift and collapse of the floor' };
  if (t < thr.final) return { pl: 'Formowanie krateru końcowego', en: 'Formation of the final crater' };
  if (t < 3600) return { pl: 'Rozchodzenie się skutków', en: 'Effects spreading outward' };
  return { pl: 'Skutki globalne', en: 'Global effects' };
}
