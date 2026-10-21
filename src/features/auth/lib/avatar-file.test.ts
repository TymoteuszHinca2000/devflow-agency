import { describe, expect, it } from 'vitest'
import { isOwnAvatarPath, prepareAvatar } from './avatar-file'
const id = '10000000-0000-4000-8000-000000000099'
describe('private avatar input boundaries', () => {
  it('accepts only an own UUID folder with a generated raster filename', () => {
    expect(isOwnAvatarPath(`${id}/${id}.webp`, id)).toBe(true)
    for (const path of [
      `other/${id}.png`,
      `${id}/../${id}.png`,
      `${id}/${id}.svg`,
      `${id}/photo.png`,
      `https://host/${id}.png`,
    ])
      expect(isOwnAvatarPath(path, id)).toBe(false)
  })
  it('rejects SVG and empty or oversized raster files before decoding', async () => {
    await expect(
      prepareAvatar(new File(['<svg/>'], 'photo.svg', { type: 'image/svg+xml' })),
    ).rejects.toThrow('PNG, JPEG lub WebP')
    await expect(prepareAvatar(new File([], 'photo.png', { type: 'image/png' }))).rejects.toThrow(
      '2 MB',
    )
    await expect(
      prepareAvatar(new File([new Uint8Array(2097153)], 'photo.png', { type: 'image/png' })),
    ).rejects.toThrow('2 MB')
  })
})
