import type { User } from '@supabase/supabase-js'

// Synthetic identity for isolated rendering tests; never used by application services.
export const verifiedTestUser: User = {
  id: '10000000-0000-4000-8000-000000000099',
  aud: 'authenticated',
  email: 'ui-auth@example.test',
  email_confirmed_at: '2026-01-01T00:00:00Z',
  app_metadata: {},
  user_metadata: {},
  created_at: '2026-01-01T00:00:00Z',
}
