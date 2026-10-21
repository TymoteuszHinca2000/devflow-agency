import { z } from 'zod'
import { emailSchema } from './email-schema'

export const loginSchema = z.object({
  email: emailSchema,
  // Existing valid accounts may predate a stricter sign-up policy. Never trim a password.
  password: z.string().min(1, 'Wpisz hasło.').max(4096, 'Hasło jest zbyt długie.'),
})

export type LoginInput = z.input<typeof loginSchema>
export type LoginValues = z.output<typeof loginSchema>
