# Raport ETAPU 4 — uwierzytelnianie i konto

## Stan

Zakres kodu jest przygotowany na `feat/account-management`. Użytkownik utworzył uzgodnione dwie gałęzie i wypchnął dwa pierwsze commity:

| Gałąź                     | Commit                  | Zakres                                       |
| ------------------------- | ----------------------- | -------------------------------------------- |
| `feat/authentication`     | `a42bb25`               | Logowanie, sesje, wylogowanie i ochrona tras |
| `feat/authentication`     | `1d2942e`               | Rejestracja i potwierdzenie e-maila          |
| `feat/account-management` | Oczekuje na użytkownika | Odzyskiwanie, zmiana hasła, profil i awatar  |

Obecna gałąź zawiera dwa wcześniejsze commity i może posłużyć do jednego PR całego etapu do `main`. Nie wykonano trzeciego commita, push ani scalenia. Google OAuth został odłożony decyzją użytkownika. ETAP 5 nie został rozpoczęty.

## Rezultat

Działają formularze e-mail/hasło, bezpieczne przekierowania, weryfikowane sesje i ich odświeżanie, rejestracja, ponowna wysyłka potwierdzenia, callback signup oraz osobny callback recovery PKCE. Zmiana hasła w koncie sprawdza obecne hasło; reset z wiadomości wymaga poprawnego przepływu recovery i weryfikacji użytkownika. Aplikacja próbuje wylogować inne sesje i oddzielnie raportuje niepowodzenie tej operacji od sukcesu zapisu hasła.

Chronione `/app/account` udostępnia trwały profil i prywatny awatar. Obrazy przechodzą walidację i ponowne kodowanie; upload nie nadpisuje plików. Konflikt edycji w dwóch kartach nie nadpisuje nowszego profilu. Pobranie, zapis i usunięcie korzystają z istniejących grantów oraz RLS. Nie zmieniono migracji ani zależności.

Kod usług, formularzy, walidacji i stron pozostaje w `src/features/auth/`. Layout przyjmuje kontrolki konta przez slot. Formularze i zawartość konta są ładowane osobno. Hasła i kody nie są logowane ani przechowywane we własnym storage.

## Weryfikacja automatyczna

| Kontrola                                         | Wynik                                                                                  |
| ------------------------------------------------ | -------------------------------------------------------------------------------------- |
| ESLint, Prettier, TypeScript i produkcyjny build | PASS, `npm run check`, kod zakończenia 0                                               |
| Vitest                                           | 143/143, 25 plików, kod zakończenia 0                                                  |
| PostgreSQL/PGlite                                | 100/100; typy zgodne z migracjami, kod zakończenia 0                                   |
| Playwright                                       | 144/144 na desktopie i telefonie, kod zakończenia 0                                    |
| Odczyt developerskiego Supabase                  | 16/16 kontroli Auth i anonimowej odmowy odczytu, kod 0; bez zapisów                    |
| Wizualna kontrola                                | 9 zrzutów nowych ekranów, 320–1440 px, brak błędów wykonania i poziomego przepełnienia |

E2E używa prawdziwego SDK z fikcyjną konfiguracją i izolowanymi odpowiedziami HTTP. Porównuje wyzwanie PKCE z weryfikatorem, sprawdza jednokrotne użycie kodu, walidację i zmianę haseł, profil, dekodowanie i upload obrazu, prywatny podgląd, usuwanie oraz błędy sieci i konflikt zapisu. Nie wysyła maili i nie tworzy zdalnych kont. Osobny test Vite/StrictMode z dwiema kartami, ręcznym odświeżeniem i wymuszonym przeładowaniem Vite zakończył zmianę hasła poprawnie, bez nowych wiadomości. Audyty axe obejmują wybrane reguły WCAG A/AA, oba motywy i mały ekran; nie zastępują pełnego audytu dostępności.

## Rzeczywiste usługi i próby użytkownika

- Potwierdzone wcześniej: założenie konta, otrzymanie wiadomości, akceptacja adresu i logowanie hasłem.
- Potwierdzona konfiguracja: Site URL i dwa wzorce `/auth/confirm**`, a w tej części także dwa wzorce `/auth/recovery**` dla `127.0.0.1` i `localhost` na porcie 5173.
- Potwierdzone przez użytkownika: rzeczywisty zapis nazwy, upload/podgląd po odświeżeniu i usunięcie awatara.
- Rzeczywista próba recovery: wiadomość i wymiana PKCE przyjęte przez Auth; interfejs utracił formularz w czasie przeładowań Vite i formatowania plików. Dodano wznowienie na podstawie zweryfikowanej sesji. Użytkownik potwierdził następnie powrót pól po odświeżeniu, zapis nowego hasła i poprawne logowanie nim.
- Oczekuje na powtórzenie: otwarcie sesji bezpośrednio z nowej rzeczywistej wiadomości signup po poprawkach callbacku. Wcześniejszą próbę i poprawki opisuje [dokument rejestracji](registration.md).

Zakres trzeciego commita jest gotowy. Etap pozostaje w końcowej weryfikacji do publikacji zmian i decyzji użytkownika; brak powtórnej rzeczywistej próby sesji signup jest jawnie zachowany. Zmiana hasła z podaniem obecnego hasła przeszła testy izolowane; jej osobnej próby ręcznej nie deklarujemy. Nie usuwano wcześniej zachowanych kont i agencji testowych ETAPU 3.

## Ograniczenia

Domyślna poczta developerska Supabase ma limit i ograniczony zakres odbiorców. Publiczna rejestracja dla dowolnych adresów wymaga własnego SMTP. Recovery wymaga przeglądarki i originu rozpoczęcia przepływu; formularz można wznowić po przeładowaniu przez maksymalnie 30 minut na podstawie zweryfikowanej sesji recovery. Po wygaśnięciu trzeba poprosić o nową wiadomość. Już wydane JWT innych sesji mogą pozostać ważne do ich terminu wygaśnięcia mimo żądania wylogowania. Zmiany hasła nie są wykonywane przez SQL ani sekret administracyjny.

Awatar i profil są zapisywane w dwóch usługach, bez wspólnej transakcji. Przy niejednoznacznym błędzie sieci lub nieudanym usunięciu może pozostać nieużywany prywatny plik. Interfejs proponuje odświeżenie danych albo zgłasza częściowy sukces; automatyczne sprzątanie serwerowe nie jest częścią etapu. [Szczegóły zapisu](account-management.md).

Doradca bezpieczeństwa nadal zgłasza wyłączoną [ochronę przed ujawnionymi hasłami](https://supabase.com/docs/guides/auth/password-security#password-strength-and-leaked-password-protection) oraz informacyjny [brak polityk tabeli zaproszeń](https://supabase.com/docs/guides/database/database-linter?lint=0008_rls_enabled_no_policy). Zaproszenia są celowo niedostępne dla przeglądarki i zostaną obsłużone serwerowo w ETAPIE 5. Nie pojawiła się nowa klasa ostrzeżeń w tym zakresie.

## Następny krok

Zapisać i wypchnąć trzeci commit, a po potwierdzeniu użytkownika przygotować jeden PR do `main`. Po przekazaniu komend Git agent zatrzymuje edycję. Rozpoczęcie ETAPU 5 wymaga osobnej decyzji.

[Profil i recovery](account-management.md) · [Rejestracja](registration.md) · [Sesje](authentication.md)
