/**
 * Wielkości pochodne scenariusza referencyjnego — liczone z wejść w research/parameters.json.
 * Prawa skalowania: Collins, Melosh & Marcus 2005 (EIEP). Czasy fal ciała: ak135 (data/derived).
 * Wynik: research/derived.json (generowany — nie edytować ręcznie).
 */
import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import type { Certainty, Parameter, TimeSpec } from '../src/model/registry/types';
import * as eiep from '../src/model/eiep';

const lit = JSON.parse(readFileSync('research/parameters.json', 'utf8')) as { parameters: Parameter[] };
const sources = JSON.parse(readFileSync('research/sources.json', 'utf8')) as { sources: Array<{ id: string; doi?: string }> };
const ak135 = JSON.parse(readFileSync('data/derived/ak135-first-arrivals.json', 'utf8')) as { firstArrival_s: { P: number[]; S: number[] } };

const srcByDoi = (prefix: string): string => {
  const id = sources.sources.find((s) => s.doi?.toLowerCase().startsWith(prefix.toLowerCase()))?.id;
  if (!id) throw new Error(`source with DOI ${prefix}* missing from sources.json`);
  return id;
};
const COLLINS2005 = srcByDoi('10.1111/j.1945-5100.2005');
const AK135 = srcByDoi('10.1111/j.1365-246X.1995.tb03540.x');

const num = (id: string): number => {
  const v = lit.parameters.find((p) => p.id === id)?.value;
  if (typeof v !== 'number') throw new Error(`missing numeric input ${id}`);
  return v;
};

const IMPACT_INPUTS = ['impactor.diameter', 'impactor.density', 'impactor.velocity', 'impactor.angle', 'target.density'];
const i: eiep.ImpactInput = {
  L: num('impactor.diameter') * 1e3,
  rhoI: num('impactor.density'),
  v: num('impactor.velocity') * 1e3,
  thetaDeg: num('impactor.angle'),
  rhoT: num('target.density'),
};
const DtcLit = num('crater.transient_diameter') * 1e3;   // krater przejściowy z obserwacji/modeli (do ejecta)
const DfrLit = num('crater.final_diameter') * 1e3;
const U_R = num('seismic.rayleigh_group_velocity');       // km/s
const C_LAMB = num('airblast.lamb_speed');                // m/s

const out: Parameter[] = [];
const add = (
  id: string, label: string, value: number, unit: string, method: string, derivedFrom: string[],
  opts: { sources?: string[]; certainty?: Certainty; notes?: string; time?: TimeSpec | null } = {},
) => {
  out.push({
    id, group: id.split('.')[0]!, label, value, unit, range: null,
    certainty: opts.certainty ?? 'extrapolation', method: `derived:${method}`,
    sources: opts.sources ?? [COLLINS2005], derivedFrom, notes: opts.notes, time: opts.time ?? null,
  });
};

// ── impaktor i energia ──
const mass = (Math.PI / 6) * i.rhoI * i.L ** 3;
const E = eiep.kineticEnergy(i);
add('impactor.mass', 'Masa impaktora', mass, 'kg', 'sphere(L,ρ)', ['impactor.diameter', 'impactor.density']);
add('energy.kinetic', 'Energia kinetyczna (scenariusz referencyjny)', E, 'J', 'eiep.kineticEnergy', IMPACT_INPUTS);
add('energy.tnt', 'Energia w ekwiwalencie TNT', E / eiep.J_PER_MT, 'Mt TNT', 'eiep.kineticEnergy', IMPACT_INPUTS,
  { notes: '1 Mt TNT = 4,184 × 10¹⁵ J.' });
const entry = 100e3 / (i.v * Math.sin(i.thetaDeg * eiep.DEG));
add('impactor.entry_duration', 'Czas przelotu od 100 km wysokości do powierzchni', entry, 's', 'geometry(100 km / (v sinθ))',
  ['impactor.velocity', 'impactor.angle'],
  { notes: 'Prostoliniowo, bez hamowania — dla ciała ~13 km utrata prędkości w atmosferze jest pomijalna (eq. 8 Collins i in. 2005 daje < 0,1 %). Brak publikowanej wartości dla Chicxulub.',
    time: { t: -entry } });

