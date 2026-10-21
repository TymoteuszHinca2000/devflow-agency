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
- Aktualne screenshoty oraz testy ekranu: 4 testy React i 18 scenariuszy E2E.

### Naprawiono

- Zamykanie runnera Playwright w sprawdzonym środowisku Windows: fixture zarządza podglądem przez API Vite i zamyka serwer w `finally`.

### Stan realizacji

- ETAP 1 trwa: gotowe są ekran powitalny i katalog planowanych modułów; wizualna roadmapa pozostaje następnym zadaniem.
- Logowanie, baza danych i moduły biznesowe nie są zaimplementowane.
- Kontrole aktualnego ekranu i pełny przebieg 18 scenariuszy E2E zakończyły się poprawnie na Node 24.19.0.
- Operacje Git wykonuje użytkownik po sprawdzeniu zmian i otrzymaniu poleceń od agenta.
