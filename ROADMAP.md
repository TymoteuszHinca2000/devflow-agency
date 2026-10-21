# DevFlow Agency — roadmapa

Statusy: **TODO**, **IN PROGRESS**, **DONE**. Zakończenie etapu oznacza działający zakres, weryfikację i raport. Rozpoczęcie kolejnego etapu wymaga decyzji użytkownika.

## ETAP 1 — Fundament projektu · DONE

| Zadanie                                                         | Status |
| --------------------------------------------------------------- | ------ |
| Sprawdzenie repozytorium, remote i środowiska                   | DONE   |
| React, TypeScript strict, Vite i alias `@/`                     | DONE   |
| Tailwind CSS 4 przez plugin Vite                                | DONE   |
| ESLint, Prettier, EditorConfig i konwencje końców linii         | DONE   |
| Lockfile i określenie wersji Node                               | DONE   |
| Modularna struktura katalogów                                   | DONE   |
| `.gitignore` i bezpieczny `.env.example`                        | DONE   |
| Konfiguracja Vitest, Testing Library i Playwright               | DONE   |
| AGENTS, README, ROADMAP i CHANGELOG                             | DONE   |
| Nagłówek, menu mobilne, główna sekcja powitalna i stopka        | DONE   |
| Katalog planowanych modułów z filtrowaniem                      | DONE   |
| Wizualny, rozwijany plan rozwoju na stronie                     | DONE   |
| Screenshoty aktualnej sekcji powitalnej                         | DONE   |
| Końcowa weryfikacja: typy, lint, build, testy, klawiatura i RWD | DONE   |
| Naprawa zamykania runnera Playwright w Windows                  | DONE   |
| Raport i decyzja o ETAPIE 2                                     | DONE   |

Nie implementować logowania ani bazy. Katalogi przyszłych modułów rezerwują miejsce na dalszy rozwój.

Etap zakończono raportem i decyzją użytkownika o dalszej pracy. Zmiany scalono do `main` przez PR #1 (`56029a8`). Weryfikacja zamykająca etap: lint, formatowanie, typy, build, 4 testy React i 24 scenariusze Playwright, w tym filtrowanie, rozwijanie opisów klawiaturą, fokus, RWD i kontrole axe-core obu motywów.

## ETAP 2 — Design system i układ aplikacji · DONE

- [x] Tokeny kolorów, typografii, odstępów i stanów interakcji.
- [x] Konfiguracja shadcn/ui oraz wspólne przyciski, pola, etykiety i karty.
- [x] Dostępne dialogi i wysuwany panel mobilny.
- [x] Wspólna tabela.
- [x] Sidebar, responsywny topbar i nawigacja mobilna.
- [x] React Router, trasy modułów i strona nieznalezionego adresu.
- [x] Motyw jasny, ciemny i systemowy z zapamiętaniem preferencji.
- [x] Skeletony i wspólne stany ładowania oraz braku danych.
- [x] Toasty.
- [x] Obsługa błędów.
- [x] Weryfikacja klawiatury, kontrastu, dialogów i urządzeń mobilnych.

Etap scalono do `main` przez PR #2 (`dc8d1ad`). Użytkownik zatwierdził rozpoczęcie ETAPU 3. [Raport weryfikacji](docs/stage-2-report.md).

Gotowe są tokeny, motywy, podstawowe komponenty shadcn/ui, dialogi, panel mobilny, tabela, routing, sidebar i topbar oraz stany ładowania i braku danych. Toasty mają wspólną instancję, typowane API, cztery rodzaje komunikatów, opcjonalną akcję, kontrolowany czas wyświetlania i obsługę klawiatury. Ich użycie w modułach będzie powiązane z rzeczywistymi operacjami. [Szczegóły i podgląd](docs/toasts.md).

Bieżące kontrole ETAPU 2: lint, formatowanie, typy, build, 27 testów React i 80 scenariuszy E2E. Ponownie sprawdzono kontrolki, dialogi, panele, tabelę, stany, toasty i błędy. Końcowa kontrola objęła 35 widoków, 26 par kontrastu i ekrany do 320 × 256 px. Poprawiono kolejkę toastów na niskim ekranie i dostęp do akcji w długiej treści. Gotowe są `ErrorState` oraz granice błędów aplikacji i pojedynczej strony. [Zakres obsługi błędów](docs/error-handling.md).

## ETAP 3 — Supabase i relacyjny model danych · IN PROGRESS