// ── kontrola krzyżowa krateru (EIEP vs obserwacja) ──
const DtcE = eiep.transientCraterDiameter(i);
const DfrE = eiep.finalCraterDiameter(DtcE);
add('crater.transient_diameter_eiep', 'Średnica krateru przejściowego wg EIEP (kontrola)', DtcE / 1e3, 'km', 'eiep.transientCraterDiameter', IMPACT_INPUTS);
add('crater.final_diameter_eiep', 'Średnica krateru końcowego wg EIEP (kontrola)', DfrE / 1e3, 'km', 'eiep.finalCraterDiameter', IMPACT_INPUTS);
add('crater.final_depth_eiep', 'Głębokość krateru końcowego wg EIEP', eiep.finalCraterDepth(DfrLit) / 1e3, 'km', 'eiep.finalCraterDepth(errata 2013)', ['crater.final_diameter']);
add('crater.melt_volume_eiep', 'Objętość stopu impaktowego wg EIEP', eiep.meltVolume(E, i.thetaDeg) / 1e9, 'km³', 'eiep.meltVolume', IMPACT_INPUTS);
add('impactor.diameter_for_crater_eiep', 'Średnica impaktora, przy której EIEP odtwarza zmierzony krater', eiep.impactorDiameterForCrater(DfrLit, i) / 1e3, 'km',
  'eiep.impactorDiameterForCrater', [...IMPACT_INPUTS.filter((x) => x !== 'impactor.diameter'), 'crater.final_diameter'],
  { notes: 'Kontrola krzyżowa: uproszczone prawo skalowania wymaga większego impaktora niż modele hydrokodowe 3D.' });

// ── kula ognia ──
add('fireball.radius_eiep', 'Promień kuli ognia w maksimum promieniowania', eiep.fireballRadius(E) / 1e3, 'km', 'eiep.fireballRadius', IMPACT_INPUTS);
add('fireball.t_max_radiation_eiep', 'Czas maksimum promieniowania kuli ognia', eiep.timeOfMaxRadiation(E, i.v), 's', 'eiep.timeOfMaxRadiation', IMPACT_INPUTS,
  { time: { t: eiep.timeOfMaxRadiation(E, i.v) } });
add('fireball.radiation_duration_eiep', 'Czas trwania promieniowania kuli ognia', eiep.radiationDuration(E) / 60, 'min', 'eiep.radiationDuration', IMPACT_INPUTS,
  { notes: 'Wprost proporcjonalny do sprawności świetlnej η, niepewnej o ~2 rzędy wielkości (fireball.luminous_efficiency).' });

// ── sejsmika ──
const M = eiep.seismicMagnitude(E);
add('seismic.magnitude_eiep', 'Magnituda sejsmiczna (EIEP, sprawność 10⁻⁴)', M, '', 'eiep.seismicMagnitude', IMPACT_INPUTS,
  { notes: 'Zależy od sprawności sejsmicznej (seismic.efficiency, sporne: 10⁻⁵–10⁻³ ⇒ ±0,67 magnitudy).' });
const deg = (km: number) => Math.min(180, Math.round(((km * 1e3) / eiep.R_EARTH) * (180 / Math.PI)));
const antipodeKm = Math.PI * eiep.R_EARTH / 1e3;
add('seismic.t_p_antipode', 'Fala P (PKIKP) na antypodach', ak135.firstArrival_s.P[180]!, 's', 'ak135(180°)', ['site.lat'],
  { sources: [AK135], notes: 'Pierwsze wejście fali typu P dla źródła na powierzchni (ObsPy TauP, model ak135).', time: { t: ak135.firstArrival_s.P[180]! } });
add('seismic.t_s_antipode', 'Fala typu S (SKIKS) na antypodach', ak135.firstArrival_s.S[180]!, 's', 'ak135(180°)', ['site.lat'],
  { sources: [AK135], time: { t: ak135.firstArrival_s.S[180]! } });

// ── paleopołożenie krateru (PALEOMAP przez pyGPlates; scripts/reconstruct_sites_local.py) ──
if (existsSync('research/sites.json')) {
  const sj = JSON.parse(readFileSync('research/sites.json', 'utf8')) as { timeMa: number; sites: Array<{ id: string; paleoLat: number; paleoLon: number; plateId: number }> };
  const c = sj.sites.find((x) => x.id === 'chicxulub');
  if (c) {
    const from = ['site.lat', 'site.lon', 'paleo.paleodem_plate_model_age'];
    const note = `Model płyt PALEOMAP (płyta ${c.plateId}), rekonstrukcja na ${sj.timeMa} mln lat — ten sam wiek co mapa PaleoDEM nr 16; zgodne z szerokością z paleomagnetyzmu (site.paleolatitude).`;
    add('site.paleo_lat', 'Paleoszerokość krateru (PALEOMAP)', c.paleoLat, '°', 'pygplates(PALEOMAP)', from, { sources: ['scotese2016', 'pygplates2025'], notes: note });
    add('site.paleo_lon', 'Paleodługość krateru (PALEOMAP)', c.paleoLon, '°', 'pygplates(PALEOMAP)', from, { sources: ['scotese2016', 'pygplates2025'], notes: note });
  }
}

