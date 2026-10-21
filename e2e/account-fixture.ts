import type { BrowserContext } from '@playwright/test'
import { authTestUrl } from './auth-config'
import { authTestUser } from './auth-fixture'

export async function installAccountFixture(
  context: BrowserContext,
  options: { conflict?: boolean; offline?: boolean } = {},
) {
  let profile = {
    id: authTestUser.id,
    display_name: 'Test Person',
    avatar_path: null as string | null,
    updated_at: '2026-01-01T00:00:00Z',
  }
  let revision = 0
  const objects = new Map<string, { bytes: Buffer; contentType: string }>()
  await context.route(`${authTestUrl}/rest/v1/profiles*`, async (route) => {
    if (options.offline) {
      await route.abort('failed')
      return
    }
    const request = route.request()
    const url = new URL(request.url())
    if (url.searchParams.get('id') !== `eq.${authTestUser.id}`) {
      await route.fulfill({ status: 403, json: {} })
      return
    }
    if (request.method() === 'PATCH') {
      if (options.conflict || url.searchParams.get('updated_at') !== `eq.${profile.updated_at}`) {
        await route.fulfill({ json: [] })
        return
      }
      const body: unknown = request.postDataJSON()
      if (
        typeof body !== 'object' ||
        !body ||
        !('display_name' in body) ||
        typeof body.display_name !== 'string' ||
        !('avatar_path' in body) ||
        !(body.avatar_path === null || typeof body.avatar_path === 'string')
      ) {
        await route.fulfill({ status: 400, json: {} })
        return
      }
      profile = {
        ...profile,
        display_name: body.display_name,
        avatar_path: body.avatar_path,
        updated_at: `2026-01-01T00:00:${String(++revision).padStart(2, '0')}Z`,
      }
      await route.fulfill({ json: [profile] })
    } else await route.fulfill({ json: profile })
  })
  await context.route(`${authTestUrl}/storage/v1/**`, async (route) => {
    const request = route.request()
    const path = new URL(request.url()).pathname
      .replace('/storage/v1/object/authenticated/', '')
      .replace('/storage/v1/object/', '')
    if (request.method() === 'DELETE') {
      const body: unknown = request.postDataJSON()
      if (typeof body === 'object' && body && 'prefixes' in body && Array.isArray(body.prefixes))
        for (const value of body.prefixes)
          if (typeof value === 'string') objects.delete(`avatars/${value}`)
      await route.fulfill({ json: [] })
      return
    }
    if (request.method() === 'POST') {
      const contentType = request.headers()['content-type'] ?? 'application/octet-stream'
      const bytes = request.postDataBuffer() ?? Buffer.alloc(0)
      const form = await new Response(new Uint8Array(bytes), {
        headers: { 'content-type': contentType },
      }).formData()
      const file = form.get('')
      if (!(file instanceof File)) throw new Error('Expected a multipart raster file')
      objects.set(path, { bytes: Buffer.from(await file.arrayBuffer()), contentType: file.type })
      await route.fulfill({ json: { Key: path, Id: 'test-object' } })
      return
    }
    const object = objects.get(path)
    if (object) await route.fulfill({ body: object.bytes, contentType: object.contentType })
    else await route.fulfill({ status: 404, json: { message: 'not found' } })
  })
  return { readProfile: () => profile, objectCount: () => objects.size }
}