- [x] Uzyskanie konfiguracji Supabase od użytkownika i ustalenie środowisk.
- [ ] Klient Supabase, walidacja publicznej konfiguracji i generowane typy bazy.
- [x] Migracje: `profiles`, `organizations`, `organization_members`, `organization_invitations`.
- [x] Migracje: `clients`, `projects`, `project_members`, `tasks`, `task_comments`, `time_entries`.
- [x] Migracje: `quotes`, `quote_items`, `attachments`, `notifications`, `activity_logs`.
- [x] UUID, klucze obce, indeksy, ograniczenia, `created_at` i `updated_at`.
- [x] Integralność powiązań organizacji i RLS z domyślną odmową dostępu.
- [ ] Szczegółowe polityki odczytu i zapisu dla ról, z testami izolacji.
- [ ] Prywatny Storage i polityki dostępu do plików.
- [x] Jawny, opcjonalny `supabase/seed.sql` tylko dla środowiska developerskiego.
- [ ] Testy migracji, izolacji organizacji i dostępu anonimowego.

Uzgodniony podział: dwie gałęzie i około trzy commity. `feat/supabase-foundation` powstała z `main` przy `dc8d1ad`; pierwszy commit obejmuje pełny model i testy integralności, drugi polityki ról oraz prywatny Storage. Druga gałąź `feat/supabase-integration` powstanie po potwierdzeniu poleceń użytkownika i obejmie klienta React, generowane typy oraz końcową weryfikację. Projekt zdalny jest developerski; konfiguracja pozostaje w ignorowanym `.env.local`. Pierwsza migracja nie została jeszcze wdrożona do tego projektu. Testy schematu korzystają z izolowanego PostgreSQL PGlite. [Szczegóły modelu i ograniczenia testów](docs/database.md).

## ETAP 4 — Uwierzytelnianie i sesje · TODO

- [ ] Rejestracja i logowanie e-mailem oraz hasłem.
- [ ] React Hook Form, Zod i czytelne błędy walidacji.
- [ ] Potwierdzenie e-maila, ponowna wysyłka i callbacki.
- [ ] Google OAuth po konfiguracji dostawcy i przekierowań.
- [ ] Reset i zmiana hasła, wygasłe i nieprawidłowe linki.
- [ ] Sesje, wylogowanie, chronione trasy i obsługa wygaśnięcia sesji.
- [ ] Edycja profilu i bezpieczne przesyłanie awatara.
- [ ] Testy formularzy, sesji, callbacków i dostępu do tras.

## ETAP 5 — Organizacje i uprawnienia · TODO

- [ ] Tworzenie agencji i przełączanie organizacji na jednym koncie.
- [ ] Członkowie i role zgodnie z uzgodnionym modelem uprawnień.
- [ ] Zaproszenia: logika serwerowa, przyjęcie, wygaśnięcie i unieważnienie.
- [ ] Kontrola zmian ról i zabezpieczenie ostatniego właściciela.
- [ ] Powiązanie użytkowników portalu z klientami i zakresem dostępu.
- [ ] Cache TanStack Query rozdzielony według organizacji i użytkownika.
- [ ] Testy izolacji danych i prób eskalacji uprawnień.

## ETAP 6 — Dashboard · TODO

- [ ] Rzeczywiste statystyki projektów, klientów i zadań.
- [ ] Aktywne i ukończone zadania oraz postęp projektów.
- [ ] Recharts i przepracowane godziny.
- [ ] Najbliższe terminy i ostatnie aktywności.
- [ ] Zakres dat, loading, błędy i widoki bez danych.
- [ ] Testy agregacji, filtrów i uprawnień.

## ETAP 7 — Klienci · TODO

- [ ] Dodawanie, odczyt, edycja, archiwizacja i usuwanie z potwierdzeniem.
- [ ] Dane firmowe, kontaktowe, NIP i adres.
- [ ] Wyszukiwanie, filtry, paginacja i walidacja formularzy.
- [ ] Projekty klienta i historia współpracy.
- [ ] Kontrola zależności przy usuwaniu i testy uprawnień.

## ETAP 8 — Projekty · TODO

- [ ] Tworzenie i edycja oraz przypisanie klienta.
- [ ] Budżet, waluta, status i deadline.
- [ ] Procent ukończenia według uzgodnionej reguły.
- [ ] Członkowie projektu z kontrolą członkostwa w organizacji.
- [ ] Załączniki: kontrola rozmiaru, typu i dostępu.
- [ ] Historia aktywności, filtry i widok szczegółów.
- [ ] Testy formularzy, relacji i dostępu do plików.

## ETAP 9 — Zadania i Kanban · TODO

