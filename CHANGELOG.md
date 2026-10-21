# Historia zmian

Opisujemy istotne, rzeczywiście przygotowane zmiany. `Unreleased` nie oznacza opublikowanego wydania ani zakończonego etapu. Projekt nie ma jeszcze wydania produkcyjnego.

## Unreleased

### Dodano

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
- Aktualne screenshoty oraz testy ekranu: 12 testów React i 50 scenariuszy E2E.

### Naprawiono

- Zamykanie runnera Playwright w sprawdzonym środowisku Windows: fixture zarządza podglądem przez API Vite i zamyka serwer w `finally`.
- Kolejność ładowania warstw CSS dialogów: style są importowane centralnie po Tailwind CSS, aby reset nie nadpisywał odstępów i typografii.

### Stan realizacji

- ETAP 1 zakończono i scalono do `main` przez PR #1 (`56029a8`).
- ETAP 2 rozpoczęto na `feat/app-shell`; pierwsze zadanie obejmuje wspólne tokeny i wybór motywu.
- Przygotowano podstawowe komponenty UI, dialogi, panel nawigacji mobilnej i wspólną tabelę; routing oraz układ aplikacji pozostają kolejnymi zadaniami.
- Logowanie, baza danych i moduły biznesowe nie są zaimplementowane.
- Kontrole aktualnego ekranu i pełny przebieg 50 scenariuszy E2E zakończyły się poprawnie na Node 24.19.0; axe-core sprawdza również wszystkie otwarte opisy roadmapy i nawigację mobilną przed otwarciem oraz po otwarciu panelu. Dialog i cztery kierunki panelu przeszły osobną kontrolę w 20 kombinacjach rozmiarów i motywów.
- Operacje Git wykonuje użytkownik po sprawdzeniu zmian i otrzymaniu poleceń od agenta.
