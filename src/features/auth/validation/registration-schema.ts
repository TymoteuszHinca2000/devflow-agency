import { z } from 'zod'
import { emailSchema } from './email-schema'

export const registrationSchema = z
  .object({
    displayName: z
      .string()
      .trim()
      .min(1, 'Wpisz imię lub nazwę.')
      .max(120, 'Użyj maksymalnie 120 znaków.'),
    email: emailSchema,
    password: z
      .string()
      .min(12, 'Użyj co najmniej 12 znaków.')
      .max(128, 'Użyj maksymalnie 128 znaków.'),
    confirmPassword: z.string().min(1, 'Powtórz hasło.'),
  })
  .refine((values) => values.password === values.confirmPassword, {
    path: ['confirmPassword'],
    message: 'Hasła muszą być takie same.',
  })

export const confirmationEmailSchema = z.object({ email: emailSchema })
export type RegistrationInput = z.input<typeof registrationSchema>
export type RegistrationValues = z.output<typeof registrationSchema>
export type ConfirmationEmailInput = z.input<typeof confirmationEmailSchema>
export type ConfirmationEmailValues = z.output<typeof confirmationEmailSchema>
