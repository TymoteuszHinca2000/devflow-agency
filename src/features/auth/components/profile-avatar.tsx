import { useEffect, useState } from 'react'
import { UserRound } from 'lucide-react'
import { loadAvatar } from '../services/profile-service'
import type { Profile } from '../services/profile-service'

export function ProfileAvatar({ profile }: { profile: Profile }) {
  const [image, setImage] = useState<{ path: string; url: string } | null>(null)
  const [failedPath, setFailedPath] = useState<string | null>(null)
  useEffect(() => {
    let active = true
    let url: string | undefined
    void loadAvatar(profile)
      .then((blob) => {
        if (!blob || !active || !profile.avatar_path) return
        url = URL.createObjectURL(blob)
        setImage({ path: profile.avatar_path, url })
      })
      .catch(() => {
        if (active) setFailedPath(profile.avatar_path)
      })
    return () => {
      active = false
      if (url) URL.revokeObjectURL(url)
    }
  }, [profile])
  return (
    <div className="profile-avatar-group">
      <div className="profile-avatar">
        {image && image.path === profile.avatar_path ? (
          <img src={image.url} alt="Twój awatar" width={80} height={80} />
        ) : (
          <UserRound size={32} aria-hidden="true" />
        )}
      </div>
      {profile.avatar_path && failedPath === profile.avatar_path && (
        <p className="auth-field-hint" role="status">
          Nie udało się pobrać awatara. Odśwież dane, aby spróbować ponownie.
        </p>
      )}
    </div>
  )
}
