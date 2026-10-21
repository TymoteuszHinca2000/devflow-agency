import { z } from 'zod'

export const emailSchema = z
  .string()
  .trim()
  .max(254, 'Adres e-mail jest zbyt długi.')
  .pipe(z.email('Wpisz poprawny adres e-mail.'))
  .transform((value) => value.toLowerCase())
