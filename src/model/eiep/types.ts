export interface ImpactInput {
  L: number;        // średnica impaktora [m]
  rhoI: number;     // gęstość impaktora [kg/m³]
  v: number;        // prędkość przy powierzchni [m/s]
  thetaDeg: number; // kąt od poziomu [°]
  rhoT: number;     // gęstość celu [kg/m³]
  g?: number;       // [m/s²]
}
