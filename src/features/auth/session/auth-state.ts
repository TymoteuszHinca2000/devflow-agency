import type { User } from '@supabase/supabase-js'

export type AuthState =
  | { status: 'loading' }
  | { status: 'signed-out'; expired: boolean }
  | { status: 'signed-in'; user: User }
  | { status: 'error'; message: string }
