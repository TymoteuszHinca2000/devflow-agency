import { z } from 'zod'

export const loginSchema = z.object({
  email: z
    .string()
    .trim()
    .max(254, 'Adres e-mail jest zbyt długi.')
    .pipe(z.email('Wpisz poprawny adres e-mail.'))
    .transform((value) => value.toLowerCase()),
  // Existing valid accounts may predate a stricter sign-up policy. Never trim a password.
  password: z.string().min(1, 'Wpisz hasło.').max(4096, 'Hasło jest zbyt długie.'),
})

export type LoginInput = z.input<typeof loginSchema>
export type LoginValues = z.output<typeof loginSchema>
