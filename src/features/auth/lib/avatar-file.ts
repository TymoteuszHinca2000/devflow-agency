export const avatarMaxBytes = 2 * 1024 * 1024
export class AvatarValidationError extends Error {}
const extensions: Record<string, string> = {
  'image/png': 'png',
  'image/jpeg': 'jpg',
  'image/webp': 'webp',
}

export function isOwnAvatarPath(path: string, userId: string): boolean {
  const [owner, name, ...rest] = path.split('/')
  return (
    owner === userId &&
    rest.length === 0 &&
    /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}\.(png|jpe?g|webp)$/.test(
      name ?? '',
    )
  )
}

/** Decode and re-encode raster pixels, stripping metadata and rejecting disguised non-images. */
export async function prepareAvatar(file: File): Promise<{ blob: Blob; extension: string }> {
  const extension = extensions[file.type]
  if (!extension) throw new AvatarValidationError('Wybierz obraz PNG, JPEG lub WebP.')
  if (file.size === 0 || file.size > avatarMaxBytes)
    throw new AvatarValidationError('Obraz może mieć maksymalnie 2 MB i nie może być pusty.')
  const bytes = new Uint8Array(await file.slice(0, 12).arrayBuffer())
  const png = [137, 80, 78, 71, 13, 10, 26, 10].every((value, index) => bytes[index] === value)
  const jpeg = bytes[0] === 255 && bytes[1] === 216 && bytes[2] === 255
  const webp =
    new TextDecoder().decode(bytes.slice(0, 4)) === 'RIFF' &&
    new TextDecoder().decode(bytes.slice(8, 12)) === 'WEBP'
  if (!(file.type === 'image/png' ? png : file.type === 'image/jpeg' ? jpeg : webp))
    throw new AvatarValidationError('Zawartość pliku nie pasuje do typu obrazu.')
  let bitmap: ImageBitmap
  try {
    bitmap = await createImageBitmap(file)
  } catch {
    throw new AvatarValidationError('Nie można odczytać tego obrazu. Wybierz inny plik.')
  }
  try {
    if (!bitmap.width || !bitmap.height || bitmap.width * bitmap.height > 25_000_000)
      throw new AvatarValidationError('Wybierz obraz o rozdzielczości do 25 megapikseli.')
    const scale = Math.min(1, 512 / Math.max(bitmap.width, bitmap.height))
    const canvas = document.createElement('canvas')
    canvas.width = Math.max(1, Math.round(bitmap.width * scale))
    canvas.height = Math.max(1, Math.round(bitmap.height * scale))
    const context = canvas.getContext('2d')
    if (!context)
      throw new AvatarValidationError('Ta przeglądarka nie obsługuje przygotowania obrazu.')
    context.drawImage(bitmap, 0, 0, canvas.width, canvas.height)
    const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, file.type, 0.9))
    if (!blob || blob.size > avatarMaxBytes)
      throw new AvatarValidationError('Nie udało się przygotować obrazu do wysłania.')
    // Browsers may fall back to PNG for an unsupported encoder.
    return { blob, extension: extensions[blob.type] ?? 'png' }
  } finally {
    bitmap.close()
  }
}
