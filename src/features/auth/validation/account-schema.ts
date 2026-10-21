import { z } from 'zod'

export const displayNameSchema = z
  .string()
  .trim()
  .min(1, 'Wpisz imię lub nazwę.')
  .max(120, 'Użyj maksymalnie 120 znaków.')
export const profileFormSchema = z.object({ displayName: displayNameSchema })
export const newPasswordSchema = z
  .string()
  .min(12, 'Użyj co najmniej 12 znaków.')
  .max(128, 'Użyj maksymalnie 128 znaków.')
export const passwordFormSchema = z
  .object({
    currentPassword: z.string().max(4096),
    password: newPasswordSchema,
    confirmPassword: z.string().min(1, 'Powtórz hasło.'),
  })
  .refine((value) => value.password === value.confirmPassword, {
    path: ['confirmPassword'],
    message: 'Hasła muszą być takie same.',
  })
export type PasswordFormValues = z.infer<typeof passwordFormSchema>
