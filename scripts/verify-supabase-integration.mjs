import assert from 'node:assert/strict'
import { randomUUID } from 'node:crypto'
import { existsSync } from 'node:fs'
import { createInterface } from 'node:readline'
import { createClient } from '@supabase/supabase-js'
import { readSupabaseConfiguration } from '../src/lib/supabase/config.ts'

// Isolated development accounts and IDs arrive via stdin, never command arguments.
// Setup/teardown require an administrative connection; this runner uses only a public key.
if (existsSync('.env.local')) process.loadEnvFile('.env.local')
const config = readSupabaseConfiguration(process.env)
const input = createInterface({ input: process.stdin, terminal: false })
const line = await new Promise((resolve, reject) => {
  input.once('line', resolve)
  input.once('close', () => reject(new Error('Expected private fixture JSON on stdin')))
})
input.close()
process.stdin.pause()
const fixture = JSON.parse(line)
assert.equal(fixture.environment, 'development')
for (const field of [
  'runId',
  'organizationA',
  'organizationB',
  'projectA',
  'projectB',
  'taskA',
  'attachmentId',
]) {
  assert.match(fixture[field], /^[0-9a-f-]{36}$/)
}
const options = {
  auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false },
  global: { fetch: (url, init) => fetch(url, { ...init, signal: AbortSignal.timeout(20_000) }) },
}
const clients = []
let passed = 0
async function check(label, operation) {
  await operation()
  passed++
  console.log(`PASS ${label}`)
}
async function signIn(account) {
  const client = createClient(config.url, config.publishableKey, options)
  clients.push(client)
  assert.match(account.email, /^devflow-[0-9a-f-]+-(ownera|ownerb|membera)@example\.test$/)
  const result = await client.auth.signInWithPassword({
    email: account.email,
    password: account.password,
  })
  assert.equal(result.error, null, 'Development account sign-in failed')
  assert.equal(result.data.user.id, account.id)
  return client
}
const anon = createClient(config.url, config.publishableKey, options)
let owner
let member
let agencyUploaded = false
let avatarUploaded = false
const text = 'DevFlow live test\n'
const png = Buffer.from(
  'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+a6L0AAAAASUVORK5CYII=',
  'base64',
)
try {
  owner = await signIn(fixture.ownerA)
  const foreign = await signIn(fixture.ownerB)
  member = await signIn(fixture.memberA)
  await check('Auth HTTP issues and validates sessions for three isolated accounts', async () => {
    for (const client of clients) assert.equal((await client.auth.getUser()).error, null)
  })
  await check('Auth profile trigger creates a readable profile', async () => {
    const result = await member
      .from('profiles')
      .select('id, display_name')
      .eq('id', fixture.memberA.id)
      .single()
    assert.equal(result.error, null)
    assert.equal(result.data.display_name, '[INTEGRATION TEST]')
  })
  await check('Owner reads its organization through Data API', async () => {
    const result = await owner
      .from('organizations')
      .select('id')
      .eq('id', fixture.organizationA)
      .single()
    assert.equal(result.error, null)
    assert.equal(result.data.id, fixture.organizationA)
  })
  await check('Foreign owner cannot read or modify the task', async () => {
    const read = await foreign.from('tasks').select('id').eq('id', fixture.taskA)
    assert.equal(read.error, null)
    assert.deepEqual(read.data, [])
    const update = await foreign
      .from('tasks')
      .update({ title: 'Forbidden' })
      .eq('id', fixture.taskA)
      .select('id')
    assert.equal(update.error, null)
    assert.deepEqual(update.data, [])
  })
  await check('Assigned member updates its project task with RETURNING', async () => {
    const result = await member
      .from('tasks')
      .update({ title: '[INTEGRATION TEST] updated' })
      .eq('id', fixture.taskA)
      .select('id, title')
      .single()
    assert.equal(result.error, null)
    assert.equal(result.data.title, '[INTEGRATION TEST] updated')
  })
  await check('Member cannot promote its organization role', async () => {
    const result = await member
      .from('organization_members')
      .update({ role: 'owner' })
      .eq('user_id', fixture.memberA.id)
    assert.equal(result.error?.code, '42501')
  })
  await check('Owner cannot change a task tenant column', async () => {
    const result = await owner
      .from('tasks')
      .update({ organization_id: fixture.organizationB })
      .eq('id', fixture.taskA)
    assert.equal(result.error?.code, '42501')
  })
  await check('Member cannot insert into a foreign organization', async () => {
    const result = await member.from('tasks').insert({
      organization_id: fixture.organizationB,
      project_id: fixture.projectB,
      title: '[INTEGRATION TEST] forbidden',
      created_by: fixture.memberA.id,
    })
    assert.equal(result.error?.code, '42501')
  })
  await check('Invitations remain server-only after login', async () => {
    assert.equal((await owner.from('organization_invitations').select('id')).error?.code, '42501')
  })
  await check('Storage uploads a physical agency file with registered metadata', async () => {
    const result = await owner.storage
      .from('agency-files')
      .upload(fixture.storagePath, text, { contentType: 'text/plain', upsert: false })
    assert.equal(result.error, null)
    agencyUploaded = true
  })
  await check('Assigned member downloads the same physical bytes', async () => {
    const result = await member.storage.from('agency-files').download(fixture.storagePath)
    assert.equal(result.error, null)
    assert.equal(await result.data.text(), text)
  })
  await check('Foreign and anonymous downloads are denied', async () => {
    for (const client of [foreign, anon]) {
      const result = await client.storage.from('agency-files').download(fixture.storagePath)
      assert.ok(result.error)
      assert.equal(result.data, null)
    }
  })
  await check('Public object URL cannot expose a private file', async () => {
    const { data } = anon.storage.from('agency-files').getPublicUrl(fixture.storagePath)
    const response = await fetch(data.publicUrl, { signal: AbortSignal.timeout(20_000) })
    assert.equal(response.ok, false)
  })
  await check('Upload without registered attachment metadata is denied', async () => {
    assert.ok(
      (
        await owner.storage
          .from('agency-files')
          .upload(`${fixture.organizationA}/${randomUUID()}`, text, { contentType: 'text/plain' })
      ).error,
    )
  })
  await check('Storage rejects overwrite via upsert', async () => {
    assert.ok(
      (
        await owner.storage
          .from('agency-files')
          .upload(fixture.storagePath, 'Forbidden overwrite', {
            contentType: 'text/plain',
            upsert: true,
          })
      ).error,
    )
    const result = await owner.storage.from('agency-files').download(fixture.storagePath)
    assert.equal(await result.data.text(), text)
  })
  await check('Storage rejects cross-organization deletion', async () => {
    const removed = await foreign.storage.from('agency-files').remove([fixture.storagePath])
    assert.ok(removed.error || removed.data.length === 0)
    assert.equal(
      (await owner.storage.from('agency-files').download(fixture.storagePath)).error,
      null,
    )
  })
  await check('Avatar owner uploads a physical image', async () => {
    const result = await member.storage
      .from('avatars')
      .upload(fixture.avatarPath, png, { contentType: 'image/png' })
    assert.equal(result.error, null)
    avatarUploaded = true
    assert.equal(
      (
        await member
          .from('profiles')
          .update({ avatar_path: fixture.avatarPath })
          .eq('id', fixture.memberA.id)
      ).error,
      null,
    )
  })
  await check('Active colleague reads current avatar, foreign owner cannot', async () => {
    const read = await owner.storage.from('avatars').download(fixture.avatarPath)
    assert.equal(read.error, null)
    assert.deepEqual(Buffer.from(await read.data.arrayBuffer()), png)
    assert.ok((await foreign.storage.from('avatars').download(fixture.avatarPath)).error)
  })
  await check('Storage enforces the 2 MiB avatar limit', async () => {
    const result = await member.storage
      .from('avatars')
      .upload(`${fixture.memberA.id}/${randomUUID()}.png`, new Uint8Array(2 * 1024 * 1024 + 1), {
        contentType: 'image/png',
      })
    assert.ok(result.error)
    assert.equal(String(result.error.statusCode), '413')
  })
  await check('Storage rejects an unsupported MIME type', async () => {
    const result = await member.storage
      .from('avatars')
      .upload(`${fixture.memberA.id}/${randomUUID()}.png`, text, { contentType: 'text/plain' })
    assert.ok(result.error)
    assert.equal(String(result.error.statusCode), '415')
  })
  console.log(`PASS ${passed} live integration checks.`)
} catch {
  // Assertion details may contain access tokens or response bodies; never log them.
  console.error(
    `FAIL Live integration stopped after ${passed} successful checks. The last printed label identifies the preceding successful step.`,
  )
  process.exitCode = 1
} finally {
  for (const [client, bucket, path, uploaded] of [
    [owner, 'agency-files', fixture.storagePath, agencyUploaded],
    [member, 'avatars', fixture.avatarPath, avatarUploaded],
  ]) {
    if (uploaded) {
      const result = await client.storage.from(bucket).remove([path])
      if (result.error || result.data.length !== 1) {
        console.error(
          `FAIL Cleanup of test object in ${bucket}; administrative cleanup is required.`,
        )
        process.exitCode = 1
      }
    }
  }
  for (const client of [...clients, anon]) {
    await client.auth.signOut({ scope: 'local' })
    await client.auth.stopAutoRefresh()
  }
}
