import { useRef, useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { ArrowRight, Eye, EyeOff, LoaderCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { registerWithEmail } from '../services/registration-service'
import { getAuthErrorMessage } from '../lib/auth-errors'
import { saveConfirmationDeadline } from '../lib/confirmation-cooldown'
import { registrationSchema } from '../validation/registration-schema'
import type { RegistrationInput, RegistrationValues } from '../validation/registration-schema'

export function RegistrationForm({
  returnTo,
  onSubmitted,
}: {
  returnTo: string
  onSubmitted: (email: string) => void
}) {
  const feedback = useRef<HTMLDivElement>(null)
  const [visible, setVisible] = useState({ password: false, confirmPassword: false })
  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<RegistrationInput, unknown, RegistrationValues>({
    resolver: zodResolver(registrationSchema),
    defaultValues: { displayName: '', email: '', password: '', confirmPassword: '' },
  })
  async function submit(values: RegistrationValues) {
    try {
      await registerWithEmail(values, returnTo)
      saveConfirmationDeadline()
      onSubmitted(values.email)
    } catch (error) {
      setError('root', { message: getAuthErrorMessage(error) })
      requestAnimationFrame(() => feedback.current?.focus())
    }
  }
  return (
    <form
      aria-label="Rejestracja e-mailem"
      noValidate
      aria-busy={isSubmitting}
      onSubmit={(event) => {
        void handleSubmit(submit)(event)
      }}
    >
      {errors.root?.message && (
        <div className="auth-feedback" role="alert" tabIndex={-1} ref={feedback}>
          {errors.root.message}
        </div>
      )}
      <div className="auth-field">
        <Label htmlFor="register-name">Imię lub nazwa</Label>
        <Input
          id="register-name"
          autoComplete="nickname"
          required
          maxLength={120}
          disabled={isSubmitting}
          aria-invalid={Boolean(errors.displayName)}
          aria-describedby={errors.displayName ? 'register-name-error' : undefined}
          {...register('displayName')}
        />
        {errors.displayName && (
          <p id="register-name-error" className="auth-field-error" role="alert">
            {errors.displayName.message}
          </p>
        )}
      </div>
      <div className="auth-field">
        <Label htmlFor="register-email">Adres e-mail</Label>
        <Input
          id="register-email"
          type="email"
          autoComplete="username"
          autoCapitalize="none"
          spellCheck={false}
          placeholder="ty@agencja.pl"
          required
          maxLength={254}
          disabled={isSubmitting}
          aria-invalid={Boolean(errors.email)}
          aria-describedby={errors.email ? 'register-email-error' : undefined}
          {...register('email')}
        />
        {errors.email && (
          <p id="register-email-error" className="auth-field-error" role="alert">
            {errors.email.message}
          </p>
        )}
      </div>
      {(['password', 'confirmPassword'] as const).map((field) => (
        <div className="auth-field" key={field}>
          <Label htmlFor={`register-${field}`}>
            {field === 'password' ? 'Hasło' : 'Powtórz hasło'}
          </Label>
          <div className="auth-password">
            <Input
              id={`register-${field}`}
              type={visible[field] ? 'text' : 'password'}
              autoComplete="new-password"
              required
              maxLength={128}
              disabled={isSubmitting}
              aria-invalid={Boolean(errors[field])}
              aria-describedby={
                [
                  field === 'password' ? 'register-password-hint' : '',
                  errors[field] ? `register-${field}-error` : '',
                ]
                  .filter(Boolean)
                  .join(' ') || undefined
              }
              {...register(field)}
            />
            <Button
              variant="ghost"
              size="icon"
              className="auth-password-toggle"
              disabled={isSubmitting}
              aria-label={`${visible[field] ? 'Ukryj' : 'Pokaż'} ${field === 'password' ? 'hasło' : 'powtórzone hasło'}`}
              aria-pressed={visible[field]}
              onClick={() => setVisible((current) => ({ ...current, [field]: !current[field] }))}
            >
              {visible[field] ? (
                <EyeOff size={18} aria-hidden="true" />
              ) : (
                <Eye size={18} aria-hidden="true" />
              )}
            </Button>
          </div>
          {field === 'password' && (
            <p id="register-password-hint" className="auth-field-hint">
              Co najmniej 12 znaków. Użyj unikalnego hasła.
            </p>
          )}
          {errors[field] && (
            <p id={`register-${field}-error`} className="auth-field-error" role="alert">
              {errors[field].message}
            </p>
          )}
        </div>
      ))}
      <Button type="submit" className="auth-submit" disabled={isSubmitting}>
        {isSubmitting ? (
          <>
            Tworzenie konta… <LoaderCircle className="auth-spinner" size={18} aria-hidden="true" />
          </>
        ) : (
          <>
            Utwórz konto <ArrowRight size={18} aria-hidden="true" />
          </>
        )}
      </Button>
      <p className="auth-form-note">
        Po rejestracji potwierdź adres w wiadomości e-mail. Otwórz link w tej samej przeglądarce.
      </p>
    </form>
  )
}
