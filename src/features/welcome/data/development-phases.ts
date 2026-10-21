type DevelopmentPhase = {
  readonly id: string
  readonly number: string
  readonly title: string
  readonly range: string
  readonly current: boolean
  readonly description: string
}

export const developmentPhases: readonly DevelopmentPhase[] = [
  {
    id: 'foundation',
    number: '01',
    title: 'Solidne fundamenty',
    range: 'Etapy 1–2',
    current: true,
    description:
      'Architektura projektu, ekran powitalny, design system i responsywny układ aplikacji.',
  },
  {
    id: 'workspace',
    number: '02',
    title: 'Twoja przestrzeń pracy',
    range: 'Etapy 3–5',
    current: false,
    description:
      'Baza danych, logowanie, organizacje i role. Podstawa bezpiecznej współpracy zespołu.',
  },
  {
    id: 'workflow',
    number: '03',
    title: 'Codzienna praca w jednym flow',
    range: 'Etapy 6–13',
    current: false,
    description:
      'Dashboard, klienci, projekty, Kanban, czas pracy, wyceny, portal klienta i powiadomienia.',
  },
  {
    id: 'production',
    number: '04',
    title: 'Gotowe na kolejny krok',
    range: 'Etapy 14–15',
    current: false,
    description:
      'Testy całego procesu, optymalizacja, przegląd bezpieczeństwa i wdrożenie produkcyjne.',
  },
]
