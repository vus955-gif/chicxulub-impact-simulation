import * as eiep from '../eiep';
import type { LatLon } from './geo';
import type { RegistryIndex } from './registry-client';

export interface Ak135Json { stepDeg: number; firstArrival_s: { P: Array<number | null>; S: Array<number | null> } }
export interface Ak135Table { stepDeg: number; P: Array<number | null>; S: Array<number | null> }

/** Wszystko, czego potrzebują funkcje modelu: rejestr, tablice ak135 i wielkości scenariusza liczone raz. */
export interface SimContext {
  reg: RegistryIndex;
  ak135: Ak135Table;
  crater: LatLon;          // układ paleo (PALEOMAP)
  impact: eiep.ImpactInput;
  energyJ: number;
  transientDiameterM: number; // z obserwacji/modeli (crater.transient_diameter), nie z EIEP
  downrangeAzDeg: number;     // kierunek lotu impaktora = azymut nadlotu + 180°
}

export function createSimContext(reg: RegistryIndex, ak: Ak135Json): SimContext {
  const impact: eiep.ImpactInput = {
    L: reg.num('impactor.diameter') * 1e3,
    rhoI: reg.num('impactor.density'),
    v: reg.num('impactor.velocity') * 1e3,
    thetaDeg: reg.num('impactor.angle'),
    rhoT: reg.num('target.density'),
  };
  return {
    reg,
    ak135: { stepDeg: ak.stepDeg, P: ak.firstArrival_s.P, S: ak.firstArrival_s.S },
    crater: { lat: reg.num('site.paleo_lat'), lon: reg.num('site.paleo_lon') },
    impact,
    energyJ: eiep.kineticEnergy(impact),
    transientDiameterM: reg.num('crater.transient_diameter') * 1e3,
    downrangeAzDeg: (reg.num('impactor.approach_azimuth') + 180) % 360,
  };
}
