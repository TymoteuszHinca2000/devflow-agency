import { Clock3, FileText, FolderKanban, ListTodo, MessagesSquare, UsersRound } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'

export type ModuleCategory = 'all' | 'work' | 'clients'

type PlannedModule = Readonly<{
  id: string
  title: string
  category: Exclude<ModuleCategory, 'all'>
  stage: number
  icon: LucideIcon
  description: string
  capabilities: readonly string[]
}>

export const moduleFilters: readonly { id: ModuleCategory; label: string }[] = [
  { id: 'all', label: 'Wszystkie' },
  { id: 'work', label: 'Praca zespołu' },
  { id: 'clients', label: 'Relacje z klientami' },
]

export const plannedModules: readonly PlannedModule[] = [
  {
    id: 'projects',
    title: 'Projekty',
    category: 'work',
    stage: 8,
    icon: FolderKanban,
    description:
      'Od pierwszego pomysłu do finalnego efektu. Plan, budżet i terminy w jednym miejscu.',
    capabilities: ['Budżety', 'Terminy', 'Postęp'],
  },
  {
    id: 'tasks',
    title: 'Zadania i Kanban',
    category: 'work',
    stage: 9,
    icon: ListTodo,
    description:
      'Przejrzysty plan działania. Każde zadanie z priorytetem, terminem i osobą odpowiedzialną.',
    capabilities: ['Tablice', 'Podzadania', 'Komentarze'],
  },
  {
    id: 'clients',
    title: 'Klienci',
    category: 'clients',
    stage: 7,
    icon: UsersRound,
    description:
      'Dobre relacje zaczynają się od porządku. Dane kontaktowe i historia wspólnej pracy.',
    capabilities: ['Kontakty', 'Firmy', 'Historia'],
  },
  {
    id: 'time',
    title: 'Czas pracy',
    category: 'work',
    stage: 10,
    icon: Clock3,
    description: 'Zobacz, gdzie trafia czas Twojego zespołu. Od krótkiego zadania po cały projekt.',
    capabilities: ['Timer', 'Stawki', 'Raporty'],
  },
  {
    id: 'quotes',
    title: 'Wyceny',
    category: 'clients',
    stage: 11,
    icon: FileText,
    description:
      'Jasny zakres i konkretne liczby. Przygotowanie wyceny jako naturalna część procesu.',
    capabilities: ['Kosztorysy', 'Statusy', 'PDF'],
  },
  {
    id: 'portal',
    title: 'Portal klienta',
    category: 'clients',
    stage: 12,
    icon: MessagesSquare,
    description: 'Wspólna przestrzeń do rozmowy. Postęp, pliki i akceptacje dostępne dla klienta.',
    capabilities: ['Pliki', 'Komentarze', 'Akceptacje'],
  },
]