// ── tabele w funkcji odległości ──
const DIST_KM = [200, 500, 1000, 2000, 3000, 5000, 10000];
for (const d of DIST_KM) {
  const r = d * 1e3;
  const sfx = `${d}km`;
  const dl = `${d.toLocaleString('pl-PL')} km`;
  add(`thermal.exposure_eiep_${sfx}`, `Ekspozycja cieplna od kuli ognia, ${dl}`, eiep.thermalExposure(E, r, i.v) / 1e6, 'MJ/m²', 'eiep.thermalExposure', IMPACT_INPUTS,
    { notes: 'Zero = kula ognia pod horyzontem. Nie obejmuje impulsu podczerwieni od opadających ejecta (thermal.ir_*).' });
  add(`seismic.m_eff_eiep_${sfx}`, `Efektywna magnituda wstrząsów, ${dl}`, eiep.effectiveMagnitude(M, d), '', 'eiep.effectiveMagnitude', IMPACT_INPUTS);
  add(`seismic.p_arrival_${sfx}`, `Dotarcie fali P, ${dl}`, ak135.firstArrival_s.P[deg(d)]!, 's', `ak135(${deg(d)}°)`, ['site.lat'], { sources: [AK135] });
  add(`seismic.s_arrival_${sfx}`, `Dotarcie fali S, ${dl}`, ak135.firstArrival_s.S[deg(d)]!, 's', `ak135(${deg(d)}°)`, ['site.lat'], { sources: [AK135] });
  add(`seismic.rayleigh_arrival_${sfx}`, `Dotarcie fali Rayleigha (R1), ${dl}`, d / U_R, 's', 'distance / U_R', ['seismic.rayleigh_group_velocity'], { sources: [] });
  add(`ejecta.thickness_eiep_${sfx}`, `Grubość ejecta, ${dl}`, eiep.ejectaThickness(DtcLit, r), 'm', 'eiep.ejectaThickness(D_tc z obserwacji)', ['crater.transient_diameter']);
  add(`ejecta.arrival_eiep_${sfx}`, `Dotarcie ejecta balistycznych, ${dl}`, eiep.ejectaArrivalTime(r), 's', 'eiep.ejectaArrivalTime (Kepler, 45°)', ['site.lat'],
    { notes: d >= 10000 ? 'Granica stosowalności EIEP (r ≲ 10 000 km); dalej — modele ejecta dystalnych.' : undefined });
  const p = eiep.airblastOverpressure(E, r);
  add(`airblast.overpressure_eiep_${sfx}`, `Nadciśnienie fali uderzeniowej, ${dl}`, p, 'Pa', 'eiep.airblastOverpressure', IMPACT_INPUTS,
    { notes: 'Collins i in. 2005: dla E > 10⁴ Mt model prawdopodobnie zawyża nadciśnienie 2–5× — rząd wielkości.' });
  add(`airblast.wind_eiep_${sfx}`, `Maksymalny wiatr za frontem, ${dl}`, eiep.peakWind(p), 'm/s', 'eiep.peakWind', IMPACT_INPUTS);
  add(`sound.spl_eiep_${sfx}`, `Poziom ciśnienia akustycznego, ${dl}`, 20 * Math.log10(p / 20e-6), 'dB', 'SPL = 20 log10(p / 20 µPa)', [`airblast.overpressure_eiep_${sfx}`],
    { notes: 'Powyżej ~194 dB to fala uderzeniowa, nie dźwięk w sensie akustycznym.' });
  add(`airblast.lamb_arrival_${sfx}`, `Dotarcie fali Lamba (ciśnienia), ${dl}`, r / C_LAMB, 's', 'distance / c_Lamb', ['airblast.lamb_speed'], { sources: [] });
}

writeFileSync('research/derived.json', JSON.stringify({ generatedBy: 'scripts/derive-parameters.ts', generatedAt: new Date().toISOString(), antipodeKm, parameters: out }, null, 2) + '\n');
console.log(`derived parameters: ${out.length}`);
for (const p of out.filter((x) => !/_\d+km$/.test(x.id))) console.log(`  ${p.id} = ${typeof p.value === 'number' ? p.value.toPrecision(4) : p.value} ${p.unit}`);
