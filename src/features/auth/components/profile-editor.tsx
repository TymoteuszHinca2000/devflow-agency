import { useEffect, useRef, useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { profileFormSchema } from '../validation/account-schema'
import { saveProfile } from '../services/profile-service'
import type { Profile } from '../services/profile-service'
import { getProfileErrorMessage } from '../lib/account-errors'
import { ProfileAvatar } from './profile-avatar'
import { AvatarValidationError } from '../lib/avatar-file'

export function ProfileEditor({ initialProfile }: { initialProfile: Profile }) {
  const [profile, setProfile] = useState(initialProfile)
  const [avatar, setAvatar] = useState<File | 'remove' | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const input = useRef<HTMLInputElement>(null)
  const feedback = useRef<HTMLDivElement>(null)
  const {
    register,
    handleSubmit,
    reset,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<z.input<typeof profileFormSchema>, unknown, z.output<typeof profileFormSchema>>({
    resolver: zodResolver(profileFormSchema),
    defaultValues: { displayName: profile.display_name },
  })
  useEffect(() => {
    if (success || errors.root?.message) feedback.current?.focus()
  }, [success, errors.root?.message])
  async function submit(values: z.output<typeof profileFormSchema>) {
    setSuccess(null)
    try {
      const result = await saveProfile(profile, values.displayName, avatar)
      setProfile(result.profile)
      setAvatar(null)
      if (input.current) input.current.value = ''
      reset({ displayName: result.profile.display_name })
      setSuccess(
        result.cleanupPending
          ? 'Profil zapisany. Nie udało się usunąć poprzedniego pliku awatara; nadal pozostaje prywatny.'
          : 'Profil został zapisany.',
      )
    } catch (error) {
      // File validation errors are produced locally; backend details never reach the UI.
      setError('root', {
        message:
          error instanceof AvatarValidationError ? error.message : getProfileErrorMessage(error),
      })
    }
  }
  return (
    <form
      aria-label="Edycja profilu"
      noValidate
      aria-busy={isSubmitting}
      onSubmit={(event) => {
        void handleSubmit(submit)(event)
      }}
    >
      {(success || errors.root?.message) && (
        <div
          tabIndex={-1}
          ref={feedback}
          className={success ? 'auth-success' : 'auth-feedback'}
          role={success ? 'status' : 'alert'}
        >
          {success ?? errors.root?.message}
        </div>
      )}
      <div className="profile-avatar-row">
        <ProfileAvatar profile={profile} />
        <div className="profile-avatar-fields">
          <Label htmlFor="account-avatar">Zdjęcie profilowe</Label>
          <Input
            ref={input}
            id="account-avatar"
            type="file"
            accept="image/png,image/jpeg,image/webp"
            disabled={isSubmitting}
            aria-describedby="avatar-hint avatar-selection"
            onChange={(event) => {
              setSuccess(null)
              setAvatar(event.target.files?.[0] ?? null)
            }}
          />
          <p id="avatar-hint" className="auth-field-hint">
            PNG, JPEG lub WebP, do 2 MB. Obraz zapiszemy bez metadanych, w rozmiarze do 512 px.
          </p>
          <p id="avatar-selection" className="auth-field-hint" role="status">
            {avatar === 'remove'
              ? 'Awatar zostanie usunięty po zapisaniu profilu.'
              : avatar
                ? `Wybrano: ${avatar.name}`
                : 'Zmiany zdjęcia zatwierdzisz razem z profilem.'}
          </p>
          {(profile.avatar_path || avatar) && (
            <Button
              variant="outline"
              disabled={isSubmitting}
              onClick={() => {
                setAvatar('remove')
                if (input.current) input.current.value = ''
              }}
            >
              Usuń awatar
            </Button>
          )}
        </div>
      </div>
      <div className="auth-field">
        <Label htmlFor="account-name">Imię lub nazwa</Label>
        <Input
          id="account-name"
          required
          maxLength={120}
          autoComplete="nickname"
          disabled={isSubmitting}
          aria-invalid={Boolean(errors.displayName)}
          aria-describedby={errors.displayName ? 'account-name-error' : undefined}
          {...register('displayName')}
        />
        {errors.displayName && (
          <p id="account-name-error" role="alert" className="auth-field-error">
            {errors.displayName.message}
          </p>
        )}
      </div>
      <Button type="submit" disabled={isSubmitting}>
        {isSubmitting ? 'Zapisywanie profilu…' : 'Zapisz profil'}
      </Button>
    </form>
  )
}
