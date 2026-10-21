import { beforeEach, describe, expect, it, vi } from 'vitest'
import { ProfileConflictError } from '../lib/account-errors'
import { saveProfile } from './profile-service'

const api = vi.hoisted(() => ({
  upload: vi.fn(),
  remove: vi.fn(),
  update: vi.fn(),
  eq: vi.fn(),
  select: vi.fn(),
  maybeSingle: vi.fn(),
  prepare: vi.fn(),
}))
vi.mock('@/lib/supabase/client', () => ({
  getSupabase: () => ({
    from: () => ({ update: api.update }),
    storage: { from: () => ({ upload: api.upload, remove: api.remove }) },
  }),
}))
vi.mock('../lib/avatar-file', async (importOriginal) => ({
  ...(await importOriginal<typeof import('../lib/avatar-file')>()),
  prepareAvatar: api.prepare,
}))
const profile = {
  id: '10000000-0000-4000-8000-000000000099',
  display_name: 'Before',
  avatar_path: '10000000-0000-4000-8000-000000000099/20000000-0000-4000-8000-000000000099.png',
  updated_at: '2026-01-01T00:00:00Z',
}
beforeEach(() => {
  vi.resetAllMocks()
  api.update.mockReturnValue({ eq: api.eq })
  api.eq.mockReturnValue({ eq: api.eq, select: api.select })
  api.select.mockReturnValue({ maybeSingle: api.maybeSingle })
  api.maybeSingle.mockResolvedValue({
    data: { ...profile, display_name: 'After', avatar_path: null },
    error: null,
  })
  api.remove.mockResolvedValue({ error: null })
  api.upload.mockResolvedValue({ error: null })
  api.prepare.mockResolvedValue({
    blob: new Blob(['pixels'], { type: 'image/png' }),
    extension: 'png',
  })
})
describe('profile persistence', () => {
  it('updates only editable fields and uses a compare-and-swap for concurrent tabs', async () => {
    await saveProfile(profile, 'After', 'remove')
    expect(api.update).toHaveBeenCalledWith({ display_name: 'After', avatar_path: null })
    expect(api.eq).toHaveBeenCalledWith('id', profile.id)
    expect(api.eq).toHaveBeenCalledWith('updated_at', profile.updated_at)
    expect(api.remove).toHaveBeenCalledWith([profile.avatar_path])
  })
  it('never deletes the current avatar if profile persistence fails', async () => {
    api.maybeSingle.mockResolvedValue({ data: null, error: new Error('offline') })
    await expect(saveProfile(profile, 'After', 'remove')).rejects.toThrow('offline')
    expect(api.remove).not.toHaveBeenCalled()
  })
  it('reports a concurrent change without overwriting it and cleans an unreferenced upload', async () => {
    api.maybeSingle.mockResolvedValue({ data: null, error: null })
    await expect(
      saveProfile(profile, 'After', new File(['test'], 'avatar.png')),
    ).rejects.toBeInstanceOf(ProfileConflictError)
    const path: unknown = api.upload.mock.calls[0]?.[0]
    expect(path).toMatch(new RegExp(`^${profile.id}/[0-9a-f-]+\\.png$`))
    expect(api.remove).toHaveBeenCalledWith([path])
    expect(api.remove).not.toHaveBeenCalledWith([profile.avatar_path])
  })
  it('uploads a new generated path with upsert disabled', async () => {
    api.maybeSingle.mockImplementation(() => {
      const avatarPath: unknown = api.upload.mock.calls[0]?.[0]
      return Promise.resolve({ data: { ...profile, avatar_path: avatarPath }, error: null })
    })
    await saveProfile(profile, 'After', new File(['test'], '../../unsafe.png'))
    expect(api.upload).toHaveBeenCalledWith(
      expect.stringMatching(/\/[^/]+\.png$/),
      expect.any(Blob),
      { contentType: 'image/png', upsert: false, cacheControl: '60' },
    )
  })
  it('preserves a possibly committed upload after an ambiguous HTTP error', async () => {
    api.maybeSingle.mockResolvedValue({ data: null, error: new Error('timeout') })
    await expect(saveProfile(profile, 'After', new File(['test'], 'avatar.png'))).rejects.toThrow(
      'timeout',
    )
    expect(api.remove).not.toHaveBeenCalled()
  })
  it('reports a cleanup failure as partial success after the profile is committed', async () => {
    api.remove.mockResolvedValue({ error: new Error('offline') })
    await expect(saveProfile(profile, 'After', 'remove')).resolves.toMatchObject({
      profile: { avatar_path: null },
      cleanupPending: true,
    })
  })
})
