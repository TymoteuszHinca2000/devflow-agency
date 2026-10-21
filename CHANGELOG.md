# Historia zmian

Opisujemy istotne, rzeczywiście przygotowane zmiany. `Unreleased` nie oznacza opublikowanego wydania ani zakończonego etapu. Projekt nie ma jeszcze wydania produkcyjnego.

## Unreleased

### Dodano

- Integrację ETAPU 3: leniwy, typowany klient Supabase 2.118.0, walidację publicznej konfiguracji bez ujawniania wartości i 23 nowe testy klienta oraz błędów konfiguracji.
- Generowanie typów oficjalnym `@supabase/typegen` 0.2.2 z lokalnych migracji, sprawdzanie zgodności w `npm run check` oraz Supabase CLI 2.121.0.
- Zastosowanie dwóch istniejących migracji do developerskiego Supabase, zgodną historię migracji oraz weryfikację struktury zdalnej i lokalnej.
- Kontrole Auth i anonimowej odmowy 15 tabel oraz 20 rzeczywistych testów Auth/JWT, Data API, uprawnień i fizycznych plików Storage. Raport opisuje pozostawione na decyzję użytkownika fixture oraz usunięte pliki.
- Raport ETAPU 3, instrukcję integracji i aktualny status planu rozwoju na ekranie powitalnym.
- Drugą migrację ETAPU 3: polityki dla ról agencji, dostęp pracowników do przypisanych projektów i granty konkretnych kolumn.
- Prywatne zasobniki `agency-files` (20 MiB) i `avatars` (2 MiB), polityki odczytu/uploadu/usuwania i restrykcyjną ochronę przed nadpisaniem, przenoszeniem oraz upublicznieniem bucketów.
- Zawieszanie dostępu do projektu bez kasowania historii, sprawdzanie aktywności przy przypisaniu zadania i serwerowe ograniczenie zmian ról, zaproszeń, audytu, stawek i cyklu wycen.
- 62 testy pełnego łańcucha migracji uprawnień, Storage i seed, łącznie 100 testów SQL, oraz dokumentację macierzy dostępu i ograniczeń integracji.
- Pierwszą część ETAPU 3: wersjonowaną migrację 15 tabel PostgreSQL ze złożonymi kluczami obcymi, indeksami, UUID i znacznikami czasu.
- Domyślną odmowę dostępu RLS i jawne cofnięcie uprawnień przeglądarkowych w pierwszej migracji, rozszerzone o szczegółowe polityki w drugiej.
- Profile powiązane z Supabase Auth, ochronę tożsamości i organizacji wiersza, cykli podzadań, pojedynczego timera oraz dokładne kwoty pozycji wyceny.
- Izolowane testy migracji i integralności na PGlite 0.5.10, polecenie `npm run test:db` włączone do `npm run check` oraz dokumentację modelu bazy.
- Opcjonalny seed oznaczony `[DEMO]`, wyłączony domyślnie i wymagający istniejącego konta Auth oraz jawnego wyboru środowiska developerskiego.
- Lokalną konfigurację Supabase CLI i wykluczenie jego katalogów roboczych. Migracje zastosowano do zdalnego projektu developerskiego podczas integracji ETAPU 3.
- Raport zakończenia weryfikacji ETAPU 2: odtworzenie zależności w osobnym katalogu, kontrolę 35 widoków, 26 par kontrastu i ponowną kontrolę komponentów UI.
- Cztery przebiegi regresji toastów na desktopie i telefonie, obejmujące kolejkę, zmianę wysokości okna, fokus oraz akcję w długim komunikacie.

