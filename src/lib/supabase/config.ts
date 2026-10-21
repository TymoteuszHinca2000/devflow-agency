export interface SupabaseConfiguration {
  url: string
  publishableKey: string
}

export class SupabaseConfigurationError extends Error {
  readonly issues: readonly string[]

  constructor(issues: readonly string[]) {
    super(`Nieprawidłowa konfiguracja Supabase. ${issues.join(' ')}`)
    this.name = 'SupabaseConfigurationError'
    this.issues = issues
  }
}

export function readSupabaseConfiguration(
  environment: Record<string, unknown>,
): SupabaseConfiguration {
  const issues: string[] = []
  const url = readValue(environment.VITE_SUPABASE_URL)
  const publishableKey = readValue(environment.VITE_SUPABASE_PUBLISHABLE_KEY)

  if (!url) {
    issues.push('Uzupełnij VITE_SUPABASE_URL w .env.local i uruchom aplikację ponownie.')
  } else if (!isSupabaseUrl(url)) {
    issues.push(
      'VITE_SUPABASE_URL wymaga adresu HTTPS bez hasła, ścieżki ani parametrów. HTTP jest dozwolone tylko lokalnie.',
    )
  }

  if (!publishableKey) {
    issues.push('Uzupełnij VITE_SUPABASE_PUBLISHABLE_KEY w .env.local.')
  } else if (!/^sb_publishable_[A-Za-z0-9_-]+$/.test(publishableKey)) {
    issues.push(
      'VITE_SUPABASE_PUBLISHABLE_KEY wymaga publicznego klucza sb_publishable_. Skopiuj go z ustawień API Keys projektu.',
    )
  }

  if (issues.length) throw new SupabaseConfigurationError(issues)
  return { url: new URL(url).origin, publishableKey }
}

function readValue(value: unknown): string {
  return typeof value === 'string' ? value.trim() : ''
}

function isSupabaseUrl(value: string): boolean {
  try {
    const url = new URL(value)
    const local = ['localhost', '127.0.0.1', '[::1]'].includes(url.hostname)
    return (
      (url.protocol === 'https:' || (url.protocol === 'http:' && local)) &&
      !url.username &&
      !url.password &&
      !url.search &&
      !url.hash &&
      url.pathname === '/'
    )
  } catch {
    return false
  }
}
