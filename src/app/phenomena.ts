import type { Txt } from '../model/registry/types';
import type { PhenomenonKey } from './url-state';

/** Warstwy zjawisk: kolor (klasa .ph-*), grupy rejestru zasilające tor na osi czasu i to, czego warstwa NIE pokazuje. */
export const LANES: Array<{ key: PhenomenonKey; label: Txt; groups: string[]; notShown: Txt }> = [
  { key: 'crater', label: { pl: 'Krater i skorupa', en: 'Crater and crust' }, groups: ['crater', 'crust'],
    notShown: { pl: 'Na mapie i globie tylko obrys; kształt w czasie — widoki Przekrój i Zbliżenie 3D.', en: 'Only the outline on the map and globe; the shape over time is in the Cross-section and 3D close-up views.' } },
  { key: 'thermal', label: { pl: 'Kula ognia i impuls IR', en: 'Fireball and IR pulse' }, groups: ['fireball', 'thermal', 'temperature'],
    notShown: { pl: 'Natężenie zależy od spornego scenariusza; mapa pokazuje strefę trwającego impulsu, nie temperaturę.', en: 'Intensity depends on a contested scenario; the map shows the zone of the ongoing pulse, not temperature.' } },
  { key: 'ejecta', label: { pl: 'Ejecta', en: 'Ejecta' }, groups: ['ejecta'],
    notShown: { pl: 'Front pierwszego dotarcia nad atmosferę; na globie i mapie także trajektorie (orbity z obrotem Ziemi, rozkład △) i rozbłyski ponownego wejścia; grubość warstwy — w sondzie.', en: 'Front of first arrival above the atmosphere; the globe and map also show trajectories (orbits with Earth rotation, distribution △) and re-entry flashes; layer thickness is in the probe.' } },
  { key: 'seismic', label: { pl: 'Fale sejsmiczne', en: 'Seismic waves' }, groups: ['seismic'],
    notShown: { pl: 'Fronty P, S i fal powierzchniowych; amplitudy tylko w sondzie (modele).', en: 'Fronts of P, S and surface waves; amplitudes only in the probe (models).' } },
  { key: 'air', label: { pl: 'Fala ciśnienia', en: 'Pressure wave' }, groups: ['airblast', 'sound'],
    notShown: { pl: 'Front fali Lamba; amplituda daleko od krateru nieznana (spekulacja).', en: 'Lamb-wave front; the amplitude far from the crater is unknown (speculation).' } },
  { key: 'tsunami', label: { pl: 'Tsunami', en: 'Tsunami' }, groups: ['tsunami'],
    notShown: { pl: 'Na otwartym oceanie fala jest niewidoczna dla oka; wysokości to górne granice.', en: 'In the open ocean the wave is invisible to the eye; heights are upper bounds.' } },
  { key: 'fires', label: { pl: 'Pożary', en: 'Fires' }, groups: ['fires'],
    notShown: { pl: 'Zasięg zapłonu od kuli ognia; pożary globalne — sporny scenariusz.', en: 'Ignition range of the fireball; global fires are a contested scenario.' } },
  { key: 'atmo', label: { pl: 'Atmosfera i zaciemnienie', en: 'Atmosphere and darkness' }, groups: ['atmosphere'],
    notShown: { pl: 'Zaciemnienie to model predykcyjny projektu (△), nie pomiar.', en: 'Darkening is the project\'s predictive model (△), not a measurement.' } },
  { key: 'bio', label: { pl: 'Biosfera', en: 'Biosphere' }, groups: ['biosphere'],
    notShown: { pl: 'Strefy z progów EIEP i obserwacji (pasmo = dolna–górna granica); skutki dla konkretnego miejsca — w sondzie.', en: 'Zones from EIEP thresholds and observations (band = lower–upper bound); effects at a specific place are in the probe.' } },
];

export const laneOfGroup = (group: string): PhenomenonKey | undefined => LANES.find((l) => l.groups.includes(group))?.key;
