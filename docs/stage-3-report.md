# Raport ETAPU 3 — Supabase i model danych

Data weryfikacji: 2026-10-21. Kod i weryfikacja ETAPU 3 są gotowe. Trzeci commit i push wykonuje użytkownik; gałęzie nie zostały automatycznie scalone. ETAP 4 wymaga osobnej decyzji.

## Zakres i historia

- `feat/supabase-foundation`: `0503a24` — relacyjny model 15 tabel i testy migracji.
- `feat/supabase-foundation`: `c59cd28` — polityki ról, granty kolumn, prywatny Storage i testy bezpieczeństwa.
- `feat/supabase-integration`, oparta na obu commitach: klient Supabase, walidacja publicznej konfiguracji, generowane typy, testy usług zdalnych i dokumentacja. Commit przygotowany, jeszcze niewykonany.

Migracje zastosowano do **developerskiego** projektu `devflow-agency-dev` przez integrację Supabase. PostgreSQL 17.11 zawiera 15 tabel z RLS. `agency-files` jest prywatny i ma limit 20 MiB, a `avatars` jest prywatny z limitem 2 MiB. Nie tworzono płatnych projektów ani gałęzi Supabase. Nie uruchamiano opcjonalnego seed.

Historia zdalna zgadza się z wersjami plików `20261021000100` i `20261021000200`. Zastosowane pliki migracji są identyczne z commitem `c59cd28`. Porównanie struktury lokalnego odtworzenia i projektu zdalnego potwierdziło zgodność **165 kolumn, 134 ograniczeń i 27 wartości enumów**. Wersje PostgreSQL różnią się: lokalny PGlite 18.6 i zdalny 17.11; podczas porównania pominięto techniczne wpisy NOT NULL dodane do katalogu ograniczeń w PostgreSQL 18, zachowując porównanie nullowalności kolumn.

## Wyniki kontroli

| Kontrola                                           | Wynik                                                |
| -------------------------------------------------- | ---------------------------------------------------- |
| Node                                               | 24.19.0                                              |
| ESLint, Prettier, TypeScript, build                | PASS                                                 |
| Vitest / Testing Library                           | 50/50, w tym 23 nowe kontrole konfiguracji i klienta |
| SQL na izolowanym PGlite                           | 100/100: 38 bazowych i 62 pełnego łańcucha           |
| Oficjalny generator i zgodność typów z migracjami  | PASS                                                 |
| Playwright / Chromium, desktop i telefon           | 80/80                                                |
| Auth HTTP i anonimowe odczyty Data API             | 16/16                                                |
| Auth, JWT, zalogowane role i fizyczny Storage HTTP | 20/20                                                |

Czyste `npm ci` i pełne `npm run check` przeszły także w oddzielnej kopii źródeł bez `.env.local`. Odtwarzalność generatora i buildu nie zależy od lokalnego projektu Supabase. Kontrola 160 plików tekstowych nie znalazła skopiowanych wartości rzeczywistej konfiguracji; `.env.local` pozostaje ignorowany, a tymczasowy plik poświadczeń testowych nie istnieje.

Testy HTTP użyły trzech izolowanych kont: właścicieli dwóch różnych agencji oraz pracownika przypisanego do projektu pierwszej agencji. Potwierdzono:

- Wydanie sesji przez prawdziwy Auth i jej sprawdzenie przez `getUser()` oraz utworzenie profilu przez trigger.
- Odczyt własnej organizacji, brak widoczności i możliwości aktualizacji obcego zadania, aktualizację zadania pracownika z `RETURNING`.
- Odrzucenie podniesienia roli, zmiany organizacji zadania, zapisu do obcej organizacji i odczytu zaproszeń.
- Upload fizycznego pliku po rejestracji metadanych i odczyt identycznych bajtów przez przypisanego pracownika.
- Odrzucenie pobrania przez obcą organizację i anonimowo, także przez publiczny URL.
- Odrzucenie uploadu bez metadanych, nadpisania przez upsert i usunięcia przez obcą organizację.
- Upload awatara, odczyt identycznych bajtów przez aktywnego współpracownika i odmowę dla obcego właściciela.
- Egzekwowanie limitu 2 MiB (`413`) oraz typu MIME (`415`).

Po aktualizacji statusu roadmapy ponownie sprawdzono 80 scenariuszy E2E oraz zrzuty sześciu wariantów ekranu (320, 390, 768 i 1440 px; jasny i ciemny motyw). Brak poziomego przewijania w tych wariantach. Regresja obejmuje klawiaturę, menu, routing, motywy i automatyczne kontrole dostępności. [Aktualny plan rozwoju](screenshots/stage-3-roadmap.png).

## Dane pozostałe po testach

Runner usunął oba fizyczne obiekty przez Storage API i wylogował konta. Odczyt administracyjny potwierdził **0 obiektów w Storage**. Próby sprzątania rekordów przez integrację dwukrotnie zakończyły się błędem `Invalid or expired requestState`. Użytkownik następnie wybrał **„Zostaw je na razie”**, więc nie ponawiano usuwania.

Zachowano 3 konta `devflow-51107523-…@example.test`, ich profile, dwie agencje `[INTEGRATION TEST] A/B`, dwa projekty, członkostwa, jedno zadanie i jedne metadane załącznika bez fizycznego pliku. To izolowane fixture sprawdzenia usług, nie opcjonalny seed aplikacji. Nie wysyłano wiadomości e-mail. Tymczasowy plik z danymi uwierzytelniającymi został usunięty; haseł, sesji i kluczy nie ma w repozytorium ani raporcie.

## Doradcy Supabase i ograniczenia

Doradca bezpieczeństwa nie zgłosił ostrzeżeń ani błędów. Zwrócił jedną informację o braku polityk na `organization_invitations`: jest to zamierzona odmowa dostępu do zaproszeń z przeglądarki. Przyszły serwerowy proces zaproszeń należy do ETAPU 5. [Opis kontroli Supabase](https://supabase.com/docs/guides/database/database-linter?lint=0008_rls_enabled_no_policy).

Doradca wydajności zwrócił wyłącznie 31 informacji o dotąd nieużytych indeksach w nowym projekcie. Nie usuwano indeksów chroniących wydajność kluczy obcych i przyszłych zapytań na podstawie pustego obciążenia. [Opis kontroli Supabase](https://supabase.com/docs/guides/database/database-linter?lint=0005_unused_index).

To weryfikacja fundamentu, nie pełny audyt bezpieczeństwa ani test obciążeniowy. Testy SQL obejmują więcej ról i przypadków niż testy HTTP. Nie zweryfikowano jeszcze współbieżnych zmian drzewa zadań w wielu połączeniach ani przyszłych workflow modułów. Formularze Auth, callbacki, odzyskiwanie konta, OAuth, ochrona tras i provider sesji pozostają w ETAPIE 4. Zarządzanie organizacjami i zaproszeniami pozostaje w ETAPIE 5.

## Odtworzenie i następny krok

```powershell
npm ci
npm run check
npm run supabase:verify
```

Pierwsze dwie komendy nie wymagają Supabase, Docker ani `.env.local`; ostatnia wymaga publicznej konfiguracji projektu i sieci. Pełny test zapisujący dane developerskie wymaga świadomego przygotowania fixture. [Instrukcja integracji](supabase-integration.md).

Użytkownik zapisuje trzeci commit na `feat/supabase-integration` i wykonuje push. Następnie można przygotować jeden PR tej gałęzi do `main`, zawierający wszystkie trzy commity ETAPU 3. Agent czeka na potwierdzenie poleceń Git przed kolejnymi edycjami.
