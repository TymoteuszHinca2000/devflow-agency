# DevFlow Agency — zasady pracy

## Zakres i współpraca

- Rozwijaj aplikację etapami zgodnie z `ROADMAP.md`. Nie rozpoczynaj kolejnego etapu bez decyzji użytkownika.
- Komunikuj się po polsku. Kod, nazwy plików i commity zapisuj po angielsku.
- Przed zadaniem sprawdź `git status --short --branch`, aktualny branch i istniejące pliki. Zachowuj pracę użytkownika.
- Obecny tryb: agent przygotowuje pliki i wykonuje kontrole, a użytkownik sam tworzy branche, commity i wykonuje push.
- Po logicznym zadaniu podaj dokładne polecenia Git i zatrzymaj edycję plików. Wznów pracę dopiero po potwierdzeniu użytkownika, że wykonał polecenia.
- Raportuj: rezultat, zmienione pliki, wykonane testy i ich wynik, stan commita, sposób sprawdzenia oraz następny krok.
- Nie deklaruj wykonania commita, push, wdrożenia ani zaliczenia testu bez rzeczywistego potwierdzenia.

## Architektura

```text
src/
  app/                  # Punkt wejścia, routing i providery
  components/
    ui/                 # Wspólne prymitywy interfejsu
    layout/             # Układ aplikacji
    shared/             # Wspólne komponenty złożone
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
    welcome/            # Publiczny ekran powitalny
  hooks/                # Hooki współdzielone przez funkcjonalności
  lib/                  # Konfiguracja bibliotek i infrastruktura
  services/             # Współdzielony dostęp do zewnętrznych usług
  types/                # Rzeczywiście współdzielone typy
  styles/               # Style globalne i tokeny
  test/                 # Wspólna konfiguracja testów
e2e/                    # Testy aplikacji w przeglądarce
supabase/
  migrations/           # Migracje od ETAPU 3
  functions/            # Operacje serwerowe we właściwych etapach
```

- Moduł w `features/` przechowuje własne komponenty, hooki, serwisy, walidację i typy w miarę ich powstawania.
- Komponenty UI nie wykonują zapytań do bazy. Wydzielaj dostęp do danych do serwisów, a stan zapytań do hooków TanStack Query po jego wprowadzeniu.
- Nie twórz globalnego stanu, jeśli wystarcza stan lokalny, URL lub cache zapytań. Zustand dodaj dopiero przy konkretnej potrzebie.
- Komponenty współdzielone nie powinny zależeć od modułów biznesowych. Unikaj cyklicznych importów.
- Dziel kod według odpowiedzialności. Nie umieszczaj aplikacji w jednym pliku.
- Katalogi z `.gitkeep` rezerwują miejsce; nie oznaczają gotowych funkcjonalności.

## Konwencje kodowania

- Stosuj TypeScript `strict`, `noUncheckedIndexedAccess` i `exactOptionalPropertyTypes`.
- Nie wyłączaj reguł typów ani ESLint w celu zamaskowania błędu. Dane z zewnątrz traktuj jako `unknown` i waliduj; unikaj `any`.
- Używaj komponentów funkcyjnych, nazwanych eksportów i importów typów przez `import type`.
- Komponenty i typy: `PascalCase`. Funkcje i zmienne: `camelCase`. Pliki i katalogi: `kebab-case`. Hooki: `useSomething` w pliku `use-something.ts`.
- Testy komponentów i logiki zapisuj obok kodu jako `*.test.ts` lub `*.test.tsx`. Scenariusze przeglądarkowe umieszczaj w `e2e/*.spec.ts`.
- Używaj aliasu `@/` między modułami. Krótkie importy wewnątrz modułu mogą być względne.
- Prettier i `.editorconfig` określają format: dwie spacje, pojedyncze cudzysłowy w JS/TS, bez średników, LF.
- Tailwind CSS 4 korzysta z `@tailwindcss/vite` i `@import 'tailwindcss'`. Nie dodawaj konfiguracji Tailwind 3 bez uzasadnienia.
- Zależności dodawaj przy rzeczywistej potrzebie. Sprawdzaj aktualne wersje, `engines` i `peerDependencies`.
- Przechowuj dokładne wersje i `package-lock.json`. Odtwarzalne instalacje wykonuj przez `npm ci`.

## Interfejs i dostępność

- Buduj spójny interfejs oparty na tokenach kolorów, typografii i odstępów. Rozbudowany design system powstaje w ETAPIE 2.
- Używaj semantycznego HTML, widocznego fokusu, etykiet formularzy i dostępnych nazw przycisków.
- Interakcje muszą działać z klawiatury. Nie zastępuj przycisków klikalnymi elementami `div`.
- Uwzględniaj małe ekrany, powiększenie tekstu, kontrast i `prefers-reduced-motion`.
- W modułach z danymi zapewniaj loading, empty state, błędy i potwierdzenie wykonanej operacji.
- Nie pokazuj fikcyjnych statystyk, klientów ani zadań jako rzeczywistych danych. Planowane moduły oznaczaj jednoznacznie.

