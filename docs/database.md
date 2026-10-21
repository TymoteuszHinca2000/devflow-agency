# Baza danych — fundament ETAPU 3

Pierwsza część ETAPU 3 definiuje pełny relacyjny model w wersjonowanej migracji. Plik tworzy 15 tabel, ograniczenia, indeksy, znaczniki czasu i bezpieczny punkt wyjścia RLS. Nie został jeszcze zastosowany do zdalnego projektu. Klient React, szczegółowe polityki ról i prywatny Storage należą do kolejnych dwóch commitów tego etapu.

## Tabele i odpowiedzialności

| Tabela                     | Odpowiedzialność                                                                    |
| -------------------------- | ----------------------------------------------------------------------------------- |
| `profiles`                 | Dane profilu powiązane z `auth.users`, bez hasła i kopii e-maila                    |
| `organizations`            | Agencja, unikalny slug, waluta i strefa czasowa                                     |
| `organization_members`     | Użytkownik, organizacja, rola, aktywność i opcjonalne powiązanie z klientem         |
| `organization_invitations` | Serwerowe zaproszenie, adres e-mail, skrót tokenu, wygaśnięcie i stan wykorzystania |
| `clients`                  | Dane kontaktowe i firmowe oraz archiwizacja                                         |
| `projects`                 | Klient, status, budżet, waluta, terminy i archiwizacja                              |
| `project_members`          | Członkowie zespołu projektu należący do tej samej organizacji                       |
| `tasks`                    | Projekt, podzadania, status, priorytet, kolejność i przypisanie                     |
| `task_comments`            | Treść, autor i domyślna widoczność wewnętrzna                                       |
| `time_entries`             | Użytkownik projektu, zadanie, przedział czasu, stawka i waluta                      |
| `quotes`                   | Klient, opcjonalny projekt, numer, status, waluta i terminy                         |
| `quote_items`              | Ilość, cena, kolejność i wyliczana w bazie wartość pozycji                          |
| `attachments`              | Metadane pliku projektu, zadania albo wyceny; bez danych binarnych                  |
| `notifications`            | Odbiorca w organizacji, treść i moment odczytania                                   |
| `activity_logs`            | Zdarzenia tworzone przez zaufany kod serwerowy                                      |

```mermaid
erDiagram
  profiles ||--o{ organization_members : belongs_to
  organizations ||--o{ organization_members : has
  organizations ||--o{ organization_invitations : invites
  organizations ||--o{ clients : owns
  clients o|--o{ projects : commissions
  projects ||--o{ project_members : assigns
  organization_members ||--o{ project_members : joins
  projects ||--o{ tasks : contains
  tasks o|--o{ tasks : parent_of
  tasks ||--o{ task_comments : contains
  projects ||--o{ time_entries : tracks
  tasks o|--o{ time_entries : categorizes
  clients ||--o{ quotes : receives
  projects o|--o{ quotes : scopes
  quotes ||--o{ quote_items : contains
  projects o|--o{ attachments : attaches
  quotes o|--o{ attachments : attaches
  organization_members ||--o{ notifications : receives
  organizations ||--o{ activity_logs : records
```

Diagram pokazuje główne relacje. Migracja zawiera również autorów, indeksy i złożone klucze obce ograniczające powiązania do jednej organizacji. Każdy załącznik ma dokładnie jeden główny zakres: projekt albo wycenę; plik projektu może dodatkowo wskazać jego zadanie.

## Integralność i dostęp

- Identyfikatory to UUID, a `created_at` i `updated_at` to wymagane `timestamptz` z domyślną wartością. Aktualizacja wiersza ustawia rzeczywisty czas modyfikacji; tożsamość, organizacja i czas utworzenia pozostają niezmienne.
- Klucze obce obejmują `organization_id`, a tam, gdzie potrzeba, również projekt albo klienta. Baza odrzuca np. projekt klienta innej agencji, przypisanie zadania osobie spoza projektu, komentarz do obcego zadania i wycenę klienta innego niż klient projektu.
- Indeksy pokrywają początki wszystkich kluczy obcych. Dodatkowe indeksy obsługują aktywnych klientów i projekty, Kanban, raporty czasu, nieodczytane powiadomienia i historię encji.
- Usuwanie danych z zależnościami jest ograniczone przez `RESTRICT`. Archiwizacja i zawieszenie członkostwa zachowują historię. Usuwanie konta z historią biznesową wymaga przyszłej procedury przeniesienia lub anonimizacji, a nie automatycznego kasowania agencji.
- RLS jest włączone na wszystkich tabelach. Cofnięto uprawnienia `PUBLIC`, `anon` i `authenticated`. Pierwszy commit celowo nie dodaje polityk zezwalających; role przeglądarkowe nie mogą jeszcze czytać ani zapisywać danych. Polityki członków i Storage powstaną w drugim commicie.
- `service_role` otrzymuje jawne uprawnienia DML. Jego sekret jest przeznaczony wyłącznie dla zaufanego kodu serwerowego; nie należy do zmiennych `VITE_*`.
- Nowe konto Supabase Auth otrzymuje profil przez trigger; istniejące konta mają backfill. Metadane użytkownika służą wyłącznie do ograniczonej długością nazwy, nigdy do przypisywania roli ani organizacji.
- Funkcje triggerów są w schemacie `private`, mają przypięty pusty `search_path` i cofnięte publiczne uprawnienie wykonania. `private` nie należy do schematów udostępnianych przez Data API.

