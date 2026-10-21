import { useEffect, useRef, useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { passwordFormSchema } from '../validation/account-schema'
import type { PasswordFormValues } from '../validation/account-schema'
import type { PasswordResult } from '../services/password-service'
import { getPasswordErrorMessage } from '../lib/account-errors'

export function PasswordForm({
  recovery = false,
  onSave,
}: {
  recovery?: boolean
  onSave: (values: PasswordFormValues) => Promise<PasswordResult>
}) {
  const [success, setSuccess] = useState<string | null>(null)
  const feedback = useRef<HTMLDivElement>(null)
  const {
    register,
    handleSubmit,
    reset,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<PasswordFormValues>({
    resolver: zodResolver(
      passwordFormSchema.refine((value) => recovery || value.currentPassword.length > 0, {
        path: ['currentPassword'],
        message: 'Wpisz obecne hasło.',
      }),
    ),
    defaultValues: { currentPassword: '', password: '', confirmPassword: '' },
  })
  useEffect(() => {
    if (success || errors.root?.message) feedback.current?.focus()
  }, [success, errors.root?.message])
  async function submit(values: PasswordFormValues) {
    try {
      const result = await onSave(values)
      reset()
      setSuccess(
        result.otherSessionsRevoked
          ? 'Hasło zostało zmienione. Pozostałe sesje otrzymały żądanie wylogowania.'
          : 'Hasło zostało zmienione. Nie udało się wylogować pozostałych sesji; możesz ponowić wylogowanie na swoich urządzeniach.',
      )
    } catch (error) {
      setError('root', { message: getPasswordErrorMessage(error) })
    }
  }
  return (
    <form
      aria-label={recovery ? 'Ustawienie nowego hasła' : 'Zmiana hasła'}
      noValidate
      aria-busy={isSubmitting}
      onSubmit={(event) => {
        void handleSubmit(submit)(event)
      }}
    >
      {(success || errors.root?.message) && (
        <div
          ref={feedback}
          tabIndex={-1}
          role={success ? 'status' : 'alert'}
          className={success ? 'auth-success' : 'auth-feedback'}
        >
          {success ?? errors.root?.message}
        </div>
      )}
      {!success && (
        <>
          {[
            ...(!recovery
              ? [
                  {
                    key: 'currentPassword' as const,
                    label: 'Obecne hasło',
                    autocomplete: 'current-password',
                  },
                ]
              : []),
            { key: 'password' as const, label: 'Nowe hasło', autocomplete: 'new-password' },
            {
              key: 'confirmPassword' as const,
              label: 'Powtórz nowe hasło',
              autocomplete: 'new-password',
            },
          ].map((field) => (
            <div className="auth-field" key={field.key}>
              <Label htmlFor={`password-${field.key}`}>{field.label}</Label>
              <Input
                id={`password-${field.key}`}
                type="password"
                autoComplete={field.autocomplete}
                required
                maxLength={field.key === 'currentPassword' ? 4096 : 128}
                disabled={isSubmitting}
                aria-invalid={Boolean(errors[field.key])}
                aria-describedby={
                  errors[field.key]
                    ? `error-${field.key}`
                    : field.key === 'password'
                      ? 'new-password-hint'
                      : undefined
                }
                {...register(field.key)}
              />
              {field.key === 'password' && (
                <p id="new-password-hint" className="auth-field-hint">
                  Od 12 do 128 znaków. Użyj unikalnego hasła.
                </p>
              )}
              {errors[field.key] && (
                <p id={`error-${field.key}`} className="auth-field-error" role="alert">
                  {errors[field.key]?.message}
                </p>
              )}
            </div>
          ))}
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? 'Zapisywanie hasła…' : 'Zapisz nowe hasło'}
          </Button>
        </>
      )}
    </form>
  )
}
