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
      case 'weak_password':
        return 'To hasło nie spełnia wymagań bezpieczeństwa. Wybierz dłuższe, unikalne hasło.'
      case 'email_address_not_authorized':
        return 'Wysyłanie wiadomości na ten adres jest obecnie niedostępne.'
      case 'email_address_invalid':
        return 'Wpisz poprawny adres e-mail.'
      default:
        break
    }
    if (error.name === 'AuthRetryableFetchError')
      return 'Nie udało się połączyć. Sprawdź dostęp do internetu i spróbuj ponownie.'
  }
  return 'Nie udało się wykonać operacji. Spróbuj ponownie za chwilę.'
}

export function getConfirmationErrorMessage(error: unknown): string {
  if (isAuthError(error)) {
    if (error.name === 'AuthPKCECodeVerifierMissingError' || error.code === 'bad_code_verifier')
      return 'Nie możemy dokończyć logowania w tej przeglądarce. Adres mógł już zostać potwierdzony — spróbuj zalogować się hasłem lub poproś o nowy link.'
    if (['flow_state_expired', 'flow_state_not_found', 'otp_expired'].includes(error.code ?? ''))
      return 'Ten link wygasł lub został już wykorzystany. Zaloguj się hasłem albo poproś o nową wiadomość.'
  }
  return getAuthErrorMessage(error)
}
