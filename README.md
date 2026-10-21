# DevFlow Agency

Modularna aplikacja SaaS do zarządzania agencją: klientami, projektami, zadaniami, zespołem, czasem pracy i wycenami. Projekt portfolio rozwijany stopniowo z naciskiem na typowanie, dostępność, bezpieczeństwo danych i przejrzystą historię zmian.

**Stan: ETAP 1 w trakcie realizacji.** Działa fundament React + TypeScript + Vite i podstawowy ekran startowy. Logowanie, baza oraz moduły biznesowe są zaplanowane; nie są jeszcze zaimplementowane. Aplikacja nie korzysta z fikcyjnego backendu ani demonstracyjnych statystyk.

[Repozytorium](https://github.com/TymoteuszHinca2000/devflow-agency) · [Roadmapa](ROADMAP.md) · [Zasady pracy](AGENTS.md) · [Historia zmian](CHANGELOG.md)

## Dostępne obecnie

- React i TypeScript strict, także z kontrolą opcjonalnych pól i indeksów.
- Vite, alias `@/` i Tailwind CSS 4 przez oficjalny plugin Vite.
- ESLint z kontrolą typów, Prettier, EditorConfig i spójne końce linii.
- Struktura katalogów przygotowana pod moduły biznesowe.
- Vitest, React Testing Library i konfiguracja Playwright dla desktopu i telefonu.
- `.env.example`, wykluczenie lokalnej konfiguracji i wersjonowany lockfile.

Profesjonalny ekran powitalny i pełna weryfikacja są następnym zadaniem ETAPU 1. Screenshoty zostaną dodane po sprawdzeniu interfejsu. Nie ma jeszcze wdrożonego demo.

## Stack

| Obszar                  | Zainstalowane w ETAPIE 1                                               | Planowane                                                 |
| ----------------------- | ---------------------------------------------------------------------- | --------------------------------------------------------- |
| Frontend                | React 19.3.1, TypeScript 6.0.3, Vite 8.3.4                             | React Router, TanStack Query                              |
| Interfejs               | Tailwind CSS 4.3.3, Lucide React, lokalne fonty Manrope i DM Sans      | shadcn/ui, Recharts, dnd-kit                              |
| Formularze i stan       | Stan lokalny React                                                     | React Hook Form, Zod; Zustand przy rzeczywistej potrzebie |
| Backend                 | Brak integracji w ETAPIE 1                                             | Supabase, PostgreSQL, Auth, Storage, RLS, Edge Functions  |
| Jakość                  | ESLint 10, Prettier 3, Vitest 5, Testing Library, Playwright, axe-core | Testy modułów i izolacji organizacji                      |
| Automatyzacja i hosting | Lokalne skrypty kontroli jakości                                       | GitHub Actions, Vercel                                    |

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
git switch feat/project-foundation
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

## Środowisko

**ETAP 1 działa bez `.env`, konta Supabase i kluczy.** `.env.example` dokumentuje wyłącznie przyszłe publiczne wartości:

```dotenv
VITE_SUPABASE_URL=
VITE_SUPABASE_PUBLISHABLE_KEY=
```

Dopiero w ETAPIE 3, po uzgodnieniu konfiguracji Supabase:

```powershell
Copy-Item .env.example .env.local
```

Wszystkie `VITE_*` trafiają do przeglądarki. Nigdy nie umieszczaj w nich sekretów, `service_role` ani hasła PostgreSQL. Lokalne pliki `.env*` są ignorowane przez Git z wyjątkiem pustego `.env.example`.

## Skrypty i testy

| Polecenie              | Działanie                                              |
| ---------------------- | ------------------------------------------------------ |
| `npm run dev`          | Serwer Vite z HMR                                      |
| `npm run typecheck`    | Kontrola typów aplikacji, konfiguracji i E2E           |
| `npm run lint`         | ESLint bez dopuszczania ostrzeżeń                      |
| `npm run format`       | Prettier; modyfikuje pliki                             |
| `npm run format:check` | Sprawdzenie formatowania bez zapisu                    |
| `npm test`             | Jednorazowy Vitest                                     |
| `npm run test:watch`   | Vitest w trybie obserwowania                           |
| `npm run build`        | Kontrola typów i build do `dist/`                      |
| `npm run preview`      | Podgląd istniejącego buildu                            |
| `npm run check`        | Lint, formatowanie, Vitest i build z typami            |
| `npm run test:e2e`     | Playwright: desktop i telefon na produkcyjnym buildzie |

Podstawowa kontrola:

```powershell
npm run check
```

Przy pierwszym użyciu E2E zainstaluj Chromium. Konfiguracja Playwright uruchamia podgląd na porcie 4173; wcześniej wykonaj build:

```powershell
npx playwright install chromium
npm run build
npm run test:e2e
```

Zatrzymaj inne podglądy na porcie 4173, aby testować właściwy build. Raporty HTML trafiają do `playwright-report/`, materiały diagnostyczne do `test-results/`; oba katalogi są ignorowane przez Git.

**Aktualna weryfikacja:** lint, formatowanie, test React i build przeszły na Node 24.19.0. Dwa scenariusze Playwright wykonały asercje poprawnie, ale runner nie zakończył procesu i został przerwany. Pełny przebieg E2E nie jest jeszcze zaliczony. Wyjaśnienie zamykania runnera oraz sprawdzenie docelowego ekranu startowego pozostają zadaniami ETAPU 1.

Testy automatyczne uzupełnia ręczna kontrola klawiatury, małego ekranu i powiększenia tekstu. Kolejne moduły otrzymają testy zachowania i uprawnień.

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
  hooks/
  lib/
  services/
  types/
  styles/
  test/
e2e/
supabase/
  migrations/
  functions/
```

Komponenty, hooki, serwisy, walidacja i typy modułu pozostają w jego katalogu `features/`. Elementy rzeczywiście wspólne trafiają do katalogów współdzielonych. Katalogi z `.gitkeep` są na razie puste.

Docelowo PostgreSQL i RLS zapewnią izolację organizacji, Storage będzie prywatny, a operacje wymagające zaufanej logiki obsłużą Edge Functions. W ETAPIE 1 nie ma migracji, seeda ani połączenia z bazą. Szczegóły: [ROADMAP.md](ROADMAP.md) i [AGENTS.md](AGENTS.md).

## Planowane funkcjonalności

- Rejestracja, logowanie, Google OAuth, reset hasła, sesje i profil z awatarem.
- Wiele organizacji, role, zaproszenia i izolacja danych.
- Dashboard z wykresami, aktywnościami, terminami i czasem pracy.
- Klienci, projekty, załączniki i historia współpracy.
- Zadania, podzadania, komentarze i dostępny Kanban z drag & drop.
- Timer, ręczne wpisy czasu, stawki, raporty i eksport.
- Wyceny, pozycje kosztorysu, historia i PDF.
- Portal klienta: projekty, komentarze, pliki i akceptacja wycen.
- Ustawienia, powiadomienia i motyw jasny/ciemny.

To zakres docelowy, a nie obecnie dostępne funkcje.

## Git workflow

Branch roboczy: `feat/project-foundation`. Agent przygotowuje zmiany, a użytkownik wykonuje operacje Git po otrzymaniu instrukcji. Agent wstrzymuje edycję do potwierdzenia wykonania poleceń.

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

## Licencja

[MIT](LICENSE) — © 2026 Tymoteusz Hinca.