## Bezpieczeństwo

- Nie commituj `.env`, haseł, tokenów, kluczy prywatnych, `node_modules`, buildów ani wyników testów.
- `.env.example` zawiera wyłącznie nazwy zmiennych, puste wartości i instrukcje.
- Wszystkie `VITE_*` są publiczne w przeglądarce. Nigdy nie umieszczaj tam klucza Supabase `service_role`, klucza sekretnego ani hasła bazy.
- W ETAPIE 1 nie integruj logowania, Supabase ani bazy. Przed ETAPEM 3 poproś o konfigurację projektu Supabase.
- Docelowo autoryzację egzekwuj przez PostgreSQL RLS i operacje serwerowe. Ukrycie przycisku nie jest kontrolą dostępu.
- Izoluj encje organizacji według członkostwa i roli. Waliduj powiązania między encjami, aby nie łączyły danych różnych organizacji.
- Zaproszenia, sekrety i krytyczne operacje obsługuj po stronie serwera. Dla Storage stosuj prywatne zasobniki i polityki dostępu.
- Schemat wersjonuj w migracjach. Jawny seed developerski dodaj przy działającym środowisku developerskim; nie uruchamiaj go na produkcji.

## Git workflow

- Uzgodniony ETAP 4 obejmuje dwie gałęzie i około trzy spójne commity: logowanie/sesje oraz rejestrację/potwierdzenie e-maila na `feat/authentication`, następnie odzyskiwanie konta i profil na drugiej gałęzi. Ten uzgodniony podział ma pierwszeństwo przed ogólną zasadą gałęzi dla każdej funkcjonalności. Google OAuth odłożono decyzją użytkownika; zakres etapu obejmuje e-mail i hasło. Po każdym commicie zatrzymaj edycję do potwierdzenia użytkownika.
- Uzgodniony ETAP 3 obejmuje dwie gałęzie i około trzy spójne commity: model danych oraz polityki/Storage na `feat/supabase-foundation`, następnie integrację klienta na `feat/supabase-integration`. Po każdym commicie czekaj na potwierdzenie użytkownika przed kolejnymi edycjami.
- Funkcjonalności: `feat/nazwa-funkcji`; poprawki: `fix/nazwa-poprawki`.
- Każda nowa, odrębna funkcjonalność dostaje własny branch, także w ramach tego samego etapu. Drobne poprawki bieżącej funkcjonalności pozostają na jej gałęzi.
- Przed kodowaniem nowej funkcjonalności podaj użytkownikowi komendy utworzenia i publikacji brancha, a następnie czekaj na potwierdzenie. Nowy branch opieraj na uzgodnionej, aktualnej bazie; jawnie opisz zależność od innej niescalonej gałęzi.
- Pierwszy push: `git push -u origin nazwa-brancha`. Sprawdź `git branch -vv`, aby branch funkcjonalności nie śledził przypadkowo `origin/main`.
- W obecnym trybie agent nie wykonuje `git add`, `git commit`, `git push` ani zmiany brancha. Operacje Git wykonuje użytkownik do czasu zmiany tej instrukcji.
- Stosuj Conventional Commits, np. `feat(layout): add application sidebar`, `fix(auth): handle expired sessions`, `docs: add project architecture and roadmap`.
- Jeden commit obejmuje spójną zmianę. Nie generuj pustych ani sztucznie rozdrobnionych commitów.
- Przed commitem sprawdź diff, jakość i obecność sekretów. Po commicie sprawdź status Git.
- Nie używaj `push --force`, `reset --hard` ani destrukcyjnego przywracania plików. Nie scalaj automatycznie do `main`.
- Zakończenie etapu wymaga raportu i decyzji użytkownika o dalszej pracy.

## Testy i kontrole

- Używaj Node zgodnego z `package.json`; wersja odniesienia jest w `.node-version`.
- Po istotnych zmianach uruchamiaj `npm run check`: ESLint, Prettier, Vitest i build z kontrolą typów.
- Po zmianach UI uruchamiaj właściwe testy Playwright na desktopie i telefonie. Sprawdzaj błędy wykonania, klawiaturę, dostępność i responsywność.
- Testuj zachowanie użytkownika, integralność danych i granice uprawnień. Unikaj testów powielających implementację.
- Po wprowadzeniu bazy dodaj testy RLS własnej organizacji i odmowy dostępu do innej organizacji.
- Dla zmian wyłącznie dokumentacyjnych sprawdź formatowanie, opisane komendy i diff. Nie deklaruj testów, których nie uruchomiono.
- Sprawdź kod zakończenia testów. Częściowy log lub zawieszony runner nie oznacza zaliczonego przebiegu.
- Dokumentuj ograniczenia środowiska i brakujące kontrole. Nie commituj niewyjaśnionych błędów.
