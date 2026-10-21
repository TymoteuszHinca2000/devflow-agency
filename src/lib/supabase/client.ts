import { createClient } from '@supabase/supabase-js'
import type { SupabaseClient } from '@supabase/supabase-js'
import type { Database } from '@/types/database.types'
import { readSupabaseConfiguration } from './config'

let client: SupabaseClient<Database> | undefined

/** One browser client; configuration is checked when a service first needs it. */
export function getSupabase(): SupabaseClient<Database> {
  if (!client) {
    const configuration = readSupabaseConfiguration(import.meta.env)
    client = createClient<Database>(configuration.url, configuration.publishableKey, {
      auth: {
        flowType: 'pkce',
        detectSessionInUrl: false,
      },
    })
  }
  return client
}
