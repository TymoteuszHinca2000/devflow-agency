# RLS i prywatny Storage — ETAP 3

Migracja `20261021000200_add_access_policies_and_storage.sql` rozszerza schemat z pierwszego commita `0503a24`. Nadaje wybrane uprawnienia tabel i kolumn, wprowadza polityki ról oraz dwa prywatne zasobniki. Wdrożono ją do projektu developerskiego i sprawdzono lokalnymi testami SQL oraz rzeczywistymi usługami Auth, Data API i Storage. [Raport integracji](stage-3-report.md).

## Macierz dostępu

Każde konto przeglądarkowe używa roli PostgreSQL `authenticated`; rola agencji pochodzi z aktywnego wiersza `organization_members`, nie z edytowalnych metadanych konta. `anon` nie otrzymuje dostępu do tabel aplikacji. Konto bez członkostwa może zarządzać własnym profilem i awatarem przed założeniem organizacji.

| Obszar                  | Właściciel / administrator                                                       | Pracownik                                                           | Klient                                |
| ----------------------- | -------------------------------------------------------------------------------- | ------------------------------------------------------------------- | ------------------------------------- |
| Profil                  | Własna edycja; odczyt profili aktywnych członków swojej agencji                  | Tak samo                                                            | Własny profil                         |
| Organizacja             | Odczyt; edycja nazwy, sluga, waluty i strefy                                     | Odczyt własnej organizacji                                          | Odczyt własnej organizacji            |
| Członkostwa organizacji | Odczyt zespołu; zapis przez serwer                                               | Odczyt zespołu; bez zapisu                                          | Odczyt własnego członkostwa           |
| Klienci                 | Tworzenie, edycja, archiwizacja i usuwanie z kontrolą zależności                 | Odczyt klientów przypisanych projektów                              | Brak                                  |
| Projekty                | Tworzenie, odczyt, edycja i usuwanie z kontrolą zależności                       | Odczyt aktywnie przypisanych projektów                              | Brak                                  |
| Członkostwa projektu    | Odczyt; zapis przez serwer                                                       | Odczyt zespołu przypisanego projektu                                | Brak                                  |
| Zadania                 | Zarządzanie w agencji                                                            | Tworzenie i edycja w przypisanym projekcie; usuwanie własnych zadań | Brak                                  |
| Komentarze              | Odczyt i moderacja w agencji                                                     | Odczyt projektu; tworzenie oraz edycja/usuwanie własnych            | Brak                                  |
| Czas pracy              | Odczyt i korekta czasu zespołu; własne wpisy przy aktywnym członkostwie projektu | Własny czas przypisanych projektów                                  | Brak                                  |
| Wyceny i pozycje        | Odczyt; bezpośrednia edycja tylko szkiców                                        | Brak                                                                | Brak                                  |
| Załączniki              | Odczyt, rejestracja i edycja metadanych w agencji                                | Odczyt przypisanego projektu; rejestracja i nazwa własnego pliku    | Brak                                  |
| Powiadomienia           | Własny odczyt i znacznik przeczytania                                            | Własny odczyt i znacznik przeczytania                               | Własny odczyt i znacznik przeczytania |
| Historia aktywności     | Odczyt agencji; zapis przez serwer                                               | Brak                                                                | Brak                                  |
| Zaproszenia             | Obsługa przez serwer; bez bezpośredniego odczytu tabeli z tokenami               | Brak                                                                | Brak                                  |

Ograniczenia kluczy obcych nadal blokują usuwanie danych z zależnościami. Widok klienta i flagi `is_internal` / `is_client_visible` nie otwierają automatycznie dostępu do modułów. Portal klienta otrzyma osobny zakres i testy w ETAPIE 12. Także sztucznie dodane członkostwo projektu nie daje obecnie klientowi dostępu do zadań i plików.

## Granty, role i chronione pola

