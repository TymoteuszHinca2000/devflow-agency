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

## ETAP 3 — Supabase i relacyjny model danych · DONE

- [x] Uzyskanie konfiguracji Supabase od użytkownika i ustalenie środowisk.
- [x] Klient Supabase, walidacja publicznej konfiguracji i generowane typy bazy.
- [x] Migracje: `profiles`, `organizations`, `organization_members`, `organization_invitations`.
- [x] Migracje: `clients`, `projects`, `project_members`, `tasks`, `task_comments`, `time_entries`.
- [x] Migracje: `quotes`, `quote_items`, `attachments`, `notifications`, `activity_logs`.
- [x] UUID, klucze obce, indeksy, ograniczenia, `created_at` i `updated_at`.
- [x] Integralność powiązań organizacji i RLS z domyślną odmową dostępu.
- [x] Szczegółowe polityki odczytu i zapisu dla ról, z testami izolacji.
- [x] Prywatny Storage i polityki dostępu do plików.
- [x] Jawny, opcjonalny `supabase/seed.sql` tylko dla środowiska developerskiego.
- [x] Testy SQL migracji, izolacji organizacji i dostępu anonimowego.
- [x] Zastosowanie migracji do projektu developerskiego i testy rzeczywistych usług Supabase.

Etap scalono do `main` przez PR #3 (`11c4c21`). Uzgodnione dwie gałęzie i trzy commity to `0503a24` z modelem, `c59cd28` z politykami/Storage oraz `0484599` z klientem i integracją. Dwie migracje zastosowano do developerskiego `devflow-agency-dev` na PostgreSQL 17.11, uzgadniając historię z plikami repozytorium. Zdalny i lokalny schemat są zgodne. Przeszły 50 testów aplikacji, 100 testów SQL, kontrola generatora, build oraz 16 odczytowych i 20 zapisujących kontroli HTTP. Dane testowe pozostawiono na decyzję użytkownika; fizyczne pliki usunięto. [Raport i ograniczenia](docs/stage-3-report.md) · [Instrukcja integracji](docs/supabase-integration.md).

## ETAP 4 — Uwierzytelnianie i sesje · IN PROGRESS

- [x] Logowanie e-mailem oraz hasłem i bezpieczne komunikaty błędów.
- [x] React Hook Form, Zod i dostępna walidacja formularza logowania.
- [x] Formularz rejestracji konta i walidacja nowych haseł.
- [x] Potwierdzenie e-maila, ponowna wysyłka i callback PKCE z obsługą nieprawidłowych linków.
- [x] Rzeczywista rejestracja, otrzymanie wiadomości, potwierdzenie adresu i logowanie hasłem potwierdzone przez użytkownika.
- [ ] Ponowny test otwarcia sesji bezpośrednio z nowej rzeczywistej wiadomości po poprawce callbacku.
- [x] Reset i zmiana hasła, wygasłe i nieprawidłowe linki — kod i testy izolowane.
- [x] Weryfikowane sesje, wylogowanie z bieżącej przeglądarki, chronione trasy i obsługa wygaśnięcia sesji.
- [x] Edycja profilu i bezpieczne przesyłanie awatara — kod i testy izolowane.
- [x] Testy logowania, sesji, bezpiecznych przekierowań i dostępu do tras.
- [x] Izolowane testy rejestracji, ponownej wysyłki, callbacków i ponownego użycia linku.
- [x] Testy izolowane odzyskiwania konta i profilu, pełna regresja i raport.
- [x] Rzeczywisty zapis nazwy, upload/podgląd i usunięcie awatara potwierdzone przez użytkownika.
- [x] Wznowienie rzeczywistego resetu po odświeżeniu, zapis nowego hasła i logowanie nim potwierdzone przez użytkownika.
- [ ] Trzeci commit, publikacja zmian i decyzja o zamknięciu etapu.

**Google OAuth odłożono decyzją użytkownika.** Obecny zakres uwierzytelniania to e-mail i hasło; odłożony dostawca nie blokuje zamknięcia tego zakresu etapu.

Uzgodniony podział: dwie gałęzie i około trzy commity. Użytkownik utworzył `feat/authentication` z `main` przy `11c4c21` i wypchnął `a42bb25` (logowanie/sesje) oraz `1d2942e` (rejestracja/potwierdzenie). Następnie utworzył i opublikował `feat/account-management` z `1d2942e`. Trzeci zakres obejmuje odzyskiwanie konta, profil i końcową weryfikację; czeka na commit użytkownika. Po przekazaniu komend agent zatrzymuje edycję do potwierdzenia.

Obecny zakres: 143 testy aplikacji, 100 testów SQL i 144 scenariusze Playwright. E2E używa osobnego buildu i izolowanych odpowiedzi HTTP; nie tworzy kont w Supabase. Użytkownik potwierdził rzeczywistą rejestrację, pocztę, akceptację adresu, logowanie hasłem, profil z awatarem oraz wznowienie resetu po odświeżeniu, zmianę hasła i logowanie nowym hasłem. Zapisał adresy powrotu potwierdzania i recovery. Powtórna próba sesji bezpośrednio z nowej wiadomości signup pozostaje niepotwierdzona. [Raport ETAPU 4](docs/stage-4-report.md) · [Profil i recovery](docs/account-management.md).

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

1. Zapisano potwierdzenie użytkownika dla profilu, awatara, wznowienia resetu i logowania nowym hasłem; pozostałe granice kontroli opisuje raport ETAPU 4.
2. Użytkownik zapisuje i publikuje trzeci commit na `feat/account-management`.
3. Po potwierdzeniu można przygotować jeden PR tej gałęzi do `main`, obejmujący cały ETAP 4. ETAP 5 wymaga osobnej decyzji użytkownika.
4. Agent zatrzymuje edycję po przekazaniu poleceń commita i push, do potwierdzenia użytkownika.
