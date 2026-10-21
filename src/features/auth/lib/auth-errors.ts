import { isAuthError } from '@supabase/supabase-js'

export function getAuthErrorMessage(error: unknown): string {
  if (isAuthError(error)) {
    switch (error.code) {
      case 'invalid_credentials':
        return 'Nieprawidłowy adres e-mail lub hasło.'
      case 'email_not_confirmed':
        return 'Potwierdź adres e-mail, zanim się zalogujesz.'
      case 'over_request_rate_limit':
      case 'over_email_send_rate_limit':
        return 'Zbyt wiele prób. Odczekaj chwilę i spróbuj ponownie.'
      case 'signup_disabled':
        return 'Rejestracja jest obecnie niedostępna.'
      default:
        break
    }
    if (error.name === 'AuthRetryableFetchError')
      return 'Nie udało się połączyć. Sprawdź dostęp do internetu i spróbuj ponownie.'
  }
  return 'Nie udało się wykonać operacji. Spróbuj ponownie za chwilę.'
}
