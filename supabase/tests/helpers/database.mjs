import { readFile, readdir } from 'node:fs/promises'
import { PGlite } from '@electric-sql/pglite'

export const tables = [
  'profiles',
  'organizations',
  'organization_members',
  'organization_invitations',
  'clients',
  'projects',
  'project_members',
  'tasks',
  'task_comments',
  'time_entries',
  'quotes',
  'quote_items',
  'attachments',
  'notifications',
  'activity_logs',
]

export async function createTestDatabase({ through } = {}) {
  const db = await PGlite.create()
  try {
    await db.exec(await readFile(new URL('../fixtures/bootstrap.sql', import.meta.url), 'utf8'))
    const directory = new URL('../../migrations/', import.meta.url)
    const migrations = (await readdir(directory))
      .filter((file) => /^\d{14}_.+\.sql$/.test(file))
      .sort()
    if (migrations.length === 0) throw new Error('No versioned migrations found')
    if (through && !migrations.includes(through)) throw new Error('Requested migration not found')
    for (const migration of migrations) {
      await db.exec(await readFile(new URL(migration, directory), 'utf8'))
      if (migration === through) break
    }
    await db.exec(await readFile(new URL('../fixtures/agency.sql', import.meta.url), 'utf8'))
    return db
  } catch (error) {
    await db.close()
    throw error
  }
}

export async function inRollback(db, operation) {
  await db.exec('begin')
  try {
    return await operation(db)
  } finally {
    await db.exec('rollback')
  }
}

export async function expectSqlError(db, assert, query, code, parameters = []) {
  await db.exec('savepoint expected_error')
  try {
    await assert.rejects(db.query(query, parameters), (error) => {
      assert.ok((Array.isArray(code) ? code : [code]).includes(error.code), error.message)
      return true
    })
  } finally {
    await db.exec('rollback to savepoint expected_error; release savepoint expected_error')
  }
}
