/**
 * Przewodnik: kolejne kroki ustawiają czas, widok i warstwy, a karta opisuje, co widać.
 * Tekst jest jakościowy — każda liczba pochodzi z rejestru (lista paramIds, wyświetlana przez Value ze źródłami).
 */
import type { Txt } from '../model/registry/types';
import type { PhenomenonKey, ViewKey } from './url-state';
import { T_MAX } from '../time/axis';

export interface GuideStep {
  title: Txt;
  /** czas w s; wartość ujemna — prolog */
  t: number | 'entry';
  view: ViewKey;
  layers?: Partial<Record<PhenomenonKey, boolean>>;
  site?: string | null;
  text: Txt;
  paramIds: string[];
}

export const GUIDE: GuideStep[] = [
  { title: { pl: 'Przelot przez atmosferę', en: 'Atmospheric entry' }, t: 'entry', view: 'closeup',
    text: {
      pl: 'Asteroida — najpewniej chondryt węglisty — nadlatuje z północnego wschodu pod stromym kątem. Atmosferę pokonuje w kilka sekund; sprężone przed nią powietrze rozgrzewa się do świecenia. Kierunek i kąt są sporne — to scenariusz referencyjny.',
      en: 'The asteroid — most likely a carbonaceous chondrite — arrives from the north-east at a steep angle. It crosses the atmosphere in a few seconds; the air compressed ahead of it heats until it glows. The direction and angle are contested — this is the reference scenario.',
    },
    paramIds: ['impactor.diameter', 'impactor.velocity', 'impactor.angle', 'impactor.approach_azimuth', 'impactor.entry_duration'] },
  { title: { pl: 'Kontakt i błysk', en: 'Contact and flash' }, t: 0.03, view: 'closeup',
    text: {
      pl: 'W chwili kontaktu impaktor wnika w płytkie morze i skorupę, a jego energia ruchu w ułamku sekundy zamienia się w falę uderzeniową, ciepło i parę skalną. Rodzi się gorący pióropusz par.',
      en: 'At contact the impactor drives into the shallow sea and the crust, and within a fraction of a second its energy of motion turns into a shock wave, heat and rock vapour. A hot vapour plume is born.',
    },
    paramIds: ['energy.kinetic', 'energy.tnt', 'fireball.plume_initial_temperature'] },
  { title: { pl: 'Wykop krateru i kurtyna ejecta', en: 'Excavation and the ejecta curtain' }, t: 20, view: 'closeup',
    text: {
      pl: 'Fala uderzeniowa wypycha skały na zewnątrz i w górę: rośnie krater przejściowy, a z jego krawędzi wychodzi stożkowa kurtyna wyrzutów. Nad kraterem wznosi się pióropusz par, którego najszybsza część ucieka w przestrzeń.',
      en: 'The shock wave pushes rock outward and upward: the transient crater grows and a cone-shaped curtain of ejecta rises from its rim. Above the crater the vapour plume climbs, its fastest part escaping into space.',
    },
    paramIds: ['crater.transient_diameter', 'crater.transient_depth', 'crater.t_transient_max', 'fireball.plume_upper_velocity'] },
  { title: { pl: 'Wypiętrzenie centralne', en: 'Central uplift' }, t: 180, view: 'section',
    text: {
      pl: 'Dno krateru przejściowego jest niestabilne: skały z głębi odbijają i wznoszą się wyżej niż pierwotna powierzchnia. Przerywane linie pokazują, jak wyginają się warstwy, które przed uderzeniem leżały poziomo.',
      en: 'The floor of the transient crater is unstable: deep rocks rebound and rise above the original surface. The dashed lines show how layers that lay flat before the impact are bent.',
    },
    paramIds: ['crater.central_uplift_max_height', 'crater.t_uplift_max', 'crust.central_structural_uplift'] },
  { title: { pl: 'Pierścień szczytowy i krater końcowy', en: 'Peak ring and final crater' }, t: 600, view: 'section',
    text: {
      pl: 'Wypiętrzenie zapada się na zewnątrz i tworzy pierścień szczytowy — ten sam, który przewierciła ekspedycja IODP-ICDP 364 (otwór M0077A). Ściany krateru osiadają tarasami, dno wyściela stop impaktowy.',
      en: 'The uplift collapses outward and forms the peak ring — the very ring drilled by IODP-ICDP Expedition 364 (hole M0077A). The crater walls slump into terraces and impact melt lines the floor.',
    },
    paramIds: ['crater.peak_ring_diameter', 'crater.final_diameter', 'crater.t_final', 'crust.peak_ring_origin_depth'] },
  { title: { pl: 'Fala brzeżna', en: 'The rim wave' }, t: 600, view: 'closeup', layers: { tsunami: true },
    text: {
      pl: 'Woda wypchnięta przez kurtynę ejecta piętrzy się w ścianę wokół krateru. Po kilku minutach opada i rozchodzi się jako tsunami — głównie ku głębszym wodom na północy i wschodzie, bo na południu było płytko.',
      en: 'Water pushed by the ejecta curtain piles up into a wall around the crater. After a few minutes it collapses and spreads as a tsunami — mainly towards the deeper waters to the north and east, because the south was shallow.',
    },
    paramIds: ['tsunami.wave_height_150s', 'tsunami.initial_amplitude', 'tsunami.rim_wave_radius_600s'] },
  { title: { pl: 'Tanis: deszcz sferul', en: 'Tanis: a rain of spherules' }, t: 900, view: 'map2d', site: 'tanis',
    text: {
      pl: 'Kilka tysięcy kilometrów dalej, w dzisiejszej Dakocie Północnej, z nieba zaczynają padać szkliste sferule — ryby w rzece wciągają je skrzelami. Sonda zestawia czasy z modelu z tym, co odczytano ze stanowiska.',
      en: 'Thousands of kilometres away, in today’s North Dakota, glassy spherules start falling from the sky — fish in the river draw them into their gills. The probe compares the model timings with what was read from the site.',
    },
    paramIds: ['biosphere.tanis_spherule_arrival', 'biosphere.tanis_fish_with_spherules', 'seismic.tanis_distance'] },
  { title: { pl: 'Impuls cieplny i pożary', en: 'Thermal pulse and fires' }, t: 1800, view: 'globe', layers: { thermal: true, fires: true },
    text: {
      pl: 'Ejecta wracające z przestrzeni rozgrzewają górną atmosferę i promieniują w dół. Czy podczerwień zapaliła lasy na całym świecie, czy tylko w Ameryce Północnej — to spór; zapis węgla drzewnego wskazuje raczej na pożary regionalne.',
      en: 'Ejecta falling back from space heat the upper atmosphere, which radiates downward. Whether the infrared ignited forests worldwide or only in North America is debated; the charcoal record points rather to regional fires.',
    },
    paramIds: ['thermal.ignition_litter', 'temperature.ground_max_na', 'fires.ignition_radius_fireball'] },
  { title: { pl: 'Fala ciśnienia okrąża Ziemię', en: 'The pressure wave circles the Earth' }, t: 3 * 3600, view: 'map2d', layers: { air: true, bio: true },
    text: {
      pl: 'Fala ciśnienia w atmosferze biegnie wokół globu z prędkością znaną z erupcji Hunga Tonga. Blisko krateru wiatr za jej frontem powala lasy — zielone strefy pokazują pasmo między dolną a górną granicą.',
      en: 'An atmospheric pressure wave races around the globe at the speed known from the Hunga Tonga eruption. Near the crater the wind behind its front flattens forests — the green zones show the band between the lower and upper bound.',
    },
    paramIds: ['airblast.lamb_speed', 'biosphere.tree_blowdown_total_wind', 'biosphere.tree_blowdown_partial_wind'] },
  { title: { pl: 'Tsunami w oceanach', en: 'Tsunami in the oceans' }, t: 4 * 3600, view: 'globe', layers: { tsunami: true },
    text: {
      pl: 'Po kilku godzinach tsunami opuszcza Zatokę, wchodzi na Atlantyk i przez cieśninę między Amerykami na Pacyfik. Na otwartym oceanie fala jest długa i niska — groźna dopiero przy brzegach.',
      en: 'After a few hours the tsunami leaves the Gulf, enters the Atlantic and, through the seaway between the Americas, the Pacific. In the open ocean the wave is long and low — dangerous only at the coasts.',
    },
    paramIds: ['tsunami.front_radius_4h_east', 'tsunami.t_pacific_entry', 'tsunami.open_ocean_height_north_atlantic'] },
  { title: { pl: 'Koniec doby: zapada ciemność', en: 'End of the day: darkness falls' }, t: T_MAX, view: 'globe', layers: { atmo: true },
    text: {
      pl: 'Pył, sadza i aerozole siarczanowe zaczynają przyciemniać niebo na całym globie. Przebieg zaciemnienia w pierwszej dobie to model predykcyjny projektu (△) — literatura opisuje głównie stan po tygodniach i miesiącach.',
      en: 'Dust, soot and sulfate aerosols begin to darken the sky over the whole globe. How the darkening unfolds during the first day is the project’s predictive model (△) — the literature mostly describes the state after weeks and months.',
    },
    paramIds: ['atmosphere.dust_tau_scale_pred', 'atmosphere.soot_mass', 'atmosphere.sulfur_mass'] },
  { title: { pl: 'Epilog: poza osią czasu', en: 'Epilogue: beyond the timeline' }, t: T_MAX, view: 'globe', layers: { atmo: true },
    text: {
      pl: 'Potem przychodzą miesiące ciemności i chłodu: fotosynteza zamiera, łańcuchy pokarmowe się załamują, morza się ochładzają. Wymiera większość gatunków — to już poza zakresem tej symulacji.',
      en: 'Then come months of darkness and cold: photosynthesis stalls, food chains collapse, the seas cool. Most species die out — this lies beyond the scope of this simulation.',
    },
    paramIds: ['atmosphere.light_below_1pct_duration', 'biosphere.brazos_sst_drop_max', 'biosphere.extinction_species_fraction'] },
];
