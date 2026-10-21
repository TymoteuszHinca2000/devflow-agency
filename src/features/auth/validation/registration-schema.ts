import { z } from 'zod'
import { emailSchema } from './email-schema'
import { displayNameSchema, newPasswordSchema } from './account-schema'

export const registrationSchema = z
  .object({
    displayName: displayNameSchema,
    email: emailSchema,
    password: newPasswordSchema,
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