RLS ogranicza wiersze, a granty kolumn ograniczają edytowalne pola. Roli `authenticated` nie przyznano globalnego `INSERT` ani `UPDATE` na tabelach aplikacji. Przykładowo użytkownik może zmienić treść własnego komentarza, ale nie autora, zadanie ani widoczność. Może zmienić zadanie w swoim projekcie, ale nie jego organizację, projekt, autora ani identyfikator.

Powiadomienia pozwalają wyłącznie aktualizować własne `read_at`. Stawki czasu pracy, role, członkostwa, zaproszenia, zdarzenia audytu, archiwizacja całej organizacji i akceptacja wycen pozostają serwerowe. Wycena po wysłaniu nie ma bezpośredniej ścieżki edycji z przeglądarki. Serwerowe operacje cyklu życia i ich współbieżność zostaną wdrożone w odpowiednich modułach.

Użytkownik nie otrzymuje `TRUNCATE`, `REFERENCES`, `TRIGGER` ani uprawnień do wyłączenia RLS. Funkcje polityk są w nieudostępnianym przez Data API schemacie `private`, z `security definer`, pełnymi nazwami obiektów i przypiętym `search_path = ''`. Wykonanie przyznano wyłącznie wybranym funkcjom odczytującym uprawnienia. Funkcje triggerów nie są udostępniane do bezpośredniego wywołania.

Sprawdzanie członkostw w tych funkcjach zapobiega rekursji RLS między tabelami. Uprawnienia są odczytywane z bazy przy zapytaniach; zawieszenie konta lub zmiana roli nie zależą od odświeżenia metadanych JWT. `service_role` jest zaufaną rolą serwerową omijającą RLS, dlatego jej sekret nigdy nie może znaleźć się w kodzie React ani w `VITE_*`.

`project_members.status` umożliwia zawieszenie dostępu bez usuwania wierszy, do których odnoszą się historyczne zadania i czas pracy. Zawieszenie projektu blokuje zwykłemu pracownikowi dostęp do zadań i plików. Trigger odrzuca nowe przypisanie zadania osobie zawieszonej, klientowi albo osobie spoza projektu. Przyszła serwerowa obsługa odebrania dostępu musi także rozwiązać stan uruchomionego timera; bezpośrednie zmiany członkostw z przeglądarki są zabronione.

## Pliki agencji

Bucket `agency-files` jest prywatny i ma limit 20 MiB. Dopuszczone typy to PDF, JPEG, PNG, WebP, tekst, ZIP, DOCX i XLSX. Typ i limit definiuje bucket; rzeczywiste zachowanie uploadu będzie sprawdzone przez API Supabase przy integracji.

1. Zalogowany pracownik rejestruje metadane w dostępnym projekcie; dla wyceny robi to właściciel lub administrator.
2. Baza generuje ścieżkę `organization_id/attachment_id`. Nie zawiera ona nazwy przekazanej przez użytkownika.
3. Nowy upload wymaga dokładnie tej ścieżki, zgodnego `owner_id` obiektu i `uploaded_by` metadanych oraz bieżącego dostępu do projektu/wyceny.
4. Odczyt wymaga bieżącego dostępu do metadanych i ich zakresu. Znajomość UUID ani publicznego klucza projektu nie wystarcza.
5. Usunięcie pliku jest dostępne dla jego autora przy zachowanym dostępie oraz dla administratorów agencji. Przeglądarka nie usuwa metadanych — ich sprzątanie należy do przyszłej operacji serwerowej przez Storage API.

Nie ma polityki `UPDATE` obiektów w naszych bucketach. Nadpisanie, `upsert`, zmiana właściciela, przeniesienie i zmiana ścieżki istniejącego obiektu są zablokowane. Nowa wersja pliku powinna otrzymać nowy identyfikator, a usuwanie starych danych powinno uwzględnić wynik Storage API.

