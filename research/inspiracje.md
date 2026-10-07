# Inspiracje UI/UX: istniejące wizualizacje uderzeń (wątek 08)

> **Zakres:** tylko wzorce interfejsu. **Z tych materiałów nic nie trafia do rejestru badań jako fakt**: liczby, czasy i amplitudy pominięto celowo.
> Przegląd z 2026-10-04. Oznaczenia weryfikacji: **P** = otwarte i przeklikane w przeglądarce, **S** = pobrana strona lub publikacja źródłowa, **O** = tylko opis wtórny.

## 1. Przegląd

| Pozycja (wer.) | URL | Co pożyczyć | Czego unikać |
|---|---|---|---|
| **neal.fun Asteroid Launcher** (P) | neal.fun/asteroid-launcher | Panel parametrów po prawej (karuzela typu + 3 suwaki). Po starcie kolumna wyników działa jak *scrollytelling*: przewinięcie do sekcji efektu (krater → kula ognia → fala uderzeniowa → wiatr → trzęsienie) oddala mapę i podmienia pierścień. Kluczowe odległości w wyróżnionych „pigułkach”. | Brak czasu (efekty jako statyczne pierścienie), pojedyncze wartości bez zakresu, brak źródeł w UI, anegdotyczne porównania. |
| **Impact: Earth!** (Purdue) (P) | purdue.edu/impactearth | Ciemny motyw; presety „słynnych kraterów” (w tym Chicxulub); pole odległości obserwatora; zakładki wyników w kolejności fizycznej (energia → wejście w atmosferę → krater → termika → sejsmika → ejekta → fala powietrzna → tsunami). | Zakładki ukrywają jednoczesność zjawisk; brak mapy i osi czasu. |
| **Earth Impact Effects Program** (Collins, Melosh, Marcus) (S) | impact.ese.ic.ac.uk/ImpactEarth/ImpactEffects/ | Wynik liczony dla wybranej odległości: co dzieje się w tym miejscu i **kiedy to dociera** (wstrząsy, ejekta, fala powietrzna), plus słowny opis skutków (skala Mercallego). To gotowy wzór dla naszej sondy. Link do publikacji z równaniami. | Ściana tekstu; niepewność podana tylko jako ogólne „no warranty”. |
| **Ancient Earth** (I. Webster, mapy C. R. Scotese) (P) | dinosaurpictures.org/ancient-earth | Wyszukiwarka „wpisz miasto” pokazuje to miejsce na paleoglobie; cienkie dzisiejsze granice na paleogeografii; ←/→ przechodzą między epokami; stan zapisany w URL (`#66`); przełączniki (obrót, chmury, równik, oświetlenie); podana dokładność map. | Statyczne chmury i gwiazdy niezgodne z epoką. Dekoracja nie może wyglądać jak dane. |
| **Range i in. 2022, AGU Advances** (ryciny + filmy SI) (S) | doi.org/10.1029/2021AV000627 | Dwa etapy: przekrój bliskiego pola (barwy materiałów: skorupa brąz, osady żółć, ocean błękit; film w stałym kroku), potem model globalny. Dwa modele obok siebie (MOST i MOM6) pokazują niepewność modelu. Mapa **obwiedni maksimum** obok klatek chwilowych. Dzisiejsze kontury jako szara linia. | Dwa różne zegary („po uderzeniu” i „po przekazaniu”). U nas wszystko liczymy od jednego t₀. |
| **NOAA Science On a Sphere**, „Tsunami: Asteroid Impact – 66 Million Years Ago” (S) | sos.noaa.gov/catalog/datasets/tsunami-asteroid-impact-66-million-years-ago/ | Podwójna geografia: czarne paleokontynenty + białe dzisiejsze granice; skala rozbieżna czerwień (+) / błękit (−); licznik godzin pod paskiem skali; format muzealnej kuli. | Przycięta skala bez oznaczenia wartości poza zakresem. |
| **NOAA NCEI Tsunami Travel Time Maps** (S) | ncei.noaa.gov/products/natural-hazards/tsunamis-earthquakes-volcanoes/tsunamis/travel-time-maps | Izochrony przybycia fali; mapa wprost mówi, że pokazuje *tylko czas*, a nie wysokość; lista źródeł błędu. | Pasma barw dla czasu mylą się z barwami zagrożenia. |
| **EarthScope/IRIS Ground Motion Visualization** (S) | iris.edu/hq/programs/epo/visualizations | Stacje barwione ruchem pionowym (czerwień w górę, błękit w dół, nasycenie = amplituda) + **sejsmogram z przesuwającym się paskiem czasu**, który odsłania kolejno P, S i fale powierzchniowe. Mapa i szereg czasowy są połączone. | Normalizacja amplitud bez komunikatu ukrywa skalę bezwzględną. |
| **NASA SVS 31277**, fale grawitacyjne Hunga Tonga (S) | svs.gsfc.nasa.gov/31277 | Obraz różnicowy (klatka minus poprzednia) wydobywa słaby rozchodzący się front. *W SVS nie znaleziono pozycji o skutkach Chicxulub*, jest tylko relief SRTM Jukatanu. | Płaska mapa: front rozcina się na krawędziach. |
| **NUKEMAP** (A. Wellerstein) (S) | nuclearsecrecy.com/nukemap/ | Osobny checkbox dla każdego efektu; pierścienie progowe ze słownym opisem skutku; ikona [?] przy każdej opcji; opcje zaawansowane schowane; eksport. | Wszystkie pierścienie naraz i bez czasu; legenda puchnie. |
| **CNEOS PDC**, ocena ryzyka (NASA Ames PAIR) (S) | cneos.jpl.nasa.gov/pd/cs/pdc25/ | Niepewność jako **5. percentyl / mediana / 95. percentyl** zasięgów; legenda poziomów zniszczeń ze słownym opisem; mapa „pasa ryzyka”. | Gęstość slajdu konferencyjnego. |
| **Windy / earth.nullschool** (O / S) | windy.com · earth.nullschool.net | Oś czasu na dole (odtwarzanie + przeciąganie); menu warstw; klik stawia pinezkę i otwiera **meteogram punktu**; krokowanie klawiszami (j/k); palety percepcyjne (cubehelix, ColorBrewer, Kindlmann). | Za dużo warstw naraz (Windy); tylko jedna nakładka naraz (nullschool). |
| **Deep Time Navigator** (G. Oberbrunner) (P) | deep-timeline.org | Ciemna oś logarytmiczna z etykietą w zwykłych jednostkach co dekadę („5 dni”, „5 godz.”, „20 min temu”); presety zakresu; filtry kategorii; przeciąganie przesuwa, kółko przybliża. | Ukośne, nachodzące na siebie etykiety zdarzeń. |
| **ChronoZoom** (MSR + UC Berkeley, wycofany), **Scale of the Universe 2** (O) | htwins.net/scale2 | Zagnieżdżone przedziały czasu i wycieczki z narracją; suwak przez rzędy wielkości, klik w obiekt otwiera kartę. | Zoom liniowy zmusza do głębokiego przybliżania. To argument za osią logarytmiczną. |
| **Collins i in. 2020, Nat. Commun.** (S) | doi.org/10.1038/s41467-020-15269-x | Przekrój wzdłuż trajektorii: materiały w odcieniach (osady piaskowe, skorupa szara, płaszcz ciemnoszary), szczytowe ciśnienie w skali biel → błękit, stop na czerwono; warianty kąta obok siebie; szare pasy niepewności obserwacyjnej. | (materiał statyczny, nie interfejs) |

