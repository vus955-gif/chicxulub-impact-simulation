/**
 * Model a zapis/literatura dla stanowisk: zestawienie tego, co liczy symulacja, z wartościami z publikacji o stanowisku.
 * Wartości literaturowe to często interpretacje autorów (pewność w rejestrze), nie bezpośrednie pomiary.
 */
import type { ProbeReport } from '../model/sim/probe';
import type { RegistryIndex } from '../model/sim/registry-client';
import type { Txt } from '../model/registry/types';

export interface CompareRow {
  label: Txt;
  model: { value: number; unit: string; kind: 'time' | 'number' } | null;
  litParamId: string;
  /** wartość literaturowa: dla parametrów z czasem — chwila zdarzenia (time.t), inaczej wartość */
  lit: { value: number; unit: string; kind: 'time' | 'number' };
  note?: Txt;
}

type Spec = { label: Txt; param: string; litAsTime: boolean; model: (r: ProbeReport) => CompareRow['model']; note?: Txt };

const evT = (kind: string) => (r: ProbeReport) => { const e = r.events.find((x) => x.kind === kind); return e ? { value: e.t, unit: 's', kind: 'time' as const } : null; };
const evNum = (kind: string, labelPl: string) => (r: ProbeReport) => {
  const v = r.events.find((x) => x.kind === kind)?.values.find((x) => x.label.pl.startsWith(labelPl));
  return v && typeof v.value === 'number' ? { value: v.value, unit: v.unit, kind: 'number' as const } : null;
};

const SPECS: Record<string, Spec[]> = {
  tanis: [
    { label: { pl: 'odległość od krateru (paleo)', en: 'distance from the crater (palaeo)' }, param: 'seismic.tanis_distance', litAsTime: false, model: (r) => ({ value: r.distanceKm, unit: 'km', kind: 'number' }) },
    { label: { pl: 'fala P', en: 'P wave' }, param: 'seismic.p_arrival_tanis', litAsTime: true, model: evT('P') },
    { label: { pl: 'fala S', en: 'S wave' }, param: 'seismic.s_arrival_tanis', litAsTime: true, model: evT('S') },
    { label: { pl: 'fale Rayleigha', en: 'Rayleigh waves' }, param: 'seismic.rayleigh_arrival_tanis', litAsTime: true, model: evT('R') },
    { label: { pl: 'początek opadu sferul', en: 'onset of spherule fall' }, param: 'biosphere.tanis_spherule_arrival', litAsTime: true, model: evT('ejecta'), note: { pl: 'model: pierwsze ejecta nad miejscem', en: 'model: first ejecta overhead' } },
    { label: { pl: 'fale przyboju w rzece (sejsze?)', en: 'river surges (seiches?)' }, param: 'seismic.tanis_surge_timing', litAsTime: true, model: evT('R'), note: { pl: 'mechanizm sejsmiczny (sporny) — model: czas fal Rayleigha', en: 'seismic mechanism (contested) — model: Rayleigh-wave time' } },
    { label: { pl: 'bezpośrednie tsunami (co najmniej)', en: 'direct tsunami (at least)' }, param: 'tsunami.t_direct_tsunami_tanis', litAsTime: true, model: evT('tsunami'), note: { pl: 'model: najbliższa komórka oceaniczna mapy', en: 'model: nearest ocean cell of the map' } },
  ],
  el_mimbral: [
    { label: { pl: 'miąższość warstwy zdarzenia', en: 'event-bed thickness' }, param: 'tsunami.mimbral_clastic_unit_thickness', litAsTime: false, model: evNum('ejecta', 'końcowa grubość'), note: { pl: 'model: same ejecta (EIEP); zapis obejmuje też osady tsunami i prądów — powinien być grubszy', en: 'model: ejecta only (EIEP); the record also includes tsunami and current deposits — it should be thicker' } },
  ],
  brazos: [
    { label: { pl: 'miąższość warstwy zdarzenia', en: 'event-bed thickness' }, param: 'tsunami.brazos_event_bed_thickness', litAsTime: false, model: evNum('ejecta', 'końcowa grubość'), note: { pl: 'model: same ejecta (EIEP); warstwa zdarzenia obejmuje też osady tsunami', en: 'model: ejecta only (EIEP); the event bed also includes tsunami deposits' } },
  ],
};

export function siteComparisons(siteId: string, report: ProbeReport, reg: RegistryIndex): CompareRow[] {
  const specs = SPECS[siteId] ?? [];
  const rows: CompareRow[] = [];
  for (const s of specs) {
    const p = reg.opt(s.param);
    if (!p) continue;
    const lit = s.litAsTime && p.time ? { value: p.time.t, unit: 's', kind: 'time' as const } : { value: p.value as number, unit: p.unit, kind: 'number' as const };
    rows.push({ label: s.label, model: s.model(report), litParamId: s.param, lit, note: s.note });
  }
  return rows;
}

/** Stosunek model/literatura (dla tej samej jednostki), do oceny zgodności rzędu wielkości. */
export function ratio(row: CompareRow): number | null {
  if (!row.model || row.model.unit !== (row.lit.kind === 'time' ? 's' : row.lit.unit)) return null;
  if (row.lit.value === 0) return null;
  return row.model.value / row.lit.value;
}
