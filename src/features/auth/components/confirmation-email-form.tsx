import { useRef, useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { LoaderCircle, Send } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { confirmationEmailSchema } from '../validation/registration-schema'
import type {
  ConfirmationEmailInput,
  ConfirmationEmailValues,
} from '../validation/registration-schema'
import { resendConfirmation } from '../services/registration-service'
import { getAuthErrorMessage } from '../lib/auth-errors'
import { useConfirmationCooldown } from '../hooks/use-confirmation-cooldown'

export function ConfirmationEmailForm({
  initialEmail,
  returnTo,
}: {
  initialEmail: string
  returnTo: string
}) {
  const feedback = useRef<HTMLDivElement>(null)
  const [sent, setSent] = useState(false)
  const { remaining, start } = useConfirmationCooldown()
  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<ConfirmationEmailInput, unknown, ConfirmationEmailValues>({
    resolver: zodResolver(confirmationEmailSchema),
    defaultValues: { email: initialEmail },
  })
  async function submit(values: ConfirmationEmailValues) {
    if (remaining > 0) return
    setSent(false)
    // Cool down attempts, including a rejected request. Server rate limits are authoritative.
    start()
    try {
      await resendConfirmation(values.email, returnTo)
      setSent(true)
    } catch (error) {
      setError('root', { message: getAuthErrorMessage(error) })
    }
    requestAnimationFrame(() => feedback.current?.focus())
  }
  return (
    <form
      noValidate
      aria-label="Ponowne potwierdzenie e-maila"
      aria-busy={isSubmitting}
      onSubmit={(event) => {
        void handleSubmit(submit)(event)
      }}
    >
      {errors.root?.message ? (
        <div className="auth-feedback" role="alert" tabIndex={-1} ref={feedback}>
          {errors.root.message}
        </div>
      ) : (
        sent && (
          <div className="auth-success" role="status" tabIndex={-1} ref={feedback}>
            Jeśli adres wymaga potwierdzenia, otrzymasz nową wiadomość. Sprawdź także spam.
          </div>
        )
      )}
      <div className="auth-field">
        <Label htmlFor="confirm-email">Adres e-mail</Label>
        <Input
          id="confirm-email"
          type="email"
          autoComplete="email"
          autoCapitalize="none"
          spellCheck={false}
          required
          maxLength={254}
          disabled={isSubmitting}
          aria-invalid={Boolean(errors.email)}
          aria-describedby={errors.email ? 'confirm-email-error' : undefined}
          {...register('email')}
        />
        {errors.email && (
          <p id="confirm-email-error" className="auth-field-error" role="alert">
            {errors.email.message}
          </p>
        )}
      </div>
      <Button type="submit" className="auth-submit" disabled={isSubmitting || remaining > 0}>
        {isSubmitting ? (
          <>
            Wysyłanie… <LoaderCircle className="auth-spinner" size={18} aria-hidden="true" />
          </>
        ) : (
          <>
            Wyślij ponownie <Send size={17} aria-hidden="true" />
          </>
        )}
      </Button>
      {remaining > 0 && (
        <p className="auth-field-hint auth-cooldown">Kolejna próba za {remaining} s.</p>
      )}
    </form>
  )
}
