import { z } from 'zod'
import { getSupabase } from '@/lib/supabase/client'
import { isOwnAvatarPath, prepareAvatar } from '../lib/avatar-file'
import { ProfileConflictError } from '../lib/account-errors'

const profileSchema = z.object({
  id: z.uuid(),
  display_name: z.string().max(120),
  avatar_path: z.string().nullable(),
  updated_at: z.string(),
})
export type Profile = z.infer<typeof profileSchema>
export interface ProfileResult {
  profile: Profile
  cleanupPending: boolean
}
const columns = 'id,display_name,avatar_path,updated_at'

function validateProfile(value: unknown, userId: string): Profile {
  const profile = profileSchema.parse(value)
  if (
    profile.id !== userId ||
    (profile.avatar_path && !isOwnAvatarPath(profile.avatar_path, userId))
  )
    throw new Error('invalid-profile')
  return profile
}

export async function loadProfile(userId: string, signal: AbortSignal): Promise<Profile> {
  const { data, error } = await getSupabase()
    .from('profiles')
    .select(columns)
    .eq('id', userId)
    .abortSignal(signal)
    .single()
  if (error) throw error
  return validateProfile(data, userId)
}

export async function loadAvatar(profile: Profile): Promise<Blob | null> {
  if (!profile.avatar_path || !isOwnAvatarPath(profile.avatar_path, profile.id)) return null
  const { data, error } = await getSupabase().storage.from('avatars').download(profile.avatar_path)
  if (error) throw error
  if (!['image/png', 'image/jpeg', 'image/webp'].includes(data.type) || data.size > 2 * 1024 * 1024)
    throw new Error('invalid-avatar')
  return data
}

async function removeObject(path: string): Promise<boolean> {
  try {
    return !(await getSupabase().storage.from('avatars').remove([path])).error
  } catch {
    return false
  }
}

export async function saveProfile(
  current: Profile,
  displayName: string,
  avatar: File | 'remove' | null,
): Promise<ProfileResult> {
  const client = getSupabase()
  let newPath: string | null = null
  if (avatar instanceof File) {
    const { blob, extension } = await prepareAvatar(avatar)
    newPath = `${current.id}/${crypto.randomUUID()}.${extension}`
    const uploaded = await client.storage
      .from('avatars')
      .upload(newPath, blob, { contentType: blob.type, upsert: false, cacheControl: '60' })
    if (uploaded.error) throw uploaded.error
  }
  const avatarPath = avatar === 'remove' ? null : (newPath ?? current.avatar_path)
  const result = await client
    .from('profiles')
    .update({ display_name: displayName, avatar_path: avatarPath })
    .eq('id', current.id)
    .eq('updated_at', current.updated_at)
    .select(columns)
    .maybeSingle()
  // A transport error is ambiguous: the transaction may have committed. Never delete a
  // potentially referenced new avatar on that path; retry/reload reconciles the profile.
  if (result.error) throw result.error
  if (!result.data) {
    if (newPath) await removeObject(newPath)
    throw new ProfileConflictError()
  }
  const profile = validateProfile(result.data, current.id)
  const cleanupPending = Boolean(
    current.avatar_path &&
    current.avatar_path !== profile.avatar_path &&
    !(await removeObject(current.avatar_path)),
  )
  return { profile, cleanupPending }
}
