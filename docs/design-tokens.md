# Wspólne style i motyw

## Tokeny

`src/styles/tokens.css` jest wspólnym źródłem palety, fontów, odstępów, zaokrągleń i fokusu. Importuje go `src/styles/globals.css` po Tailwind CSS. `src/styles/ui.css` mapuje tę paletę na semantyczne klasy komponentów shadcn/ui i dodaje token obrysu pola oraz błędu. Nowe komponenty powinny korzystać z tokenów zamiast powtarzać wartości kolorów.

| Tokeny                                    | Przeznaczenie                                 |
| ----------------------------------------- | --------------------------------------------- |
| `--canvas`, `--surface`, `--surface-soft` | Tło strony i powierzchnie komponentów         |
| `--ink`, `--muted`                        | Tekst główny i pomocniczy                     |
| `--line`, `--focus-ring`                  | Obramowania i widoczny fokus                  |
| `--accent`, `--accent-soft`               | Wyróżnienia marki                             |
| `--primary`, `--on-primary`               | Główna akcja i tekst na niej                  |
| `--diagram`, `--diagram-line`, `--shadow` | Ilustracja i cienie                           |
| `--violet-*`, `--blue-*`, `--amber-*`     | Pomocnicze kolory ilustracji                  |
| `--font-sans`, `--font-heading`           | Lokalnie dostarczone DM Sans i Manrope        |
| `--space-1` do `--space-4`                | Odstępy 4, 8, 12 i 16 px przy bazie 16 px     |
| `--radius-control`, `--radius-card`       | Zaokrąglenia kontrolek i kart                 |
| `--text-control`, `--control-height`      | Rozmiar tekstu i minimalna wysokość kontrolki |
| `--duration-fast`                         | Czas krótkiej zmiany stanu                    |
| `--overlay-scrim`                         | Przyciemnione tło modalnego okna lub panelu   |

Tailwind udostępnia między innymi `bg-canvas`, `bg-surface`, `text-ink`, `text-brand`, `border-border`, `rounded-control` i `rounded-card`. Istniejące style CSS używają tych samych zmiennych.

Każda para kolorów jest zapisana przez `light-dark()`, a `color-scheme` wybiera odpowiednią paletę. Dzięki temu wymuszony jasny motyw działa także przy ciemnym motywie systemu i odwrotnie. [Dokumentacja CSS light-dark()](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Values/color_value/light-dark).

## Wybór motywu

`ThemeProvider` z `src/lib/theme/theme-provider.tsx` obejmuje aplikację. Wspólna kontrolka `ThemeSelector` oferuje „Jasny”, „Ciemny” i „Systemowy”. Preferencja jest przechowywana w `localStorage` pod kluczem `devflow-theme`.

- Bez zapisanego wyboru albo przy nieprawidłowej wartości obowiązuje tryb systemowy.
- Tryb systemowy reaguje na zmiany `prefers-color-scheme` bez odświeżania.
- Wybór ręczny ma pierwszeństwo przed ustawieniem systemu.
- Zmiany preferencji synchronizują się między otwartymi kartami tej samej strony.
- Jeśli odczyt lub zapis jest blokowany, kontrolka nadal działa w bieżącej sesji.
- Zmieniają się paleta, natywne kontrolki oraz metadane `theme-color`.

`public/theme-init.js` jest małym, blokującym skryptem w nagłówku dokumentu. Odczytuje preferencję i ustawia `data-theme` przed uruchomieniem aplikacji. Używa tego samego klucza oraz wartości co moduł TypeScript; testy przeglądarkowe sprawdzają zapisany jasny i ciemny motyw również z zablokowanym ładowaniem modułu React.

Zmiany systemowe subskrybuje `useSyncExternalStore`; zdarzenie `storage` synchronizuje preferencję między kartami. Subskrypcje są usuwane przy odmontowaniu providera. [Dokumentacja React](https://react.dev/reference/react/useSyncExternalStore).

Kontrolka ma natywny element `select`, powiązaną etykietę „Motyw kolorystyczny”, minimalną wysokość 44 px i widoczny fokus. W nagłówku desktopowym jest częścią nawigacji; do szerokości 1000 px znajduje się w wysuwanym panelu `Sheet`.

Style modalnych okien i paneli są w `src/styles/overlays.css`, w warstwie `components`. `globals.css` importuje je po Tailwind CSS, tokenach i adapterze `ui.css`. Zachowaj centralną kolejność importów; import warstwy komponentów przed Tailwindem może pozwolić resetowi nadpisać jej odstępy i typografię. Animacje wyłączają się przy `prefers-reduced-motion`.

## Dalszy zakres etapu 2

Gotowe są komponenty shadcn/ui: `Button`, `Card`, `Input`, `Label`, `Dialog`, `Sheet`, `Table` i `Skeleton`. Tabela i szkielet korzystają z semantycznych klas istniejących tokenów. Przykłady są w [ui-components.md](ui-components.md), a wspólne stany ładowania i braku danych w [ui-states.md](ui-states.md). [Routing aplikacji](routing.md) i [układ z sidebarem](app-shell.md) używają tej samej palety. `routes.css`, `app-shell.css` i `ui-states.css` są importowane centralnie w warstwie `components`. Toasty i obsługa błędów pozostają kolejnymi zadaniami.