- Fundament React, TypeScript strict i Vite oraz alias `@/`.
- Integrację Tailwind CSS 4 przez plugin Vite.
- ESLint z kontrolą typów, Prettier, EditorConfig i konwencje końców linii.
- Lockfile, wymagania Node i `.node-version`.
- Modularne katalogi aplikacji oraz miejsca na przyszłe moduły i Supabase.
- Bezpieczny `.env.example` z pustą konfiguracją przyszłej integracji.
- Konfigurację Vitest, Testing Library i Playwright oraz podstawowe testy.
- Dokumentację architektury, bezpieczeństwa, Git workflow i planu 15 etapów.
- Nagłówek z menu mobilnym, główną sekcję powitalną z ilustracją i stopkę.
- Wspólne logo, linki akcji, lokalne fonty i favicon.
- Systemową kolorystykę jasną/ciemną, obsługę klawiatury, skip link i ograniczenie ruchu.
- Katalog planowanych modułów z podziałem na pracę zespołu i relacje z klientami.
- Filtry obsługiwane klawiaturą, licznik wyników dla czytników ekranu i nawigację do katalogu.
- Osobne dane opisowe i style katalogu, bez połączenia z backendem.
- Rozwijany plan rozwoju w czterech obszarach obejmujących wszystkie 15 etapów.
- Oznaczenie bieżącego etapu i natywne rozwijanie opisów za pomocą klawiatury.
- Nawigację do roadmapy z menu i sekcji powitalnej oraz link do pełnego planu na GitHubie.
- Wspólne tokeny kolorów, fontów, odstępów, zaokrągleń i fokusu oraz ich mapowanie do Tailwind CSS.
- Wybór motywu jasnego, ciemnego i systemowego z zapamiętywaniem ustawienia.
- Odczyt motywu przed uruchomieniem Reacta, reakcję na zmianę systemu, synchronizację kart i obsługę blokady zapisu.
- Kontrolkę motywu dostępną klawiaturą w nawigacji i menu mobilnym oraz dokumentację tokenów.
- Konfigurację shadcn/ui i lokalne komponenty `Button`, `Card`, `Input` oraz `Label`.
- Adapter semantycznych kolorów i zaokrągleń do palety DevFlow oraz funkcję `cn`.
- Wspólny przycisk w linkach akcji i wspólną kartę w katalogu modułów.
- Domyślny typ `button`, stany disabled i błędu pola, etykiety i przekazywanie refa.
- Dokumentację komponentów, odizolowane podglądy i informację o licencji źródłowego kodu.
- Wspólne komponenty `Dialog` i `Sheet` oparte na Radix Dialog, z tytułem, opisem i polskim przyciskiem zamknięcia.
- Modalną nawigację mobilną: fokus wewnątrz panelu, blokadę przewijania, zamykanie przez Escape, przycisk i tło oraz przekazanie fokusu do wybranej sekcji.
- Zamykanie panelu po przejściu do szerokości desktopowej i przywracanie fokusu w widocznej nawigacji.
- Cztery kierunki wysuwania panelu, przewijanie na niskich ekranach i animacje respektujące ograniczenie ruchu.
- Wspólną tabelę `Table` z natywnymi częściami nagłówka, treści, stopki, wierszy, komórek i podpisu.
- Domyślne nagłówki kolumn z możliwością użycia nagłówków wierszy oraz podpis i przewijanie poziome dostępne klawiaturą.
- Podglądy tabeli w obu motywach oraz kontrolę 6 wariantów szerokości i motywu, w tym pustego widoku i audytu axe.
- React Router 8.4.0, publiczną stronę `/`, listę obszarów `/app` i dziesięć adresów planowanych modułów.
- Link do modułów ze strony powitalnej oraz stronę 404 dla nieznanych adresów, również zagnieżdżonych.
- Tytuły dokumentu, przekazywanie fokusu po zmianie strony i powrót do sekcji planu rozwoju; zachowanie motywu w nawigacji SPA.
- Testy bezpośrednich adresów, odświeżania, historii przeglądarki, nieprawidłowego fragmentu URL i dostępności nowych stron.
- Układ aplikacji `/app`: stały sidebar, topbar ze ścieżką strony i wyborem motywu oraz wspólne linki modułów z oznaczeniem aktywnej strony.
- Wysuwane z lewej menu aplikacji do szerokości 1000 px, z fokusem na bieżącym module, obsługą klawiatury i zamykaniem po nawigacji.
- Obsługę zmiany szerokości na desktop, przywracanie fokusu i dostępność linków na niskich ekranach.
- Zachowanie układu aplikacji przy nieznanych adresach wewnątrz `/app`.
- `Skeleton`, `LoadingState` z wariantami kart i listy oraz wspólny `EmptyState` z nagłówkiem, opisem i akcjami.
- Komunikat ładowania `role="status"` poza grupą `aria-busy`, ukrycie dekoracyjnych szkieletów przed czytnikami ekranu i obsługę ograniczenia ruchu.
- Wykorzystanie wspólnego stanu w planowanych modułach, bez dodawania sztucznego oczekiwania na dane.
- Osobną gałąź `feat/ui-states` oraz zasadę nowej gałęzi dla każdej odrębnej funkcjonalności, z potwierdzeniem użytkownika przed kodowaniem.
- Globalny `Toaster` na Sonner 2.0.8 i wspólne API `notify` dla informacji, potwierdzeń, ostrzeżeń i błędów; opcjonalną akcję, aktualizację przez identyfikator i jawne zamknięcie.
- Polskie etykiety, skrót `Alt+T`, powrót fokusu przez Escape, przyciski 44 px i style toastów zgodne z motywem oraz ograniczeniem ruchu.
- Kontrolowany czas wyświetlania: 8 sekund dla informacji i potwierdzeń oraz ręczne zamykanie ostrzeżeń, błędów i komunikatów z akcją.
- Wspólny `ErrorState`, `ApplicationErrorBoundary` i `PageErrorBoundary` na react-error-boundary 6.1.6; bezpieczne komunikaty, ponowienie oraz nawigację po błędzie strony.
- Ekran awarii aplikacji działający bez providerów i routera oraz odzyskiwanie tytułu i fokusu po udanym ponowieniu.
- Aktualne screenshoty oraz testy ekranu: 27 testów React i 80 scenariuszy E2E; dodatkowe podglądy toastów w 5 wariantach oraz błędów w 10 widokach, z kontrolą klawiatury, akcji, ponowienia, nawigacji i axe.

