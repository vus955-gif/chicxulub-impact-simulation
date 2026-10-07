import type { ImpactInput } from './types';

/** E = (π/12) ρi L³ v²  (Collins i in. 2005, eq. 1) */
export const kineticEnergy = (i: ImpactInput): number => (Math.PI / 12) * i.rhoI * i.L ** 3 * i.v ** 2;