- [ ] Tworzenie i edycja zadań oraz podzadań.
- [ ] Priorytety, terminy, statusy i przypisani użytkownicy.
- [ ] Lista, wyszukiwanie i filtry.
- [ ] Kanban z dnd-kit, obsługą klawiatury i trwałą kolejnością.
- [ ] Aktualizacje optymistyczne z przywracaniem stanu po błędzie.
- [ ] Komentarze i historia zmian.
- [ ] Testy przesuwania, współbieżności, zapisu i uprawnień.

## ETAP 10 — Time tracking · TODO

- [ ] Start i stop timera oraz odporność na odświeżenie.
- [ ] Kontrola równoczesnych timerów i integralności przedziałów.
- [ ] Ręczne wpisy i przypisywanie czasu do zadań.
- [ ] Stawki godzinowe i rozliczany czas.
- [ ] Raporty, zakresy dat i sumowanie godzin.
- [ ] Eksport CSV z ochroną przed interpretacją wartości jako formuł.
- [ ] Testy stref czasowych, przedziałów i naliczania czasu.

## ETAP 11 — Wyceny i PDF · TODO

- [ ] Powiązanie wyceny z klientem i opcjonalnie projektem.
- [ ] Pozycje, ilości, ceny jednostkowe, waluty i statusy.
- [ ] Precyzyjne obliczenia pieniężne i walidacja serwerowa.
- [ ] Uzgodnione podatki, zaokrąglenia i numeracja.
- [ ] Historia i reguły edycji po udostępnieniu lub akceptacji.
- [ ] Generowanie PDF z polskimi znakami.
- [ ] Testy obliczeń, dokumentu i przejść statusów.

## ETAP 12 — Portal klienta · TODO

- [ ] Oddzielny układ i ograniczony zakres dostępu.
- [ ] Udostępnione projekty, postęp i statusy.
- [ ] Komentarze widoczne dla klienta.
- [ ] Pliki z autoryzacją pobierania.
- [ ] Akceptacja wycen i rejestracja decyzji po stronie serwera.
- [ ] Testy odmowy dostępu do danych wewnętrznych i innych klientów.

## ETAP 13 — Powiadomienia i aktywności · TODO

- [ ] Trwałe powiadomienia i oznaczanie jako przeczytane.
- [ ] Zdarzenia przypisań, komentarzy i zmian statusów.
- [ ] Historia aktywności tworzona przez zaufaną logikę serwerową.
- [ ] Preferencje powiadomień i ustawienia konta.
- [ ] Kontrola widoczności i ograniczenie danych osobowych w logach.
- [ ] Testy uprawnień, duplikatów i preferencji.

## ETAP 14 — Jakość, bezpieczeństwo i CI · TODO

- [ ] Rozszerzenie Vitest, Testing Library i Playwright dla krytycznych przepływów.
- [ ] Testy RLS, Storage, operacji serwerowych i granic organizacji.
- [ ] Audyt dostępności, klawiatury i responsywności.
- [ ] Optymalizacja zapytań, indeksów, paginacji i bundla.
- [ ] GitHub Actions: `npm ci`, lint, formatowanie, typy, testy i build.
- [ ] E2E na odizolowanym środowisku z bezpieczną konfiguracją sekretów.
- [ ] Kontrola zależności, uprawnień workflow i logowania błędów.

## ETAP 15 — Wdrożenie i wydanie produkcyjne · TODO

- [ ] Vercel oraz osobne środowiska preview i production.
- [ ] Routing SPA, zmienne środowiskowe i callbacki OAuth.
- [ ] Kontrolowane migracje, kopie zapasowe i plan odtworzenia.
- [ ] Weryfikacja Supabase Auth, Storage i RLS w środowisku docelowym.
- [ ] Testy podstawowych ścieżek po wdrożeniu.
- [ ] Screenshoty, dokumentacja architektury i link do działającego demo.
- [ ] CHANGELOG, wersja wydania i decyzja użytkownika o publikacji.

## Najbliższy krok

1. Użytkownik zapisuje i publikuje pierwszy commit ETAPU 3: model 15 tabel i testy SQL.
2. Po potwierdzeniu agent przygotuje drugi commit na tej samej gałęzi: polityki ról, prywatny Storage i testy bezpieczeństwa.
3. Na drugiej gałęzi zostanie przygotowana integracja klienta Supabase, typy bazy i końcowy raport ETAPU 3. Logowanie pozostaje zakresem ETAPU 4.
4. Po każdym uzgodnionym commicie agent przekazuje polecenia Git i zatrzymuje edycję do potwierdzenia. Kolejny etap wymaga osobnej decyzji użytkownika.