Pracownik nie nadaje flagi udostępnienia klientowi. Metadane rozmiaru i MIME nie potwierdzają zawartości fizycznego pliku; serwer i Storage API muszą zweryfikować rzeczywisty upload. Polityki stanowią bazę dla modułu załączników w ETAPIE 8, a nie gotowy interfejs przesyłania plików.

## Awatary

Bucket `avatars` jest prywatny, do 2 MiB, z typami JPEG, PNG i WebP. Właściciel zapisuje plik pod ścieżką `user_id/object_uuid.png` (lub `.jpg`, `.jpeg`, `.webp`). Ścieżka musi należeć do użytkownika i mieć prawidłową strukturę; SVG i dodatkowe segmenty są odrzucane.

Właściciel może czytać i usuwać własne pliki. Aktywni pracownicy tej samej agencji mogą odczytać tylko awatar wskazany obecnie w profilu kolegi. Klient widzi wyłącznie własny awatar. Administrator agencji nie może usuwać cudzych awatarów.

Zmiana zdjęcia będzie polegała na uploadzie pod nową ścieżką, aktualizacji własnego profilu i usunięciu poprzedniego pliku. Nie wymaga nadpisywania obiektu. Interfejs profilu i rzeczywisty upload są zakresem kolejnego etapu uwierzytelniania.

## Ochrona przy innych politykach Storage

Polityki restrykcyjne dodatkowo pilnują obu naszych bucketów. Dodanie przez inną funkcję szerokiej polityki Storage nie otworzy naszych obiektów ani nadpisywania. Osobne restrykcje tabeli bucketów blokują zmianę ich ustawień na publiczne, usunięcie i podmianę identyfikatora przez role przeglądarkowe. Zasoby innych bucketów zachowują własne reguły.

Migracja nie przebudowuje tabel `storage` zarządzanych przez Supabase. Dodaje wyłącznie rekordy bucketów i polityki. Ustawienia zasobników i ograniczenia aplikacji nie ograniczają zaufanej obsługi administracyjnej przez `service_role`.

## Weryfikacja

```powershell
npm run test:db
npm run check
```

Łącznie 100 testów SQL: 38 testów bazowego modelu/seed oraz 62 testy pełnej migracji ról, Storage i zgodności seed z całym łańcuchem. Te drugie sprawdzają osiem kontekstów kont, anonimowy dostęp i brak tożsamości, poprawne CRUD, odrzucenie obcych organizacji i projektów, chronione pola, zmianę ról, zawieszenie, pliki, awatary i odporność na niepowiązane szerokie polityki.

Testy obejmują `INSERT ... RETURNING`, ponieważ nowo tworzony wiersz musi przejść politykę odczytu jeszcze przed widocznością dla osobnego zapytania funkcji pomocniczej. Polityki projektów i załączników oceniają wtedy bezpośrednio dozwolony zakres nowego wiersza.

PGlite uruchamia rzeczywisty PostgreSQL 18.6. Auth i Storage mają minimalne fixture kontraktu SQL; testy offline ustawiają kontekst użytkownika i nie weryfikują kryptograficznie JWT. Integracja na zdalnym PostgreSQL 17.11 dodatkowo potwierdziła logowanie i walidację sesji, izolację dwóch organizacji, granty chronionych pól oraz upload/download/delete fizycznych plików i awatarów. [Pełny zakres i zachowane fixture](stage-3-report.md). Nie sprawdzono jeszcze współbieżnych sesji drzewa zadań ani przyszłych serwerowych workflow modułów; te kontrole nie oznaczają pełnego audytu bezpieczeństwa.

## Źródła

- [Supabase — RLS i funkcje prywatne](https://supabase.com/docs/guides/database/postgres/row-level-security).
- [Supabase — granty kolumn](https://supabase.com/docs/guides/database/postgres/column-level-security).
- [Supabase — polityki Storage](https://supabase.com/docs/guides/storage/security/access-control).
- [Supabase — właściciel obiektu `owner_id`](https://supabase.com/docs/guides/storage/security/ownership).
