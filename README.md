# DevFlow Agency

Modularna aplikacja SaaS do zarządzania agencją: klientami, projektami, zadaniami, zespołem, czasem pracy i wycenami. Projekt portfolio rozwijany stopniowo z naciskiem na typowanie, dostępność, bezpieczeństwo danych i przejrzystą historię zmian.

**Stan: ETAPY 1 i 2 scalone do `main`; ETAP 3 w realizacji.** PR #1 (`56029a8`) wprowadził fundament i ekran powitalny, a PR #2 (`dc8d1ad`) design system, routing, układ, stany, toasty i obsługę błędów. Na gałęzi `feat/supabase-foundation` przygotowano model 15 tabel, polityki ról, prywatny Storage i testy SQL. Migracje nie zostały jeszcze zastosowane do zdalnego Supabase; integracja React i rzeczywistych usług jest kolejnym krokiem na drugiej gałęzi. [Raport ETAPU 2](docs/stage-2-report.md) · [Model bazy](docs/database.md) · [Uprawnienia i pliki](docs/database-security.md). Logowanie i moduły biznesowe pozostają zaplanowane. Aplikacja nie korzysta z fikcyjnego backendu ani demonstracyjnych statystyk.

[Repozytorium](https://github.com/TymoteuszHinca2000/devflow-agency) · [Roadmapa](ROADMAP.md) · [Zasady pracy](AGENTS.md) · [Historia zmian](CHANGELOG.md)

## Dostępne obecnie

- React i TypeScript strict, także z kontrolą opcjonalnych pól i indeksów.
- Vite, alias `@/` i Tailwind CSS 4 przez oficjalny plugin Vite.
- ESLint z kontrolą typów, Prettier, EditorConfig i spójne końce linii.
- Struktura katalogów przygotowana pod moduły biznesowe.
- Wersjonowany schemat PostgreSQL: 15 tabel, złożone klucze obce, indeksy, profile Auth, ograniczenia i RLS z politykami ról.
- Ograniczone granty kolumn, zawieszanie dostępu do projektu, prywatne pliki agencji i awatary oraz ochrona przed eskalacją uprawnień.
- Izolowane testy SQL na PGlite i opcjonalny, domyślnie wyłączony seed developerski. Integracja klienta i usług Supabase jest kolejną częścią ETAPU 3.
- Vitest, React Testing Library i konfiguracja Playwright dla desktopu i telefonu.
- `.env.example`, wykluczenie lokalnej konfiguracji i wersjonowany lockfile.
- Nagłówek z nawigacją desktopową i wysuwanym, modalnym panelem mobilnym.
- Sekcja powitalna z ilustracją koncepcji produktu oraz linkami do kodu i planu rozwoju.
- Wspólne logo, przyciski w formie linków, lokalne fonty i favicon.
- Wspólne tokeny kolorów, fontów, odstępów, zaokrągleń i fokusu, dostępne również w Tailwind CSS.
- Lokalne komponenty shadcn/ui: `Button`, `Card`, `Input`, `Label`, `Dialog`, `Sheet` i `Table`, dostosowane do palety DevFlow.
- Dialogi i panele z tytułem, opisem, zamykaniem przez Escape i tło, blokadą przewijania oraz zarządzaniem fokusem.
- Wspólna tabela z podpisem, nagłówkami kolumn i wierszy, stopką oraz obszarem przewijania dostępnym klawiaturą. Komponent jest przygotowany do użycia w kolejnych modułach.
- `Skeleton`, `LoadingState` w układzie kart lub listy oraz `EmptyState` z opisem i akcjami. Ozdobne szkielety są ukryte przed czytnikami ekranu, a animacja respektuje ograniczenie ruchu.
- Wspólny stan informacyjny w planowanych modułach; komponent ładowania jest przygotowany do przyszłych widoków pobierających dane.
- Globalny `Toaster` i typowane API `notify`: informacje, potwierdzenia, ostrzeżenia i błędy, opcjonalna akcja, aktualizacja komunikatu oraz obsługa klawiatury. Przygotowane do rzeczywistych operacji w kolejnych modułach.
- Wspólny `ErrorState` oraz granice błędów renderowania całej aplikacji i pojedynczej strony. Ponowienie, zachowanie nawigacji przy awarii strony oraz odzyskanie tytułu i fokusu.
- React Router: publiczny ekran `/`, lista obszarów `/app` i osobne adresy dziesięciu planowanych modułów.
- Link „Zobacz moduły aplikacji” na stronie głównej oraz strona 404 z działającymi linkami powrotu.
- Zmiana tytułu dokumentu i fokusu po przejściu między stronami, historia przeglądarki i powrót do sekcji planu rozwoju.
- Stały sidebar aplikacji na komputerze i topbar ze ścieżką bieżącej strony oraz wyborem motywu.
- Aktywne linki modułów z `aria-current`, wspólna nawigacja i wysuwane z lewej menu do szerokości 1000 px.
- Zamykanie menu po wyborze modułu, zmianie ścieżki i przejściu na desktop; obsługa Escape, tła oraz przekazywania fokusu.
- Wspólny przycisk w akcjach strony i wspólna karta w katalogu; stany pól przygotowane do kolejnych formularzy.
- Wybór motywu jasnego, ciemnego lub systemowego z zapamiętywaniem ustawienia i obsługą ograniczenia ruchu.
- Reakcja na zmianę motywu systemu i synchronizacja wyboru między kartami przeglądarki.
- Odczyt zapisanego motywu przed uruchomieniem Reacta oraz obsługa blokady zapisu ustawień.
- Skip link, obsługa klawiatury i przywracanie fokusu po zamknięciu menu.
- Katalog sześciu planowanych modułów z filtrami „Wszystkie”, „Praca zespołu” i „Relacje z klientami”.
- Licznik wyników dostępny dla czytników ekranu oraz obsługa filtrów klawiaturą.
- Przejście do katalogu przez przycisk „Poznaj możliwości” i link w nagłówku.
- Roadmapa czterech obszarów obejmujących 15 etapów, z rozwijanymi opisami i oznaczeniem bieżącego etapu 2.
- Nawigacja do roadmapy z menu i przycisku „Zobacz plan” oraz odnośnik do pełnego dokumentu na GitHubie.

ETAP 2 scalono przez PR #2. Użytkownik zatwierdził ETAP 3 i skonfigurował osobny projekt developerski Supabase. Nie ma jeszcze wdrożonego demo ani połączenia React z bazą. Adresy modułów pokazują opis i informację o planowanej realizacji; nie udostępniają jeszcze funkcji biznesowych. [Stany interfejsu](docs/ui-states.md) · [Toasty](docs/toasts.md) · [Obsługa błędów](docs/error-handling.md).

## Podgląd aktualnej sekcji powitalnej

![DevFlow Agency — ekran powitalny, katalog modułów i plan rozwoju](docs/screenshots/welcome-desktop.png)

[Ciemny motyw](docs/screenshots/welcome-dark.png) · [Widok mobilny](docs/screenshots/welcome-mobile.png) · [Wybór motywu na telefonie](docs/screenshots/theme-selector-mobile.png)

Motyw wybierzesz w nawigacji. Przy szerokości do 1000 px otwórz wysuwany panel. Fokus pozostaje w nim do zamknięcia; Escape, przycisk zamknięcia i kliknięcie tła przywracają go do przycisku menu. Wybranie sekcji przenosi fokus do jej treści, a poszerzenie okna do 1001 px zamyka panel i aktywuje nawigację desktopową. „Systemowy” śledzi ustawienia systemu na bieżąco; wybór ręczny pozostaje po odświeżeniu. Gdy przeglądarka blokuje zapis, ustawienie działa w bieżącej sesji.

## Stack

| Obszar                  | Zainstalowane                                                                              | Planowane                                                 |
| ----------------------- | ------------------------------------------------------------------------------------------ | --------------------------------------------------------- |
| Frontend                | React 19.3.1, TypeScript 6.0.3, Vite 8.3.4, React Router 8.4.0                             | TanStack Query                                            |
| Interfejs               | Tailwind CSS 4.3.3, shadcn/ui (Radix), Sonner 2.0.8, Lucide React, fonty Manrope i DM Sans | Recharts, dnd-kit                                         |
| Formularze i stan       | Stan lokalny React                                                                         | React Hook Form, Zod; Zustand przy rzeczywistej potrzebie |
| Backend                 | Migracje PostgreSQL, RLS, polityki prywatnego Storage i testy PGlite 0.5.10                | Klient Supabase, integracja usług, Auth, Edge Functions   |
| Jakość                  | ESLint 10, Prettier 3, Vitest 5, Testing Library, Playwright, axe-core                     | Testy modułów i izolacji organizacji                      |
| Automatyzacja i hosting | Lokalne skrypty kontroli jakości                                                           | GitHub Actions, Vercel                                    |

Dokładne wersje są w `package.json` i `package-lock.json`. TypeScript 6.0.3 wybrano dla zgodności: zainstalowane `typescript-eslint` wspiera TypeScript `<6.1.0`. Nie wymuszamy nieobsługiwanych zależności przez `--force` ani `--legacy-peer-deps`.

## Wymagania

- Node.js **24.19.0**, zgodny z `.node-version`; pełny zakres określa `engines` w `package.json`.
- npm co najmniej 10.9.0.
- Git.

Vitest 5 i jsdom 30 nie wspierają Node 25. Na Windows z nvm-windows wybierz wspieraną wersję przed instalacją i testami:

```powershell
nvm install 24.19.0
nvm use 24.19.0
node --version
npm --version
```

Zmiana wersji przez nvm-windows może wymagać terminala z odpowiednimi uprawnieniami. Nie jest potrzebna do przeglądania plików ani wykonywania commitów Git.

## Instalacja i uruchomienie

Dla nowej kopii repozytorium:

```powershell
git clone https://github.com/TymoteuszHinca2000/devflow-agency.git
cd devflow-agency
git switch feat/supabase-foundation
npm ci
npm run dev
```

Dla istniejącego katalogu zamiast klonowania:

```powershell
cd C:\Users\hinca\Desktop\DevflowAgency
git status --short --branch
npm ci
npm run dev
```

Vite wypisze lokalny adres, zwykle `http://127.0.0.1:5173`. Jeśli port jest zajęty, użyj adresu wyświetlonego przez serwer. Zatrzymanie: `Ctrl+C`.

Kliknij „Zobacz moduły aplikacji” albo dopisz `/app` do lokalnego adresu. Sprawdź też bezpośrednie wejście na `/app/projects`, odświeżenie i nieznany adres, np. `/brak-strony`. Mapa adresów: [Routing aplikacji](docs/routing.md). Układ, obsługa menu i zrzuty: [Sidebar i topbar](docs/app-shell.md).

## Środowisko

**Obecny interfejs i testy SQL działają bez konfiguracji Supabase.** Projekt developerski ETAPU 3 używa lokalnego `.env.local` z publicznymi wartościami do przyszłego klienta React:

```dotenv
VITE_SUPABASE_URL=
VITE_SUPABASE_PUBLISHABLE_KEY=
```

W nowej kopii repozytorium utwórz plik tylko wtedy, gdy jeszcze nie istnieje, i uzupełnij publiczne wartości projektu developerskiego:

```powershell
if (-not (Test-Path .env.local)) { Copy-Item .env.example .env.local }
```

Wszystkie `VITE_*` trafiają do przeglądarki. Nigdy nie umieszczaj w nich sekretów, `service_role` ani hasła PostgreSQL. Lokalne pliki `.env*` są ignorowane przez Git z wyjątkiem pustego `.env.example`.

## Skrypty i testy

| Polecenie              | Działanie                                                      |
| ---------------------- | -------------------------------------------------------------- |
| `npm run dev`          | Serwer Vite z HMR                                              |
| `npm run typecheck`    | Kontrola typów aplikacji, konfiguracji i E2E                   |
| `npm run lint`         | ESLint bez dopuszczania ostrzeżeń                              |
| `npm run format`       | Prettier; modyfikuje pliki                                     |
| `npm run format:check` | Sprawdzenie formatowania bez zapisu                            |
| `npm test`             | Jednorazowy Vitest                                             |
| `npm run test:watch`   | Vitest w trybie obserwowania                                   |
| `npm run test:db`      | Migracje i integralność danych na izolowanym PostgreSQL PGlite |
| `npm run build`        | Kontrola typów i build do `dist/`                              |
| `npm run preview`      | Podgląd istniejącego buildu                                    |
| `npm run check`        | Lint, formatowanie, Vitest, testy bazy i build z typami        |
| `npm run test:e2e`     | Playwright: desktop i telefon na produkcyjnym buildzie         |

Podstawowa kontrola:

```powershell
npm run check
```

Przy pierwszym użyciu E2E zainstaluj Chromium. Przed testami wykonaj build:

```powershell
npx playwright install chromium
npm run build
npm run test:e2e
```

Testy importują `test` i `expect` z `e2e/fixtures.ts`. Każdy test uruchamia podgląd produkcyjnego `dist/` na wolnym porcie przez API Vite i zamyka go w `finally` przez `server.close()`. Nie używa starszego, już uruchomionego podglądu ani systemowego zamykania drzewa procesów.

Raporty HTML trafiają do `playwright-report/`, materiały diagnostyczne do `test-results/`; oba katalogi są ignorowane przez Git.

**Weryfikacja ekranu powitalnego, katalogu i roadmapy przy zakończeniu ETAPU 2 na Node 24.19.0:**

- Lint, formatowanie, TypeScript i build: poprawne.
- Vitest / Testing Library: 27 zaliczonych testów.
- Playwright / Chromium: 80 zaliczonych scenariuszy na desktopie i telefonie; proces zakończył się kodem `0`.
- Sprawdzono filtrowanie, licznik wyników, nawigację do sekcji, menu mobilne, klawiaturę, fokus i ograniczenie ruchu.
- Roadmapa: domyślnie otwarty bieżący obszar, niezależne rozwijanie pozostałych, obsługa Enter i Spacji oraz zachowanie fokusu.
- Sprawdzono ręczne nadpisanie motywu systemowego, zapis i odświeżanie, reakcję na zmiany systemu, klawiaturę, synchronizację kart, nieprawidłowy zapis i blokadę pamięci przeglądarki.
- Osobne scenariusze potwierdzają odczyt zapisanego motywu także przed załadowaniem modułu React.
- axe-core: brak automatycznie wykrytych naruszeń WCAG A/AA w jasnym i ciemnym widoku na obu urządzeniach, także po otwarciu wszystkich opisów roadmapy i menu mobilnego z wyborem motywu.
- Przejrzano zrzuty dla szerokości 320, 390, 768 i 1440 px; bez poziomego przepełnienia.
- W odizolowanym podglądzie komponentów UI sprawdzono oba motywy, fokus pól, opisy błędów, wysokość 44 px i brak przepełnienia; axe nie wykrył naruszeń sprawdzanych reguł WCAG A/AA.
- Testy panelu obejmują zapętlenie fokusu, zamknięcie przez Escape, przycisk i tło, przywracanie przewijania, przejście do sekcji i zmianę szerokości okna. Sprawdzono też widok 320 × 320 px z ograniczeniem ruchu.
- W osobnym podglądzie sprawdzono dialog i cztery kierunki panelu w 20 kombinacjach rozmiarów i motywów, z kontrolą klawiatury, granic ekranu, błędów wykonania i axe. Podgląd nie jest dodatkową stroną aplikacji.
- W odizolowanym podglądzie tabeli sprawdzono 6 wariantów szerokości i motywu oraz widok z danymi i pusty. Przewijanie strzałkami, przechodzenie fokusu, semantyka nagłówków i podpisu, brak przepełnienia strony oraz audyty axe zakończyły się poprawnie. Szczegóły i zrzuty: [Wspólne komponenty UI](docs/ui-components.md).
- Routing: przejścia bez przeładowania dokumentu, wszystkie adresy modułów, odświeżenie bezpośredniego adresu, Wstecz/Dalej, zachowanie motywu, tytuły, fokus, kotwice i odzyskanie nawigacji ze strony 404.
- Strony `/app`, podgląd modułu i 404 przeszły audyty axe w obu motywach na desktopie i telefonie. Sprawdzono również szerokość 320 px, skip link oraz nieprawidłowy fragment URL.
- Sidebar i topbar: aktywny link, ścieżka strony, historia, zachowanie przy przewijaniu i dostępność dolnych linków na niskim ekranie. Menu aplikacji: fokus, blokada tła, Escape, zamknięcie przyciskiem i tłem, wybór bieżącego lub innego modułu oraz powiększenie do desktopu. Audyty axe przeszły także dla otwartego menu w obu motywach.

Kontrole automatyczne i wizualne nie stanowią pełnego audytu dostępności. Kolejne sekcje i moduły otrzymają testy w ramach swoich zadań.

Wspólne toasty przeszły również osobną kontrolę w 5 wariantach rozmiaru i motywu: czas wyświetlania, wstrzymanie i wznowienie odliczania, trwałe komunikaty, aktualizacja, akcja, klawiatura, motywy oraz axe. [Opis API i screenshoty](docs/toasts.md).

**ETAP 3 — model i bezpieczeństwo:** kontrole obejmują lint, formatowanie, 27 testów React, 100 testów SQL, typy i build. Przy konfiguracji publiczne API projektu developerskiego odpowiedziało HTTP 200. Testy SQL używają PGlite i nie zmieniają projektu zdalnego; migracji nie wdrożono jeszcze do Supabase. Interfejs pozostał bez zmian, więc w tej części nie powtarzano E2E. [Model i diagram](docs/database.md) · [Macierz uprawnień i zakres testów](docs/database-security.md).

## Architektura

```text
src/
  app/
  components/
    ui/
    layout/
    shared/
  features/
    auth/
    dashboard/
    organizations/
    clients/
    projects/
    tasks/
    time-tracking/
    quotes/
    client-portal/
    notifications/
    settings/
    welcome/
  hooks/
  lib/
  services/
  types/
  styles/
  test/
e2e/
supabase/
  config.toml
  migrations/
  seed.sql
  tests/
  functions/
```

Komponenty, hooki, serwisy, walidacja i typy modułu pozostają w jego katalogu `features/`. Elementy rzeczywiście wspólne trafiają do katalogów współdzielonych. Katalogi z `.gitkeep` są na razie puste.

Katalog na stronie startowej ma dane opisowe w `src/features/welcome/data/planned-modules.ts` oraz osobne style w `src/features/welcome/styles/module-overview.css`. Filtry działają lokalnie w React. Opisy przedstawiają plan produktu i nie zastępują danych z przyszłego backendu.

Roadmapa ma osobne dane w `src/features/welcome/data/development-phases.ts` oraz style w `src/features/welcome/styles/development-roadmap.css`. Natywne elementy HTML `details` i `summary` obsługują rozwijanie i klawiaturę. Pierwszy obszar obejmuje etapy 1–2; etykieta wskazuje zakończenie weryfikacji i oczekiwanie na odbiór przed kolejnym etapem.

Wspólne tokeny znajdują się w `src/styles/tokens.css`, a provider motywu w `src/lib/theme/`. `public/theme-init.js` odczytuje preferencję przed uruchomieniem aplikacji. Szczegóły użycia i architektury: [Wspólne style i motyw](docs/design-tokens.md).

Komponenty UI są w `src/components/ui/`, a adapter ich semantycznych tokenów w `src/styles/ui.css`. `components.json` opisuje konfigurację shadcn/ui. Przykłady i podgląd: [Wspólne komponenty UI](docs/ui-components.md).

`src/app/app-routes.tsx` określa trasy, `app-modules.ts` opisy obszarów, a `route-effects.tsx` tytuły i przekazywanie fokusu. Widoki planowanych modułów są w `src/app/pages/`; ich funkcje biznesowe powstaną w katalogach `features/` we właściwych etapach. [Szczegóły routingu](docs/routing.md).

Trasy `/app` korzystają z `AppLayout` i wspólnej nawigacji w `src/components/layout/`. Sidebar, topbar i menu mobilne są osobnymi komponentami; ich style znajdują się w `src/styles/app-shell.css`. Nieznane adresy wewnątrz `/app` zachowują układ aplikacji. [Opis układu](docs/app-shell.md).

Dwie migracje PostgreSQL definiują relacje, granty kolumn, RLS i prywatny Storage. Kolejna część ETAPU 3 doda klienta React, generowane typy i weryfikację usług. Operacje wymagające zaufanej logiki obsłużą serwerowe funkcje we właściwych modułach. Szczegóły: [Model bazy](docs/database.md), [Uprawnienia](docs/database-security.md), [ROADMAP.md](ROADMAP.md) i [AGENTS.md](AGENTS.md).

## Planowane funkcjonalności

- Rejestracja, logowanie, Google OAuth, reset hasła, sesje i profil z awatarem.
- Wiele organizacji, role, zaproszenia i izolacja danych.
- Dashboard z wykresami, aktywnościami, terminami i czasem pracy.
- Klienci, projekty, załączniki i historia współpracy.
- Zadania, podzadania, komentarze i dostępny Kanban z drag & drop.
- Timer, ręczne wpisy czasu, stawki, raporty i eksport.
- Wyceny, pozycje kosztorysu, historia i PDF.
- Portal klienta: projekty, komentarze, pliki i akceptacja wycen.
- Ustawienia konta i preferencje powiadomień.

To zakres docelowy, a nie obecnie dostępne funkcje.

## Git workflow

Każda nowa funkcjonalność ma osobną gałąź, także w ramach tego samego etapu. Agent podaje polecenia jej utworzenia i publikacji oraz czeka na potwierdzenie przed kodowaniem. Użytkownik wykonuje także staging, commity i push. Po każdym logicznym zadaniu agent zatrzymuje edycję do potwierdzenia wykonania poleceń.

Bieżący branch: `feat/supabase-foundation`, utworzony z `main` przy `dc8d1ad` po scaleniu ETAPU 2 przez PR #2. Dla ETAPU 3 użytkownik uzgodnił dwie gałęzie i około trzy commity: model danych oraz polityki/Storage na obecnej gałęzi, a następnie klienta i weryfikację na `feat/supabase-integration`. Po każdym commicie agent czeka na potwierdzenie; utworzenie kolejnej gałęzi również wykonuje użytkownik przed rozpoczęciem jej kodowania.

Przed pracą sprawdzaj:

```powershell
git status --short --branch
git branch -vv
```

Stosuj spójne commity według Conventional Commits. Przed commitem przejrzyj diff i wykonaj właściwe kontrole; po commicie sprawdź status. Pierwsza publikacja: `git push -u origin nazwa-brancha`. Bez force push i automatycznego merge do `main`.

## Dokumentacja konfiguracji

- [Vite — rozpoczęcie pracy](https://vite.dev/guide/)
- [Tailwind CSS — integracja z Vite](https://tailwindcss.com/docs/installation/using-vite)
- [typescript-eslint — wspierane zależności](https://typescript-eslint.io/users/dependency-versions/)
- [Vite — publiczne zmienne środowiskowe](https://vite.dev/guide/env-and-mode)
- [Vite — API podglądu](https://vite.dev/guide/api-javascript#preview)
- [Playwright — kontrola dostępności](https://playwright.dev/docs/accessibility-testing)

## Licencja

[MIT](LICENSE) — © 2026 Tymoteusz Hinca.

Adaptowane komponenty shadcn/ui zachowują informację o autorze i licencji: [Third-party notices](docs/third-party-notices.md).
