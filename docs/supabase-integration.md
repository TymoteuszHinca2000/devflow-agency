# Integracja Supabase — ETAP 3

Projekt `devflow-agency-dev` jest środowiskiem developerskim. Dwie migracje zastosowano 2026-10-21 przez połączoną integrację Supabase. Zdalny PostgreSQL 17.11 ma 15 tabel aplikacji z RLS oraz prywatne zasobniki `agency-files` i `avatars`. To nie jest wdrożenie aplikacji produkcyjnej. [Raport etapu](stage-3-report.md).

## Publiczna konfiguracja i klient

Skopiuj `.env.example` do nieistniejącego jeszcze `.env.local`, uzupełnij URL i **publishable key** ze swojego projektu, a potem uruchom Vite ponownie:

```powershell
if (-not (Test-Path .env.local)) { Copy-Item .env.example .env.local }
npm run dev
```

`readSupabaseConfiguration` w `src/lib/supabase/config.ts` przyjmuje dane jako `unknown`. Wymaga HTTPS, dopuszcza HTTP tylko dla loopback, odrzuca dane logowania w URL, ścieżkę, parametry i fragment. Akceptuje klucz `sb_publishable_`; nie akceptuje starych JWT ani kluczy sekretnego dostępu. Komunikaty błędów wskazują nazwę zmiennej bez wypisywania wartości. Kontrola formatu nie zastępuje sprawdzenia projektu przez jego API.

`getSupabase()` w `src/lib/supabase/client.ts` tworzy jedną instancję `SupabaseClient<Database>` dopiero przy pierwszym użyciu. Import modułu bez konfiguracji nie zatrzymuje strony powitalnej. Po nieudanej walidacji można ponowić inicjalizację. Komponenty UI nie powinny wykonywać zapytań; serwisy modułu Auth korzystają już z klienta, a przyszłe moduły dodadzą własne operacje.

Klient używa PKCE. Automatyczne przechwytywanie sesji z URL pozostaje wyłączone: `/auth/confirm` jawnie wymienia kod po kliknięciu użytkownika, a provider potwierdza tożsamość przez `getUser`. Callback usuwa kod i szczegóły błędów z adresu, obsługuje brak weryfikatora oraz odmawia cichego zastąpienia już zalogowanego konta. Pozostałe ustawienia sesji zachowują domyślne zachowanie SDK. Google OAuth odłożono; potwierdzanie e-maila pozostaje wymagane. [Sesje](authentication.md) · [Rejestracja, adresy powrotu i poczta](registration.md).

Wszystkie `VITE_*` są publiczne. Nigdy nie wpisuj do nich hasła PostgreSQL, tokenu konta Supabase, `service_role` ani `sb_secret_`. RLS i granty egzekwują rzeczywisty dostęp użytkownika.

## Generowane typy bez Dockera

```powershell
npm run db:types
npm run db:types:check
```

Pierwsza komenda odtwarza wszystkie migracje w izolowanym PostgreSQL PGlite, introspektuje schemat oficjalnym `@supabase/typegen` 0.2.2 i zapisuje `src/types/database.types.ts`. Nie używa sieci, kluczy, `.env.local` ani rekordów biznesowych fixture. Minimalny kontrakt Auth/Storage jest tym samym kontraktem SQL co w testach migracji. Generator jest zależnością developerską z przypiętą wersją; jego API ma status alpha.

Druga komenda porównuje wynik bajt po bajcie, po normalizacji końców linii. Weryfikuje także SHA-256 treści i nazw migracji. Jest częścią `npm run check`, więc zmiana schematu wymaga regeneracji typów. Nie edytuj wygenerowanego pliku ręcznie. Artefakt generatora jest wyłączony z ESLint: oficjalny helper pustych typów złożonych tworzy redundantną unię `never`. TypeScript nadal sprawdza cały plik, a kontrola generatora wykrywa ręczne zmiany.

Typy obejmują `Row`, `Insert`, `Update`, relacje i enumy. **Nie opisują uprawnień danej roli**: np. pole obecne w `Update` może być chronione grantem kolumny lub RLS. Kwoty nadal wymagają reguł obliczeń serwerowych w etapach modułów.