### Naprawiono

- Toasty na niskich ekranach: jedna widoczna karta do wysokości 600 px, zachowanie kolejki i przewijanie treści do przycisku akcji.
- Status publicznej roadmapy: ETAP 2 jest zweryfikowany i gotowy do odbioru; kolejny etap oczekuje na decyzję.

- Zamykanie runnera Playwright w sprawdzonym środowisku Windows: fixture zarządza podglądem przez API Vite i zamyka serwer w `finally`.
- Kolejność ładowania warstw CSS dialogów: style są importowane centralnie po Tailwind CSS, aby reset nie nadpisywał odstępów i typografii.

### Stan realizacji

- ETAP 1 zakończono i scalono do `main` przez PR #1 (`56029a8`).
- ETAP 2 rozpoczęto na `feat/app-shell`; pierwsze zadanie obejmuje wspólne tokeny i wybór motywu.
- Zakres ETAPU 2 został ukończony i zweryfikowany na `chore/stage-2-verification`, utworzonym z `feat/error-handling` przy `a98b4e3`. Raport jest gotowy do odbioru. Commit, push i scalenie pozostają czynnościami użytkownika; ETAP 3 nie został rozpoczęty.
- `feat/ui-states` powstał z `feat/app-shell` przy `4e080ce`; zależność od niescalonego układu jest opisana w dokumentacji.
- `feat/toasts` powstał z `feat/ui-states` przy `455e832` i obejmuje obie zależności. Nie dodano demonstracyjnych operacji biznesowych.
- `feat/error-handling` powstał z `feat/toasts` przy `12174ff` i obejmuje wcześniejsze zmiany ETAPU 2. Kontrolowane awarie były wywoływane wyłącznie w testach i odizolowanym podglądzie.
- Logowanie, baza danych i moduły biznesowe nie są zaimplementowane.
- Kontrole aktualnego ekranu i pełny przebieg 80 scenariuszy E2E zakończyły się poprawnie na Node 24.19.0; axe-core sprawdza ekran powitalny, roadmapę, nawigację mobilną, listę modułów, podgląd modułu, 404 oraz otwarte menu aplikacji w obu motywach. Dialog i cztery kierunki panelu przeszły osobną kontrolę w 20 kombinacjach rozmiarów i motywów.
- Operacje Git wykonuje użytkownik po sprawdzeniu zmian i otrzymaniu poleceń od agenta.
