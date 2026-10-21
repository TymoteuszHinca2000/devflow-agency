import { isAuthError } from '@supabase/supabase-js'
import { getAuthErrorMessage } from './auth-errors'

export function getPasswordErrorMessage(error: unknown): string {
  if (isAuthError(error)) {
    if (error.code === 'same_password') return 'Nowe hasło musi różnić się od obecnego.'
    if (error.code === 'reauthentication_needed' || error.code === 'reauthentication_not_valid')
      return 'Zaloguj się ponownie i spróbuj zmienić hasło.'
  }
  if (error instanceof Error && ['recovery-expired', 'identity-changed'].includes(error.message))
    return 'Sesja zmiany hasła wygasła. Poproś o nowy link lub zaloguj się ponownie.'
  return getAuthErrorMessage(error)
}

export class ProfileConflictError extends Error {}
export function getProfileErrorMessage(error: unknown): string {
  return error instanceof ProfileConflictError
    ? 'Profil zmienił się w innej karcie. Odśwież dane przed kolejnym zapisem.'
    : 'Nie udało się zapisać profilu. Sprawdź połączenie i spróbuj ponownie.'
}
