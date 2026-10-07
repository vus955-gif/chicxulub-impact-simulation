/** Wejścia scenariusza referencyjnego — muszą istnieć w research/parameters.json jako liczby. */
export const SCENARIO_INPUT_IDS = [
  'impactor.diameter',         // km
  'impactor.density',          // kg/m³
  'impactor.velocity',         // km/s
  'impactor.angle',            // ° od poziomu
  'impactor.approach_azimuth', // ° od N, kierunek, z którego nadleciał
  'target.density',            // kg/m³
  'target.water_depth',        // m
  'site.lat',                  // ° (współczesne)
  'site.lon',                  // °
  'event.age',                 // Ma
] as const;
