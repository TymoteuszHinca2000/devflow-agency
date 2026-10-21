# Wspólne komponenty UI

Pierwsza część biblioteki obejmuje `Button`, `Card`, `Input` i `Label`. To lokalne, typowane komponenty dostosowane z oficjalnego rejestru [shadcn/ui](https://ui.shadcn.com/docs/components/radix/button), wariant `radix-nova`. Są zapisane w repozytorium i można je rozwijać zgodnie z potrzebami aplikacji.

`components.json` opisuje aliasy i integrację z Tailwind CSS 4. `src/lib/utils.ts` udostępnia `cn`, które łączy klasy i rozstrzyga konflikty klas Tailwind. Warianty przycisku są w osobnym pliku, aby plik komponentu był zgodny z regułami React Fast Refresh.

## Użycie

```tsx
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

<Label htmlFor="contact-email">Adres e-mail</Label>
<Input id="contact-email" type="email" autoComplete="email" />
<Button type="submit">Zapisz</Button>
```

`Button` domyślnie ma `type="button"`; wysłanie formularza wymaga jawnego `type="submit"`. Obsługuje warianty `default`, `outline`, `secondary`, `ghost`, `destructive` i `link` oraz rozmiary `default`, `sm`, `lg` i `icon`. Kontrolki mają co najmniej 44 px wysokości. Przycisk ikonowy wymaga dostępnej nazwy, np. `aria-label`.

Do nawigacji można użyć kompozycji z linkiem:

```tsx
<Button asChild variant="outline">
  <a href="#plan-rozwoju">Zobacz plan</a>
</Button>
```

Kompozycja przez Radix Slot zachowuje element `a`, jego adres i semantykę linku, bez zagnieżdżonego przycisku. Do zablokowanych akcji używaj natywnego `Button disabled`.

`Input` przekazuje standardowe właściwości, w tym `ref`, `required`, `disabled`, `readOnly`, `aria-invalid` i `aria-describedby`. Etykietę łącz z polem przez `htmlFor` i `id`. Przy błędzie ustaw `aria-invalid` i powiąż opis z polem przez `aria-describedby`. Komponent prezentuje stan; walidację i zapis danych zapewni właściwy formularz modułu.

`Card` udostępnia `CardHeader`, `CardTitle`, `CardDescription`, `CardContent` i `CardFooter`. Nagłówek semantyczny umieszczaj wewnątrz `CardTitle`, np. jako `h2`. Same komponenty karty są neutralnymi elementami `div`, aby można było dostosować strukturę do kontekstu.

## Integracja z motywem

`src/styles/ui.css` mapuje semantyczne klasy shadcn/ui na istniejącą paletę DevFlow, zgodnie z [modelem tokenów shadcn/ui](https://ui.shadcn.com/docs/theming). Na przykład `bg-card` używa powierzchni, `text-muted-foreground` tekstu pomocniczego, a `bg-muted` delikatnego tła. Nie zmienia to znaczenia starszej zmiennej `--muted`, która określa kolor tekstu w ekranie powitalnym.

Wariant Tailwind `dark:` rozpoznaje `data-theme="dark"`. Pola mają mocniejszy obrys niż karty; stan błędu ma osobny kolor. Bazowe resety i domyślny fokus są w warstwie `base`, aby klasy komponentów mogły je poprawnie dostosowywać.

`ActionLink` korzysta z `Button`, a karty katalogu z `Card`. Pola formularza są przygotowane do kolejnych modułów. Nie dodano formularza biznesowego ani dodatkowej strony aplikacji.

## Weryfikacja i podgląd

- Testy komponentów obejmują domyślny typ przycisku, wysyłanie formularza, akcję zablokowaną, semantykę linku, etykietę, fokus, opis błędu, przekazanie refa i pole zablokowane.
- Pełne E2E sprawdzają istniejący ekran po wykorzystaniu wspólnych przycisków i kart.
- W odizolowanym podglądzie czterech komponentów sprawdzono motywy, fokus, wysokość 44 px, font 16 px na telefonie, brak przepełnienia oraz automatyczny audyt axe. Podgląd nie jest formularzem biznesowym w aplikacji.

```powershell
npm test -- src/components/ui/primitives.test.tsx
npm run dev
```

Po uruchomieniu aplikacji sprawdź akcje „Poznaj możliwości” i „Zobacz plan” oraz katalog w obu motywach.

![Komponenty UI — jasny motyw, odizolowany podgląd](screenshots/ui-primitives-light.png)

[Ciemny motyw](screenshots/ui-primitives-dark.png) · [Widok mobilny](screenshots/ui-primitives-mobile.png)

Źródło i licencja adaptowanego kodu: [third-party-notices.md](third-party-notices.md).
