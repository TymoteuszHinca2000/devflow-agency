import {
  Bell,
  Building2,
  Clock3,
  FileText,
  FolderKanban,
  LayoutDashboard,
  ListTodo,
  MessagesSquare,
  Settings2,
  UsersRound,
} from 'lucide-react'
import type { LucideIcon } from 'lucide-react'

type AppModule = Readonly<{
  path: string
  title: string
  description: string
  stage: number
  icon: LucideIcon
}>

export const appModules: readonly AppModule[] = [
  {
    path: 'dashboard',
    title: 'Dashboard',
    description: 'Przegląd projektów, terminów i pracy zespołu.',
    stage: 6,
    icon: LayoutDashboard,
  },
  {
    path: 'organizations',
    title: 'Organizacje',
    description: 'Agencje, członkowie zespołu i ich uprawnienia.',
    stage: 5,
    icon: Building2,
  },
  {
    path: 'clients',
    title: 'Klienci',
    description: 'Dane kontaktowe, firmy i historia współpracy.',
    stage: 7,
    icon: UsersRound,
  },
  {
    path: 'projects',
    title: 'Projekty',
    description: 'Zakres pracy, budżety, terminy i postęp projektów.',
    stage: 8,
    icon: FolderKanban,
  },
  {
    path: 'tasks',
    title: 'Zadania i Kanban',
    description: 'Zadania, priorytety i wspólny plan działania.',
    stage: 9,
    icon: ListTodo,
  },
  {
    path: 'time-tracking',
    title: 'Czas pracy',
    description: 'Timer, wpisy czasu i raporty pracy zespołu.',
    stage: 10,
    icon: Clock3,
  },
  {
    path: 'quotes',
    title: 'Wyceny',
    description: 'Kosztorysy, pozycje wycen i dokumenty PDF.',
    stage: 11,
    icon: FileText,
  },
  {
    path: 'client-portal',
    title: 'Portal klienta',
    description: 'Udostępnione projekty, pliki i rozmowy z klientem.',
    stage: 12,
    icon: MessagesSquare,
  },
  {
    path: 'notifications',
    title: 'Powiadomienia',
    description: 'Ważne zmiany i aktywności w jednym miejscu.',
    stage: 13,
    icon: Bell,
  },
  {
    path: 'settings',
    title: 'Ustawienia',
    description: 'Preferencje konta i powiadomień.',
    stage: 13,
    icon: Settings2,
  },
]