Role modelu to `owner`, `admin`, `member` i `client`; członkostwo może być aktywne lub zawieszone. Rola klienta wymaga klienta tej samej agencji, pozostałe role go nie przyjmują. Implementacja tworzenia organizacji, zaproszeń, przyjmowania członków i ochrony ostatniego właściciela należy do ETAPU 5. W pierwszym commicie żadna rola nie otrzymuje tych operacji z przeglądarki.

## Reguły modułów przygotowane w schemacie

Podzadanie musi należeć do projektu rodzica i nie może utworzyć cyklu. Zmiany drzewa używają blokady transakcyjnej projektu. Testy PGlite sprawdzają cykle w pojedynczym połączeniu; testy wielu jednoczesnych połączeń wymagają pełnego PostgreSQL.

Jeden użytkownik może mieć jeden uruchomiony timer także przy członkostwie w wielu agencjach. Zakończony przedział wymaga końca późniejszego od początku. Walidacja nakładających się zakończonych wpisów, reguły start/stop i raporty należą do ETAPU 10.

Kwoty i ilości korzystają z `numeric`, a nie z liczb zmiennoprzecinkowych. Pozycja wyceny oblicza `round(quantity * unit_price, 2)` jako kolumnę generowaną. Nie przyjmuje ręcznego nadpisania sumy. Uzgodnienie podatków, sum wyceny, numeracji i przejść statusu pozostaje w ETAPIE 11. Ograniczenia odrzucają ujemne wartości, `NaN` i nieskończoność w polach pieniężnych oraz ilościowych.

Zaproszenie zapisuje wyłącznie 32-bajtowy skrót SHA-256 tokenu. Surowy token zostanie wygenerowany i wysłany przez przyszłą logikę serwerową. Kolejne zaproszenie pod ten sam adres wymaga unieważnienia poprzedniego niewykorzystanego zaproszenia, także wygasłego.

Załącznik ma rozmiar do 20 MiB i generowaną ścieżkę `organization_id/attachment_id` w przyszłym prywatnym buckecie `agency-files`. Nazwa wyświetlana nie staje się ścieżką obiektu. Sam zapis metadanych nie oznacza przesłania pliku; polityki Storage i weryfikacja uploadu będą osobnym krokiem.

## Odtwarzalne testy

```powershell
npm ci
npm run test:db
npm run check
```

`test:db` używa Node test runner i PGlite 0.5.10 (PostgreSQL 18.6 w WebAssembly). Uruchamia rzeczywiste, nieprzepisywane migracje SQL na izolowanej bazie w pamięci, tworzy dane testowe i zamyka bazę po przebiegu. Nie używa `.env.local`, sieci ani projektu użytkownika. PGlite jest tylko zależnością developerską; nie trafia do aplikacji ani nie zastępuje Supabase.

Fixture `supabase/tests/fixtures/bootstrap.sql` definiuje minimalny kontrakt testowy `auth.users`, `auth.uid()` i ról. Nie jest migracją i nie wolno wykonywać go na Supabase. Pozwala sprawdzać klucze obce, triggery, uprawnienia i RLS, ale nie testuje prawdziwego JWT, Auth HTTP, Storage HTTP, ani współbieżnych połączeń. Konfiguracja lokalnego Supabase używa PostgreSQL 17; ostateczna weryfikacja na docelowym Supabase nastąpi po przygotowaniu polityk i integracji.

Testy obejmują wszystkie tabele, poprawny zapis całego modelu, 17 odrzucanych powiązań między encjami, domyślną odmowę dostępu, niezmienność tożsamości, profile, cykle zadań, timer, obliczenia, zaproszenia, metadane załączników i seed. `npm run check` obejmuje także testy bazy. Zmiany nie dodają jeszcze interfejsu modułów ani logowania.

Pełne lokalne Supabase na Windows wymaga Supabase CLI i zgodnego środowiska kontenerów, np. Docker Desktop. Nie jest wymagane do uruchomienia obecnych testów PGlite. CLI i zastosowanie migracji do projektu developerskiego zostaną przygotowane po sprawdzeniu kolejnej migracji bezpieczeństwa.

## Opcjonalne dane developerskie

`supabase/seed.sql` jest wyłączony w `config.toml`. Nie jest uruchamiany podczas migracji ani testów aplikacji. Wymaga istniejącego profilu Auth, ustawienia `devflow.environment=development` i `devflow.seed_user_id` w tej samej sesji SQL. Nie tworzy kont, haseł ani użytkowników demonstracyjnych. Dodaje jedną agencję, klienta, projekt i zadanie oznaczone `[DEMO]`; ponowne uruchomienie odrzuca nadpisanie danych.

Przykład dla świadomie wybranego, wyłącznie developerskiego środowiska, w jednej sesji administracyjnej:

```sql
set devflow.environment = 'development';
set devflow.seed_user_id = 'UUID_ISTNIEJACEGO_PROFILU_AUTH';
-- Następnie wykonaj supabase/seed.sql w tej samej sesji.
```

Te ustawienia są zabezpieczeniem przed pomyłką, nie mechanizmem uprawnień ani rozpoznawania produkcji. Nie uruchamiaj seed na środowisku produkcyjnym. Dane fixture testów są oddzielne od tego opcjonalnego seed.

## Źródła

- [Supabase — migracje i workflow](https://supabase.com/docs/guides/local-development/database-migrations).
- [Supabase — RLS, granty i funkcje security definer](https://supabase.com/docs/guides/database/postgres/row-level-security).
- [Supabase — testowanie bazy](https://supabase.com/docs/guides/database/testing).
- [PGlite — uruchamianie PostgreSQL w pamięci](https://pglite.dev/docs/).
