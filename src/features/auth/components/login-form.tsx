import { useRef, useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { ArrowRight, Eye, EyeOff, LoaderCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { signInWithEmail } from '../services/auth-service'
import { getAuthErrorMessage } from '../lib/auth-errors'
import { loginSchema } from '../validation/login-schema'
import type { LoginInput, LoginValues } from '../validation/login-schema'

export function LoginForm() {
  const [showPassword, setShowPassword] = useState(false)
  const feedback = useRef<HTMLDivElement>(null)
  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<LoginInput, unknown, LoginValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: '', password: '' },
  })

  async function submit(values: LoginValues) {
    try {
      await signInWithEmail(values)
      // Navigation follows the provider's verified identity, never just this response.
    } catch (error) {
      setError('root', { message: getAuthErrorMessage(error) })
      requestAnimationFrame(() => feedback.current?.focus())
    }
  }

  return (
    <form
      onSubmit={(event) => {
        void handleSubmit(submit)(event)
      }}
      noValidate
      aria-label="Logowanie e-mailem"
      aria-busy={isSubmitting}
    >
      {errors.root?.message && (
        <div className="auth-feedback" role="alert" tabIndex={-1} ref={feedback}>
          {errors.root.message}
        </div>
      )}
      <div className="auth-field">
        <Label htmlFor="login-email">Adres e-mail</Label>
        <Input
          id="login-email"
          type="email"
          autoComplete="username"
          autoCapitalize="none"
          spellCheck={false}
          placeholder="ty@agencja.pl"
          required
          maxLength={254}
          disabled={isSubmitting}
          aria-invalid={Boolean(errors.email)}
          aria-describedby={errors.email ? 'login-email-error' : undefined}
          {...register('email')}
        />
        {errors.email && (
          <p className="auth-field-error" id="login-email-error" role="alert">
            {errors.email.message}
          </p>
        )}
      </div>
      <div className="auth-field">
        <Label htmlFor="login-password">Hasło</Label>
        <div className="auth-password">
          <Input
            id="login-password"
            type={showPassword ? 'text' : 'password'}
            autoComplete="current-password"
            required
            maxLength={4096}
            disabled={isSubmitting}
            aria-invalid={Boolean(errors.password)}
            aria-describedby={errors.password ? 'login-password-error' : undefined}
            {...register('password')}
          />
          <Button
            variant="ghost"
            size="icon"
            className="auth-password-toggle"
            onClick={() => setShowPassword((value) => !value)}
            disabled={isSubmitting}
            aria-label={showPassword ? 'Ukryj hasło' : 'Pokaż hasło'}
            aria-pressed={showPassword}
          >
            {showPassword ? (
              <EyeOff size={18} aria-hidden="true" />
            ) : (
              <Eye size={18} aria-hidden="true" />
            )}
          </Button>
        </div>
        {errors.password && (
          <p className="auth-field-error" id="login-password-error" role="alert">
            {errors.password.message}
          </p>
        )}
      </div>
      <Button type="submit" className="auth-submit" disabled={isSubmitting}>
        {isSubmitting ? (
          <>
            Logowanie… <LoaderCircle className="auth-spinner" size={18} aria-hidden="true" />
          </>
        ) : (
          <>
            Zaloguj się <ArrowRight size={18} aria-hidden="true" />
          </>
        )}
      </Button>
      <p className="auth-form-note">
        Sesja zostanie zapamiętana w tej przeglądarce. Na współdzielonym urządzeniu wyloguj się po
        zakończeniu pracy.
      </p>
    </form>
  )
}
