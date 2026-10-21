# ETAP 2 — raport weryfikacji

Zakres techniczny ETAPU 2 jest ukończony i zweryfikowany. Gałąź `chore/stage-2-verification` powstała z `feat/error-handling` przy `a98b4e3` i zawiera wcześniejsze zmiany design systemu, układu, stanów, toastów oraz obsługi błędów. Raport nie oznacza wdrożenia ani scalenia do `main`. Commit, push i decyzję o następnym etapie wykonuje użytkownik.

## Gotowy zakres

- Wspólne tokeny oraz motyw jasny, ciemny i systemowy, z zapamiętaniem i synchronizacją kart.
- Lokalne komponenty shadcn/ui: przyciski, karty, pola, etykiety, dialog, panel, tabela i skeleton.
- React Router, strona powitalna, lista modułów, dziesięć planowanych adresów oraz widoki 404.
- Sidebar, topbar, aktywne linki, ścieżka strony i mobilne menu z obsługą fokusu.
- Stany ładowania, braku treści i błędu; globalne toasty z akcją i kontrolowanym czasem wyświetlania.
- Granice błędów całej aplikacji i zawartości strony, ponowienie i odzyskanie nawigacji.
- Dokumentacja użycia, screenshoty, testy zachowania, klawiatury i dostępności.

Komponenty przeznaczone dla przyszłych zapytań i operacji zapisu sprawdzano w odizolowanych podglądach. Nie dodano fikcyjnych klientów, statystyk ani API. Backend i logowanie pozostają zakresem następnych etapów.

## Poprawka znaleziona podczas weryfikacji

Na niskim ekranie rozwinięte trzy toasty mogły wychodzić ponad górną krawędź. Przy wysokości do 600 px widoczna jest teraz jedna karta; starsze powiadomienia pozostają w kolejce. Karty mają ograniczoną wysokość i przewijanie długiej treści, dzięki czemu przycisk akcji jest dostępny także przy 320 × 256 px.

Dodano dwa scenariusze Playwright uruchamiane na desktopie i telefonie: zmiana wysokości, zachowanie kolejki i fokusu, zamknięcie wszystkich powiadomień oraz przewinięcie długiego komunikatu do akcji. Fixture uruchamia własny serwer tylko na czas testu; nie jest trasą produkcyjną. Publiczna roadmapa wskazuje teraz ETAP 2 jako gotowy do odbioru, bez rozpoczynania ETAPU 3.

## Wyniki kontroli

| Kontrola                 | Wynik                                                                 |
| ------------------------ | --------------------------------------------------------------------- |
| Node                     | 24.19.0, zgodny z wymaganiami projektu                                |
| Odtworzenie zależności   | `npm ci` i build w osobnej kopii źródeł — kod 0                       |
| `npm run check`          | Lint, formatowanie, typy, 27 testów React i build — kod 0             |
| `npm run test:e2e`       | 80 scenariuszy, desktop i telefon — kod 0                             |
| Widoki produkcyjne       | 35 kombinacji: 5 adresów × 7 rozmiarów i motywów                      |
| Axe w widokach           | 0 naruszeń sprawdzanych reguł WCAG A/AA, także w otwartym menu        |
| Kontrast tokenów         | 26 par kolorów — wszystkie powyżej właściwego progu                   |
| Osobne podglądy          | Kontrolki 4, dialog/panele 20, tabela 6, stany 15, toasty 5, błędy 10 |
| Niskie ekrany z toastami | 640 × 360 i 320 × 256 px — kolejka w granicach ekranu                 |

Pełny przebieg 80 scenariuszy E2E zakończył się poprawnie w 45,1 s.

W aktualnym katalogu Windows zablokował usunięcie natywnych plików podczas próby `npm ci`. Zależności odtworzono, a czystą instalację i build sprawdzono w osobnym katalogu z tym samym lockfile. Nie zatrzymywano procesów użytkownika. Wersje zależności i lockfile pozostały bez zmian.

Sprawdzono `/`, `/app`, `/app/projects`, `/app/unknown` i `/unknown`. Szerokości obejmowały 1440, 768, 640, 390 i 320 CSS px, a wysokości także 512 i 256 px. Kontrola 640 × 512 i 320 × 256 px odpowiada badaniu reflow dla widoku 1280 × 1024 przy powiększeniu 200% i 400%; nie jest deklaracją testu wszystkich zachowań natywnego zoomu przeglądarki. [W3C — reflow](https://www.w3.org/WAI/WCAG22/Understanding/reflow.html).

Najniższy wynik w zmierzonych parach tekstu wyniósł około 4,59:1 przy progu 4,5:1. Sprawdzono też obrysy pól i fokus przy progu 3:1. To pomiar wskazanych par tokenów, a nie pełny audyt wszystkich możliwych kompozycji. [W3C — kontrast tekstu](https://www.w3.org/WAI/WCAG22/Understanding/contrast-minimum.html).

Klawiatura: skip link, widoczny fokus, menu i jego granice, Escape, przywracanie fokusu, linki na niskim ekranie, przewijanie tabeli oraz toasty. Sprawdzono także motywy, ograniczenie ruchu, nawigację, historię, bezpośrednie adresy, 404 i odzyskiwanie po błędzie. Kontrole automatyczne i wizualne nie zastępują pełnego audytu z czytnikiem ekranu.

## Zmiany gałęzi weryfikacyjnej

- `src/components/ui/sonner.tsx` i `src/styles/toasts.css`: dostosowanie kolejki i wysokości kart.
- `e2e/toasts.spec.ts`: regresje krótkiego ekranu i długiej treści, z własnym fixture.
- Komponent roadmapy i jego test: stan gotowości do odbioru.
- README, ROADMAP, CHANGELOG, dokumentacja bieżących kontroli i screenshoty: aktualny zakres oraz wyniki.

## Podgląd

![Układ aplikacji](screenshots/app-shell-desktop.png)

[Roadmapa po weryfikacji](screenshots/stage-2-roadmap.png) · [Toasty na niskim ekranie](screenshots/toasts-short-screen.png)

## Jak powtórzyć kontrole

```powershell
npm run check
npm run test:e2e
```

Tylko regresje toastów:

```powershell
npm run test:e2e -- e2e/toasts.spec.ts
```

## Następny krok

Użytkownik zapisuje i publikuje zmiany gałęzi weryfikacyjnej. Następnie można przygotować przegląd i scalenie całego ETAPU 2 do `main`. Rozpoczęcie ETAPU 3 wymaga osobnej decyzji, uzgodnienia środowisk Supabase i nowej gałęzi. Nie wprowadzono jeszcze konfiguracji, migracji ani połączenia z bazą.