## 2. Wzorce do wdrożenia w naszym dashboardzie

**Oś czasu (logarytmiczna, 0,01 s – 24 h)**
1. Etykiety co dekadę w zwykłych jednostkach: 0,01 s · 0,1 s · 1 s · 10 s · 1 min · 10 min · 1 h · 6 h · 24 h. Etykiety zdarzeń tylko w torach zjawisk, z unikaniem kolizji, nigdy ukośnie.
2. Odtwarzanie ze stałą liczbą dekad na sekundę ekranu, z przełącznikiem „czas rzeczywisty”. Presety „sekundy / minuty / godziny”.
3. Klawisze ←/→ skaczą do poprzedniego/następnego znacznika zdarzenia, Shift+←/→ o dekadę.
4. Na osi znacznik **zmiany etapu modelu** (np. z bliskiego pola do modelu globalnego) z podpowiedzią, żeby przełączyć widok z 3D close-up na glob. Jeden zegar t₀ dla wszystkich widoków.

**Warstwy i kolor**

5. Każde zjawisko ma jedną rodzinę barw, wspólną dla przełącznika warstwy, toru na osi, frontu na globie i wiersza w sondzie. Natężenie w obrębie warstwy oddaje jasność. Skale rozbieżne tylko dla wielkości ze znakiem (tsunami ±).
6. Oddzielić **front** (cienka linia lub izochrona: fale P/S/powierzchniowe jak w GMV, fala ciśnienia, tsunami) od **pola** (wypełnienie). Opcjonalny tryb izochron jak w NCEI.
7. Przełącznik „stan chwilowy ↔ maksimum do chwili t”, czyli obwiednia jak u Range i in.
8. Słabe fronty wyróżniać krawędzią albo różnicą czasową, nie surowym polem (jak SVS Tonga).
9. Paleogeografia jako wypełnienie, dzisiejsze wybrzeża i granice jako cienkie linie (przełączalne). Wyszukiwarka „gdzie było moje miasto”.
10. Pasek skali z trójkątnymi końcami, gdy wartości wychodzą poza zakres. W panelu warstw kropka aktywności, gdy zjawisko trwa w bieżącym t, oraz [?] ze słownym opisem progów (jak NUKEMAP).