Przy weryfikacji wygenerowano również typy z projektu zdalnego i porównano schemat SQL: wszystkie 165 kolumn, 134 ograniczenia oraz 27 wartości enumów zgadzały się z lokalnym odtworzeniem migracji. Generator usługi zdalnej ma inny szablon niż przypięty generator lokalny; kontrola zgodności porównuje strukturę bazy, a nie format tych dwóch szablonów.

## Migracje i CLI

Repozytorium ma Supabase CLI 2.121.0 jako zależność developerską:

```powershell
npm run supabase -- --version
npm run supabase -- login
npm run supabase -- link --project-ref TWOJ_PROJECT_REF
npm run supabase -- migration list
npm run supabase -- db push --dry-run
```

Login i linkowanie wykonuj we własnym terminalu. Nie umieszczaj sekretów w argumentach ani w repozytorium. Zmienne administracyjne nie mają prefiksu `VITE_`.

Historia migracji zdalnych została uzgodniona z nazwami plików w repozytorium:

| Wersja           | Nazwa                             |
| ---------------- | --------------------------------- |
| `20261021000100` | `create_agency_schema`            |
| `20261021000200` | `add_access_policies_and_storage` |

Integracja nadała początkowo bieżące znaczniki czasu; po poprawnym wykonaniu dostosowano wyłącznie wersje w historii do istniejących plików. Nie uruchamiaj ponownie zastosowanych migracji w SQL Editor. Nowe zmiany schematu wymagają kolejnego pliku migracji. Seed pozostaje wyłączony i nie został wykonany na projekcie zdalnym.

## Kontrole rzeczywistych usług

```powershell
npm run supabase:verify
```

To jawny test sieciowy z konfiguracją `.env.local`, poza zestawem offline. Sprawdza odpowiedź Auth i odrzucenie anonimowych odczytów wszystkich 15 tabel. Niczego nie zapisuje, nie tworzy kont i nie wypisuje kluczy ani treści odpowiedzi.

`scripts/verify-supabase-integration.mjs` wykonuje dodatkowe 20 kontroli Auth, JWT, Data API, RLS i fizycznych plików. Nie jest przeznaczony do przypadkowego uruchomienia na produkcji. Przygotowanie i sprzątanie odbywa się przez administracyjne połączenie SQL; sam runner korzysta wyłącznie z publicznego klucza oraz trzech izolowanych kont testowych.

1. Na świadomie wybranym projekcie developerskim uruchom transakcję, ustaw `devflow.environment=development` i wykonaj `supabase/tests/live/setup.sql`. Wynik `fixture` zawiera tymczasowe hasło; nie zapisuj go w logach ani dokumentacji. Fixture tworzy konta i tożsamości bezpośrednio w Auth, bez wysyłania maili i bez zmiany ustawień dostawcy. Nie jest to implementacja rejestracji użytkownika.
2. Przekaż obiekt `fixture` jako pojedynczy wiersz JSON na stdin runnera. Nie wpisuj hasła w argumentach polecenia. Runner loguje tylko nazwy sprawdzonych zachowań, usuwa własne pliki przez Storage API i wylogowuje konta.
3. Po zatwierdzeniu usunięcia danych ustaw w jednej transakcji `devflow.environment=development` oraz `devflow.live_fixture` na zachowany obiekt i wykonaj `supabase/tests/live/cleanup.sql`. Skrypt weryfikuje identyfikatory, oznaczenia i domenę testową oraz odmawia sprzątania, jeśli pliki fizyczne nadal istnieją. Nie usuwaj plików przez SQL na `storage.objects`.

Po przebiegu zamykającym ETAP 3 użytkownik zdecydował zachować konta i rekordy testowe. Plików fizycznych już nie ma; aplikacja nie przedstawia tych fixture jako rzeczywistych danych biznesowych. [Dokładny stan i ograniczenia](stage-3-report.md).

## Źródła

- [Supabase: klient TypeScript i typowanie](https://supabase.com/docs/reference/javascript/typescript-support).
- [Supabase: generowanie typów](https://supabase.com/docs/guides/api/rest/generating-types).
- [Supabase: klucze API](https://supabase.com/docs/guides/getting-started/api-keys).
- [Oficjalny generator Supabase](https://www.npmjs.com/package/@supabase/typegen).
