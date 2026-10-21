import { useEffect, useRef, useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { confirmationEmailSchema } from '../validation/registration-schema'
import type {
  ConfirmationEmailInput,
  ConfirmationEmailValues,
} from '../validation/registration-schema'
import { requestPasswordReset } from '../services/password-service'
import { getAuthErrorMessage } from '../lib/auth-errors'
import { useConfirmationCooldown } from '../hooks/use-confirmation-cooldown'

export function ForgotPasswordForm() {
  const [sent, setSent] = useState(false)
  const feedback = useRef<HTMLDivElement>(null)
  const cooldown = useConfirmationCooldown()
  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<ConfirmationEmailInput, unknown, ConfirmationEmailValues>({
    resolver: zodResolver(confirmationEmailSchema),
    defaultValues: { email: '' },
  })
  useEffect(() => {
    if (sent || errors.root?.message) feedback.current?.focus()
  }, [sent, errors.root?.message])
  async function submit(values: ConfirmationEmailValues) {
    if (cooldown.remaining) return
    setSent(false)
    cooldown.start()
    try {
      await requestPasswordReset(values.email)
      setSent(true)
    } catch (error) {
      setError('root', { message: getAuthErrorMessage(error) })
    }
  }
  return (
    <form
      aria-label="Odzyskiwanie hasła"
      aria-busy={isSubmitting}
      noValidate
      onSubmit={(event) => {
        void handleSubmit(submit)(event)
      }}
    >
      {(sent || errors.root?.message) && (
        <div
          tabIndex={-1}
          ref={feedback}
          role={sent ? 'status' : 'alert'}
          className={sent ? 'auth-success' : 'auth-feedback'}
        >
          {sent
            ? 'Jeśli konto o tym adresie istnieje, otrzymasz wiadomość z dalszymi krokami. Otwórz najnowszy link w tej samej przeglądarce.'
            : errors.root?.message}
        </div>
      )}
      <div className="auth-field">
        <Label htmlFor="recovery-email">Adres e-mail</Label>
        <Input
          id="recovery-email"
          type="email"
          autoComplete="username"
          autoCapitalize="none"
          spellCheck={false}
          required
          maxLength={254}
          disabled={isSubmitting}
          aria-invalid={Boolean(errors.email)}
          aria-describedby={errors.email ? 'recovery-email-error' : undefined}
          {...register('email')}
        />
        {errors.email && (
          <p id="recovery-email-error" className="auth-field-error" role="alert">
            {errors.email.message}
          </p>
        )}
      </div>
      <Button
        type="submit"
        className="auth-submit"
        disabled={isSubmitting || cooldown.remaining > 0}
      >
        {isSubmitting ? 'Wysyłanie…' : 'Wyślij link do zmiany hasła'}
      </Button>
      {cooldown.remaining > 0 && (
        <p className="auth-field-hint auth-cooldown">
          Kolejna wiadomość za {cooldown.remaining} s.
        </p>
      )}
    </form>
  )
}
