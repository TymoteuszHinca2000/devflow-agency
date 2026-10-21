# DevFlow Agency — roadmapa

Statusy: **TODO**, **IN PROGRESS**, **DONE**. Zakończenie etapu oznacza działający zakres, weryfikację i raport. Rozpoczęcie kolejnego etapu wymaga decyzji użytkownika.

## ETAP 1 — Fundament projektu · IN PROGRESS

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
| Katalog planowanych modułów z filtrowaniem                      | TODO   |
| Wizualny, rozwijany plan rozwoju na stronie                     | TODO   |
| Screenshoty aktualnej sekcji powitalnej                         | DONE   |
| Końcowa weryfikacja: typy, lint, build, testy, klawiatura i RWD | TODO   |
| Naprawa zamykania runnera Playwright w Windows                  | DONE   |
| Raport i decyzja o ETAPIE 2                                     | TODO   |

Nie implementować logowania ani bazy. Katalogi przyszłych modułów rezerwują miejsce na dalszy rozwój.

Bieżąca sekcja przeszła lint, formatowanie, kontrolę typów, build, 2 testy React i 12 scenariuszy Playwright, w tym kontrole axe-core obu motywów. Następne sekcje otrzymają osobne commity po potwierdzeniu użytkownika.

## ETAP 2 — Design system i układ aplikacji · TODO

- [ ] Tokeny kolorów, typografii, odstępów i stanów interakcji.
- [ ] shadcn/ui oraz wspólne przyciski, pola, karty, dialogi i tabele.
- [ ] Sidebar, responsywny topbar i nawigacja mobilna.
- [ ] React Router, trasy modułów i strona nieznalezionego adresu.
- [ ] Motyw jasny, ciemny i systemowy z zapamiętaniem preferencji.
- [ ] Skeletony, empty states, toasty i obsługa błędów.
- [ ] Weryfikacja klawiatury, kontrastu, dialogów i urządzeń mobilnych.

## ETAP 3 — Supabase i relacyjny model danych · TODO

- [ ] Uzyskanie konfiguracji Supabase od użytkownika i ustalenie środowisk.
- [ ] Klient Supabase, walidacja publicznej konfiguracji i generowane typy bazy.
- [ ] Migracje: `profiles`, `organizations`, `organization_members`, `organization_invitations`.
- [ ] Migracje: `clients`, `projects`, `project_members`, `tasks`, `task_comments`, `time_entries`.
- [ ] Migracje: `quotes`, `quote_items`, `attachments`, `notifications`, `activity_logs`.
- [ ] UUID, klucze obce, indeksy, ograniczenia, `created_at` i `updated_at`.
- [ ] Integralność powiązań organizacji i RLS z domyślną odmową dostępu.
- [ ] Prywatny Storage i polityki dostępu do plików.
- [ ] Jawny, opcjonalny `supabase/seed.sql` tylko dla środowiska developerskiego.
- [ ] Testy migracji, izolacji organizacji i dostępu anonimowego.

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

1. Użytkownik sprawdza i zapisuje nagłówek oraz główną sekcję: `feat(welcome): add header and hero section`.
2. Agent czeka na potwierdzenie commita i push, a następnie przygotowuje katalog planowanych modułów.
3. Po commicie katalogu i potwierdzeniu użytkownika agent przygotowuje sekcję roadmapy.
4. Po każdym zadaniu agent przekazuje polecenia Git i zatrzymuje edycję do potwierdzenia.
5. Po zakończeniu ETAPU 1 użytkownik podejmuje osobną decyzję o ETAPIE 2. Nowy branch także tworzy użytkownik po otrzymaniu poleceń.
