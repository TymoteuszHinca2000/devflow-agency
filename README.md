# DevFlow Agency

Modularna aplikacja SaaS do zarządzania agencją: klientami, projektami, zadaniami, zespołem, czasem pracy i wycenami. Projekt portfolio rozwijany stopniowo z naciskiem na typowanie, dostępność, bezpieczeństwo danych i przejrzystą historię zmian.

**Stan: ETAPY 1–3 scalone do `main`; ETAP 4 w końcowej weryfikacji, przygotowany trzeci z trzech commitów.** PR #1 (`56029a8`) wprowadził fundament, PR #2 (`dc8d1ad`) design system, a PR #3 (`11c4c21`) integrację Supabase. `feat/account-management` zawiera cały dotychczasowy zakres uwierzytelniania oraz odzyskiwanie i zmianę hasła, profil i prywatny awatar. Google OAuth odłożono decyzją użytkownika. [Raport ETAPU 4](docs/stage-4-report.md) · [Sesje](docs/authentication.md) · [Rejestracja](docs/registration.md) · [Profil i reset hasła](docs/account-management.md) · [Model bazy](docs/database.md). Aplikacja nie prezentuje fixture testów jako rzeczywistych statystyk.

[Repozytorium](https://github.com/TymoteuszHinca2000/devflow-agency) · [Roadmapa](ROADMAP.md) · [Zasady pracy](AGENTS.md) · [Historia zmian](CHANGELOG.md)

## Dostępne obecnie

- React i TypeScript strict, także z kontrolą opcjonalnych pól i indeksów.
- Vite, alias `@/` i Tailwind CSS 4 przez oficjalny plugin Vite.
- ESLint z kontrolą typów, Prettier, EditorConfig i spójne końce linii.
- Struktura katalogów przygotowana pod moduły biznesowe.
- Wersjonowany schemat PostgreSQL: 15 tabel, złożone klucze obce, indeksy, profile Auth, ograniczenia i RLS z politykami ról.
- Ograniczone granty kolumn, zawieszanie dostępu do projektu, prywatne pliki agencji i awatary oraz ochrona przed eskalacją uprawnień.
- Typowany klient Supabase, walidacja URL i publicznego klucza oraz generowanie typów bez sieci i Dockera.
- Izolowane testy SQL na PGlite, kontrola zgodności typów z migracjami i opcjonalny, domyślnie wyłączony seed developerski.
- Zweryfikowana integracja zdalnych Auth, Data API, RLS i fizycznego Storage HTTP; jawny skrypt bezpiecznego odczytu kontrolnego.
- `/login`: React Hook Form i Zod, walidacja e-maila, podgląd hasła, czytelne błędy i blokada ponownego wysłania podczas żądania.
- `/register`, `/check-email` i `/auth/confirm`: rejestracja, ponowna wysyłka z odliczaniem, jawna obsługa PKCE, wygasłych linków i braku weryfikatora w przeglądarce.
- `/forgot-password` i `/auth/recovery`: odzyskiwanie konta e-mailem z PKCE i formularzem nowego hasła.
- `/app/account`: edycja nazwy profilu, prywatny awatar z walidacją, trwały zapis oraz zmiana hasła po ponownym sprawdzeniu obecnego hasła.
- Sesja zapamiętywana przez SDK, tożsamość sprawdzana przez Auth, ochrona `/app`, bezpieczny powrót do pierwotnego adresu i wylogowanie z bieżącej przeglądarki.
- Obsługa wygaśnięcia sesji i błędów sieci z możliwością ponowienia; odświeżenie tego samego konta zachowuje otwarty widok i fokus.
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
- React Router: publiczny ekran `/` i logowanie `/login`, chroniona lista obszarów `/app` i osobne adresy dziesięciu planowanych modułów.
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
- Roadmapa czterech obszarów obejmujących 15 etapów, z rozwijanymi opisami i aktualnym statusem rozwoju.
- Nawigacja do roadmapy z menu i przycisku „Zobacz plan” oraz odnośnik do pełnego dokumentu na GitHubie.

Klient Supabase obsługuje już logowanie i sesje. Obecne adresy modułów po zalogowaniu pokazują opis planowanej realizacji; nie pobierają jeszcze danych biznesowych. Nie ma wdrożonego demo aplikacji. [Stany interfejsu](docs/ui-states.md) · [Toasty](docs/toasts.md) · [Obsługa błędów](docs/error-handling.md).

## Podgląd aktualnej sekcji powitalnej

![DevFlow Agency — ekran powitalny, katalog modułów i plan rozwoju](docs/screenshots/welcome-desktop.png)

[Ciemny motyw](docs/screenshots/welcome-dark.png) · [Widok mobilny](docs/screenshots/welcome-mobile.png) · [Wybór motywu na telefonie](docs/screenshots/theme-selector-mobile.png)

Motyw wybierzesz w nawigacji. Przy szerokości do 1000 px otwórz wysuwany panel. Fokus pozostaje w nim do zamknięcia; Escape, przycisk zamknięcia i kliknięcie tła przywracają go do przycisku menu. Wybranie sekcji przenosi fokus do jej treści, a poszerzenie okna do 1001 px zamyka panel i aktywuje nawigację desktopową. „Systemowy” śledzi ustawienia systemu na bieżąco; wybór ręczny pozostaje po odświeżeniu. Gdy przeglądarka blokuje zapis, ustawienie działa w bieżącej sesji.

## Stack

| Obszar                  | Zainstalowane                                                                                       | Planowane                            |
| ----------------------- | --------------------------------------------------------------------------------------------------- | ------------------------------------ |
| Frontend                | React 19.3.1, TypeScript 6.0.3, Vite 8.3.4, React Router 8.4.0                                      | TanStack Query                       |
| Interfejs               | Tailwind CSS 4.3.3, shadcn/ui (Radix), Sonner 2.0.8, Lucide React, fonty Manrope i DM Sans          | Recharts, dnd-kit                    |
| Formularze i stan       | React Hook Form 7.90.0, Zod 4.6.7, resolvers 5.9.2 i stan lokalny React                             | Zustand przy rzeczywistej potrzebie  |
| Backend                 | Supabase JS 2.118.0, Auth, CLI 2.121.0, PostgreSQL, RLS, prywatny Storage, PGlite i generator typów | Edge Functions                       |
| Jakość                  | ESLint 10, Prettier 3, Vitest 5, Testing Library, Playwright, axe-core                              | Testy modułów i izolacji organizacji |
| Automatyzacja i hosting | Lokalne skrypty kontroli jakości                                                                    | GitHub Actions, Vercel               |

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
git switch feat/authentication
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

Kliknij „Zobacz moduły aplikacji” albo dopisz `/app` do lokalnego adresu. Bez sesji zobaczysz `/login`; link „Utwórz konto” otwiera `/register`. Rejestracja wymaga publicznej konfiguracji, dozwolonego adresu powrotu i działającej poczty Auth. Hasło konta Auth jest odrębne od hasła bazy danych. Po potwierdzeniu adresu i zalogowaniu sprawdź `/app/projects`, odświeżenie i wylogowanie w topbarze. [Instrukcja rejestracji](docs/registration.md) · [Mapa adresów](docs/routing.md) · [Sidebar i topbar](docs/app-shell.md).

## Środowisko

**Ekran powitalny i testy offline działają bez konfiguracji Supabase.** Rzeczywiste logowanie i kontrole zdalne wymagają `.env.local` z publicznymi wartościami projektu. Bez konfiguracji część prywatna pokazuje błąd z możliwością ponowienia:

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

| Polecenie                    | Działanie                                                       |
| ---------------------------- | --------------------------------------------------------------- |
| `npm run dev`                | Serwer Vite z HMR                                               |
| `npm run typecheck`          | Kontrola typów aplikacji, konfiguracji i E2E                    |
| `npm run lint`               | ESLint bez dopuszczania ostrzeżeń                               |
| `npm run format`             | Prettier; modyfikuje pliki                                      |
| `npm run format:check`       | Sprawdzenie formatowania bez zapisu                             |
| `npm test`                   | Jednorazowy Vitest                                              |
| `npm run test:watch`         | Vitest w trybie obserwowania                                    |
| `npm run test:db`            | Migracje i integralność danych na izolowanym PostgreSQL PGlite  |
| `npm run db:types`           | Generowanie typów z migracji bez sieci i Dockera                |
| `npm run db:types:check`     | Sprawdzenie zgodności wygenerowanych typów z migracjami         |
| `npm run supabase:verify`    | Jawny odczyt kontrolny Auth i anonimowej odmowy Data API        |
| `npm run supabase -- --help` | Przypięty Supabase CLI                                          |
| `npm run build`              | Kontrola typów i build do `dist/`                               |
| `npm run preview`            | Podgląd istniejącego buildu                                     |
| `npm run check`              | Lint, formatowanie, Vitest, testy bazy, zgodność typów i build  |
| `npm run build:e2e`          | Osobny build `dist-e2e/` z publiczną konfiguracją fixture Auth  |
| `npm run test:e2e`           | Automatyczny build E2E i Playwright na desktopie oraz telefonie |

Podstawowa kontrola:

```powershell
npm run check
```

Przy pierwszym użyciu E2E zainstaluj Chromium. Skrypt testowy sam buduje osobny wariant:

```powershell
npx playwright install chromium
npm run test:e2e
```

Testy importują `test` i `expect` z `e2e/fixtures.ts`. Każdy test uruchamia podgląd `dist-e2e/` na wolnym porcie przez API Vite i zamyka go w `finally` przez `server.close()`. Ten build ma fikcyjny publiczny adres Auth i przechwytywane odpowiedzi HTTP: nie wymaga `.env.local`, nie wysyła haseł do rzeczywistego projektu i nie tworzy kont. Testy chronionego układu jawnie wybierają stan zalogowany. Zwykłe `npm run build` nadal tworzy produkcyjny `dist/` z konfiguracją środowiska. Nie publikuj `dist-e2e/` jako aplikacji.

**Bieżąca weryfikacja ETAPU 4:** pełna regresja 144 scenariuszy E2E, 143 testy aplikacji w końcowym zestawie, 100 testów SQL i zgodność typów bazy. Nowe kontrole obejmują reset i zmianę hasła, profil, awatar, błędy oraz dostępność. Zdalny odczyt kontrolny przeszedł 16 kontroli bez zapisów. Rzeczywiste próby użytkownika oraz ich granice opisuje [raport](docs/stage-4-report.md).

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

**ETAP 3 — końcowa weryfikacja:** 50 testów aplikacji, 100 testów SQL, zgodność generatora, build, 80 scenariuszy E2E oraz 16 odczytowych i 20 zapisujących kontroli usług. Obie migracje zastosowano do developerskiego Supabase. Testy SQL na PGlite pozostają niezależne od projektu zdalnego. [Raport](docs/stage-3-report.md) · [Model i diagram](docs/database.md) · [Macierz uprawnień](docs/database-security.md).

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

Roadmapa ma osobne dane w `src/features/welcome/data/development-phases.ts` oraz style w `src/features/welcome/styles/development-roadmap.css`. Natywne elementy HTML `details` i `summary` obsługują rozwijanie i klawiaturę. Domyślnie rozwinięty jest obszar etapów 3–5 z informacją o trwającym ETAPIE 4.

Wspólne tokeny znajdują się w `src/styles/tokens.css`, a provider motywu w `src/lib/theme/`. `public/theme-init.js` odczytuje preferencję przed uruchomieniem aplikacji. Szczegóły użycia i architektury: [Wspólne style i motyw](docs/design-tokens.md).

Komponenty UI są w `src/components/ui/`, a adapter ich semantycznych tokenów w `src/styles/ui.css`. `components.json` opisuje konfigurację shadcn/ui. Przykłady i podgląd: [Wspólne komponenty UI](docs/ui-components.md).

`src/app/app-routes.tsx` określa trasy, `app-modules.ts` opisy obszarów, a `route-effects.tsx` tytuły i przekazywanie fokusu. Widoki planowanych modułów są w `src/app/pages/`; ich funkcje biznesowe powstaną w katalogach `features/` we właściwych etapach. [Szczegóły routingu](docs/routing.md).

Trasy `/app` korzystają z `AppLayout` i wspólnej nawigacji w `src/components/layout/`. Sidebar, topbar i menu mobilne są osobnymi komponentami; ich style znajdują się w `src/styles/app-shell.css`. Nieznane adresy wewnątrz `/app` zachowują układ aplikacji. [Opis układu](docs/app-shell.md).

`src/features/auth/` zawiera serwisy Auth, obserwatora weryfikowanej sesji, provider, ochronę tras, formularz i walidację. Tokenami zarządza SDK; context przechowuje tylko stan i użytkownika zweryfikowanego przez Auth. Kontrolki konta są przekazywane do wspólnego topbara jako slot, bez zależności layoutu od modułu Auth. [Architektura sesji](docs/authentication.md).

Dwie migracje PostgreSQL definiują relacje, granty kolumn, RLS i prywatny Storage. Klient jest w `src/lib/supabase/`, generowane typy w `src/types/database.types.ts`, a skrypty kontroli w `scripts/`. Operacje wymagające zaufanej logiki obsłużą serwerowe funkcje we właściwych modułach. Szczegóły: [Integracja](docs/supabase-integration.md), [Model bazy](docs/database.md), [Uprawnienia](docs/database-security.md), [ROADMAP.md](ROADMAP.md) i [AGENTS.md](AGENTS.md).

## Planowane funkcjonalności

- Reset i zmiana hasła oraz profil z awatarem; Google OAuth odłożony.
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

Bieżący branch: `feat/account-management`, utworzony i opublikowany przez użytkownika z `feat/authentication` przy `1d2942e`. Uzgodniony ETAP 4 obejmuje dwie gałęzie i trzy commity. `a42bb25` (logowanie/sesje) oraz `1d2942e` (rejestracja/potwierdzenie) są wypchnięte; trzeci zakres odzyskiwania i profilu czeka na commit użytkownika. Ten podział ma pierwszeństwo przed ogólną zasadą gałęzi dla każdej funkcjonalności. Po przekazaniu poleceń Git agent zatrzymuje edycję do potwierdzenia wykonania.

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