**Sonda punktowa**

11. Klik stawia pinezkę i otwiera mini-meteogram z tymi samymi torami co oś główna i wspólnym kursorem czasu (Windy + GMV). Pod nim chronologia tekstowa w stylu Impact Effects („dociera po…, odczuwalne jako…”) ze znakiem pewności przy każdym wierszu. Do tego odległość i azymut od krateru oraz dzisiejsza nazwa miejsca.

**Niepewność i źródła**

12. Zakresy zamiast pojedynczych liczb: pierścień jako pas 5–95 % z linią mediany (PAIR); szare pasy ograniczeń obserwacyjnych na wykresach przekroju (Collins).
13. Modele alternatywne jako przełącznik A/B albo widok dzielony (Range: dwa modele propagacji; Collins: kąty uderzenia).
14. Pod każdą legendą jedna linia „czego ta warstwa nie pokazuje” (jak NCEI).

**Nawigacja i gęstość informacji**

15. Opcjonalny **tryb przewodnika**: kolejne znaczniki osi przełączają kamerę i warstwy (scrollytelling neal.fun, wycieczki ChronoZoom). Swobodna eksploracja pozostaje trybem domyślnym.
16. Kluczowe wartości w „pigułkach”, szczegóły w sekcjach rozwijanych. Bez zakładek, które rozdzielają jednoczesne zjawiska (problem Impact: Earth!).
17. Stan widoku (t, warstwy, sonda, kamera) zapisywany w URL, żeby dało się podlinkować konkretny moment (jak Ancient Earth).

**Antywzorce:** statyczne pierścienie bez czasu; liczby bez zakresu; dekoracje, które wyglądają jak dane; dwa zegary naraz; nachodzące na siebie etykiety; przycięta skala bez oznaczenia.
