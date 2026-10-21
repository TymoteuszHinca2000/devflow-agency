import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import { after, before, describe, it } from 'node:test'
import {
  createTestDatabase as createMigratedDatabase,
  expectSqlError,
  inRollback,
  tables,
} from './helpers/database.mjs'

// Keep proving the secure baseline before the additive role/Storage migration.
const createTestDatabase = () =>
  createMigratedDatabase({ through: '20261021000100_create_agency_schema.sql' })

const userA = '10000000-0000-4000-8000-000000000001'
const userB = '10000000-0000-4000-8000-000000000002'
const memberA = '10000000-0000-4000-8000-000000000003'
const orgA = '20000000-0000-4000-8000-000000000001'
const orgB = '20000000-0000-4000-8000-000000000002'
const clientA = '30000000-0000-4000-8000-000000000001'
const clientB = '30000000-0000-4000-8000-000000000002'
const otherClientA = '30000000-0000-4000-8000-000000000003'
const projectA = '40000000-0000-4000-8000-000000000001'
const projectB = '40000000-0000-4000-8000-000000000002'
const otherProjectA = '40000000-0000-4000-8000-000000000003'
const taskA = '50000000-0000-4000-8000-000000000001'
const taskB = '50000000-0000-4000-8000-000000000002'
const quoteA = '60000000-0000-4000-8000-000000000001'
const quoteB = '60000000-0000-4000-8000-000000000002'

describe('Foundational agency schema (first migration)', () => {
  let db
  before(async () => {
    db = await createTestDatabase()
  })
  after(async () => {
    await db?.close()
  })

  function scenario(name, operation) {
    it(name, () =>
      inRollback(db, () =>
        operation({
          query: (sql, values) => db.query(sql, values),
          reject: (sql, code, values) => expectSqlError(db, assert, sql, code, values),
        }),
      ),
    )
  }

  scenario(
    'applies the initial migration and creates 15 tables with UUID identity, timestamps and RLS',
    async ({ query }) => {
      const result = await query(`
      select table_name, column_name, data_type, is_nullable, column_default
      from information_schema.columns where table_schema = 'public'
      order by table_name, ordinal_position
    `)
      assert.deepEqual(
        [...new Set(result.rows.map((row) => row.table_name))].sort(),
        [...tables].sort(),
      )
      for (const table of tables) {
        const columns = result.rows.filter((row) => row.table_name === table)
        assert.equal(columns.find((column) => column.column_name === 'id').data_type, 'uuid', table)
        for (const timestamp of ['created_at', 'updated_at']) {
          const column = columns.find((entry) => entry.column_name === timestamp)
          assert.equal(column.data_type, 'timestamp with time zone', table)
          assert.equal(column.is_nullable, 'NO', table)
          assert.ok(column.column_default, table)
        }
      }
      const security = await query(`
      select relname, relrowsecurity from pg_class
      where relnamespace = 'public'::regnamespace and relkind = 'r'
    `)
      assert.equal(security.rows.length, 15)
      assert.ok(security.rows.every((row) => row.relrowsecurity))
    },
  )

  scenario(
    'backfills existing Auth profiles and creates a profile for a new account without assigning roles',
    async ({ query }) => {
      const before = await query('select display_name from public.profiles where id = $1', [userA])
      assert.equal(before.rows[0].display_name, 'Owner A')
      const id = '10000000-0000-4000-8000-000000000099'
      await query('insert into auth.users (id, email, raw_user_meta_data) values ($1, $2, $3)', [
        id,
        'metadata@example.test',
        { display_name: 'x'.repeat(200), role: 'owner', organization_id: orgA },
      ])
      const profile = await query('select display_name from public.profiles where id = $1', [id])
      assert.equal(profile.rows[0].display_name.length, 120)
      assert.equal(
        (
          await query(
            'select count(*)::int as count from public.organization_members where user_id = $1',
            [id],
          )
        ).rows[0].count,
        0,
      )
    },
  )

  scenario(
    'does not permit anonymous or authenticated access by default',
    async ({ query, reject }) => {
      for (const role of ['anon', 'authenticated']) {
        await query(`set local role ${role}`)
        for (const table of tables) {
          await reject(`select id from public.${table}`, '42501')
        }
        await reject('insert into public.profiles (id) values ($1)', '42501', [userA])
        await reject("update public.clients set name = 'Unauthorized' where id = $1", '42501', [
          clientA,
        ])
        await reject('delete from public.clients where id = $1', '42501', [clientA])
        // TRUNCATE is not protected by RLS, so its table privilege must also be absent.
        await reject(`truncate ${tables.map((table) => `public.${table}`).join(', ')}`, '42501')
        await reject('select private.create_user_profile()', '42501')
        await query('reset role')
      }
    },
  )

  scenario(
    'RLS still hides rows if a table read grant is accidentally restored',
    async ({ query }) => {
      await query('grant select on all tables in schema public to authenticated')
      await query('set local role authenticated')
      for (const table of tables) {
        assert.equal(
          (await query(`select count(*)::int as count from public.${table}`)).rows[0].count,
          0,
          table,
        )
      }
      await query('reset role')
    },
  )

  scenario(
    'keeps tenant identity and creation time immutable and maintains update time',
    async ({ query, reject }) => {
      await reject('update public.clients set organization_id = $1 where id = $2', '23514', [
        orgB,
        clientA,
      ])
      await reject('update public.clients set id = gen_random_uuid() where id = $1', '23514', [
        clientA,
      ])
      await reject("update public.clients set created_at = '2000-01-01' where id = $1", '23514', [
        clientA,
      ])
      const updated = await query(
        "update public.clients set name = 'Renamed', updated_at = '2000-01-01' where id = $1 returning created_at, updated_at",
        [clientA],
      )
      assert.ok(updated.rows[0].updated_at >= updated.rows[0].created_at)
      assert.equal(updated.rows[0].updated_at.getUTCFullYear(), new Date().getUTCFullYear())
    },
  )

  const invalidRelations = [
    [
      "a project with another organization's client",
      'insert into public.projects (organization_id, client_id, name, created_by) values ($1, $2, $3, $4)',
      [orgA, clientB, 'Invalid', userA],
    ],
    [
      'a client portal member with a foreign client',
      "insert into public.organization_members (organization_id, user_id, role, client_id) values ($1, $2, 'client', $3)",
      [orgA, userB, clientB],
    ],
    [
      'an invitation with a foreign client',
      "insert into public.organization_invitations (organization_id, email, role, client_id, token_hash, invited_by) values ($1, 'invite@example.test', 'client', $2, decode(repeat('ab', 32), 'hex'), $3)",
      [orgA, clientB, userA],
    ],
    [
      'a project membership linked to a foreign project',
      'insert into public.project_members (organization_id, project_id, user_id) values ($1, $2, $3)',
      [orgA, projectB, userA],
    ],
    [
      'a project membership without organization membership',
      'insert into public.project_members (organization_id, project_id, user_id) values ($1, $2, $3)',
      [orgA, projectA, userB],
    ],
    [
      'a task linked to a foreign project',
      'insert into public.tasks (organization_id, project_id, title, created_by) values ($1, $2, $3, $4)',
      [orgA, projectB, 'Invalid', userA],
    ],
    [
      'a subtask linked to a different project',
      'insert into public.tasks (organization_id, project_id, parent_task_id, title, created_by) values ($1, $2, $3, $4, $5)',
      [orgA, otherProjectA, taskA, 'Invalid', userA],
    ],
    [
      'a task assignee outside the project team',
      'update public.tasks set assigned_to = $1 where id = $2',
      [memberA, taskA],
    ],
    [
      'a comment linked to a foreign task',
      'insert into public.task_comments (organization_id, task_id, author_id, body) values ($1, $2, $3, $4)',
      [orgA, taskB, userA, 'Invalid'],
    ],
    [
      'a time entry linked to a foreign project',
      "insert into public.time_entries (organization_id, project_id, user_id, started_at) values ($1, $2, $3, '2026-01-01T10:00Z')",
      [orgA, projectB, userA],
    ],
    [
      'a time entry linked to a task in a different project',
      "insert into public.time_entries (organization_id, project_id, task_id, user_id, started_at) values ($1, $2, $3, $4, '2026-01-01T10:00Z')",
      [orgA, otherProjectA, taskA, userA],
    ],
    [
      'a quote whose client differs from the project client',
      'insert into public.quotes (organization_id, client_id, project_id, number, title, created_by) values ($1, $2, $3, $4, $5, $6)',
      [orgA, otherClientA, projectA, 'INVALID', 'Invalid', userA],
    ],
    [
      'a quote item linked to a foreign quote',
      'insert into public.quote_items (organization_id, quote_id, description, quantity, unit_price) values ($1, $2, $3, 1, 10)',
      [orgA, quoteB, 'Invalid'],
    ],
    [
      'an attachment linked to a foreign project',
      "insert into public.attachments (organization_id, project_id, uploaded_by, file_name, mime_type, size_bytes) values ($1, $2, $3, 'file.pdf', 'application/pdf', 100)",
      [orgA, projectB, userA],
    ],
    [
      'an attachment linked to a foreign quote',
      "insert into public.attachments (organization_id, quote_id, uploaded_by, file_name, mime_type, size_bytes) values ($1, $2, $3, 'file.pdf', 'application/pdf', 100)",
      [orgA, quoteB, userA],
    ],
    [
      'an attachment linked to a task outside its project',
      "insert into public.attachments (organization_id, project_id, task_id, uploaded_by, file_name, mime_type, size_bytes) values ($1, $2, $3, $4, 'file.pdf', 'application/pdf', 100)",
      [orgA, projectA, taskB, userA],
    ],
    [
      'a notification addressed outside its organization',
      "insert into public.notifications (organization_id, recipient_id, kind, title) values ($1, $2, 'test', 'Invalid')",
      [orgA, userB],
    ],
  ]

  for (const [name, sql, values] of invalidRelations) {
    scenario(`rejects ${name}`, async ({ reject }) => {
      await reject(sql, '23503', values)
    })
  }

  scenario('accepts valid relations through all application tables', async ({ query }) => {
    await query(
      "insert into public.organization_invitations (organization_id, email, token_hash, invited_by) values ($1, 'invite@example.test', decode(repeat('ab', 32), 'hex'), $2)",
      [orgA, userA],
    )
    await query(
      'insert into public.task_comments (organization_id, task_id, author_id, body) values ($1, $2, $3, $4)',
      [orgA, taskA, userA, 'A real comment'],
    )
    await query(
      "insert into public.time_entries (organization_id, project_id, task_id, user_id, started_at, ended_at) values ($1, $2, $3, $4, '2026-01-01T10:00Z', '2026-01-01T11:00Z')",
      [orgA, projectA, taskA, userA],
    )
    await query(
      'insert into public.quote_items (organization_id, quote_id, description, quantity, unit_price) values ($1, $2, $3, 1, 10)',
      [orgA, quoteA, 'Development'],
    )
    const attachment = await query(
      "insert into public.attachments (organization_id, project_id, task_id, uploaded_by, file_name, mime_type, size_bytes) values ($1, $2, $3, $4, 'file.pdf', 'application/pdf', 100) returning id, storage_path",
      [orgA, projectA, taskA, userA],
    )
    assert.equal(attachment.rows[0].storage_path, `${orgA}/${attachment.rows[0].id}`)
    await query(
      "insert into public.notifications (organization_id, recipient_id, kind, title) values ($1, $2, 'task.assigned', 'Assignment')",
      [orgA, userA],
    )
    await query(
      "insert into public.activity_logs (organization_id, actor_id, entity_type, entity_id, action) values ($1, $2, 'task', $3, 'task.created')",
      [orgA, userA, taskA],
    )
    for (const table of tables) {
      assert.ok(
        (await query(`select count(*)::int as count from public.${table}`)).rows[0].count > 0,
        table,
      )
    }
  })

  scenario(
    'prevents orphaning a project or deleting an organization with business records',
    async ({ reject }) => {
      // PostgreSQL 17 reports foreign_key_violation; 18 may report restrict_violation.
      await reject('delete from public.clients where id = $1', ['23503', '23001'], [clientA])
      await reject('delete from public.projects where id = $1', ['23503', '23001'], [projectA])
      await reject('delete from public.organizations where id = $1', ['23503', '23001'], [orgA])
    },
  )

  scenario(
    'rejects self-parenting and multi-level task cycles while accepting valid subtasks',
    async ({ query, reject }) => {
      await reject('update public.tasks set parent_task_id = id where id = $1', '23514', [taskA])
      const child = await query(
        'insert into public.tasks (organization_id, project_id, parent_task_id, title, created_by) values ($1, $2, $3, $4, $5) returning id',
        [orgA, projectA, taskA, 'Child', userA],
      )
      const grandchild = await query(
        'insert into public.tasks (organization_id, project_id, parent_task_id, title, created_by) values ($1, $2, $3, $4, $5) returning id',
        [orgA, projectA, child.rows[0].id, 'Grandchild', userA],
      )
      await reject('update public.tasks set parent_task_id = $1 where id = $2', '23514', [
        grandchild.rows[0].id,
        taskA,
      ])
    },
  )

  scenario(
    'allows only one running timer per user, then permits the next after stopping',
    async ({ query, reject }) => {
      const timer = await query(
        "insert into public.time_entries (organization_id, project_id, user_id, started_at) values ($1, $2, $3, '2026-01-01T10:00Z') returning id",
        [orgA, projectA, userA],
      )
      await reject(
        "insert into public.time_entries (organization_id, project_id, user_id, started_at) values ($1, $2, $3, '2026-01-01T11:00Z')",
        '23505',
        [orgA, projectA, userA],
      )
      await query("update public.time_entries set ended_at = '2026-01-01T11:00Z' where id = $1", [
        timer.rows[0].id,
      ])
      await query(
        "insert into public.time_entries (organization_id, project_id, user_id, started_at) values ($1, $2, $3, '2026-01-01T11:00Z')",
        [orgA, projectA, userA],
      )
    },
  )

  scenario('rejects zero-length and negative time intervals', async ({ reject }) => {
    for (const end of ['2026-01-01T10:00Z', '2026-01-01T09:00Z']) {
      await reject(
        "insert into public.time_entries (organization_id, project_id, user_id, started_at, ended_at) values ($1, $2, $3, '2026-01-01T10:00Z', $4)",
        '23514',
        [orgA, projectA, userA, end],
      )
    }
  })

  scenario(
    'prevents a second running timer even when the user switches organizations',
    async ({ query, reject }) => {
      await query(
        'insert into public.organization_members (organization_id, user_id) values ($1, $2)',
        [orgB, userA],
      )
      await query(
        'insert into public.project_members (organization_id, project_id, user_id) values ($1, $2, $3)',
        [orgB, projectB, userA],
      )
      await query(
        "insert into public.time_entries (organization_id, project_id, user_id, started_at) values ($1, $2, $3, '2026-01-01T10:00Z')",
        [orgA, projectA, userA],
      )
      await reject(
        "insert into public.time_entries (organization_id, project_id, user_id, started_at) values ($1, $2, $3, '2026-01-01T11:00Z')",
        '23505',
        [orgB, projectB, userA],
      )
    },
  )

  scenario(
    'calculates quote lines with exact decimal arithmetic and server-owned totals',
    async ({ query, reject }) => {
      for (const [quantity, price, total, position] of [
        ['3', '0.10', '0.30', 0],
        ['1.005', '1.00', '1.01', 1],
        ['1.250', '10.01', '12.51', 2],
      ]) {
        const item = await query(
          'insert into public.quote_items (organization_id, quote_id, description, quantity, unit_price, position) values ($1, $2, $3, $4, $5, $6) returning line_total',
          [orgA, quoteA, 'Development', quantity, price, position],
        )
        assert.equal(item.rows[0].line_total, total)
      }
      await reject('update public.quote_items set line_total = 0 where quote_id = $1', '428C9', [
        quoteA,
      ])
    },
  )

  scenario(
    'rejects negative, non-finite and zero quote quantities and negative budgets',
    async ({ reject }) => {
      for (const quantity of ['0', '-1', 'NaN', 'Infinity']) {
        const code = quantity === 'Infinity' ? '22003' : '23514'
        await reject(
          'insert into public.quote_items (organization_id, quote_id, description, quantity, unit_price) values ($1, $2, $3, $4, 1)',
          code,
          [orgA, quoteA, 'Invalid', quantity],
        )
      }
      for (const value of ['-1', 'NaN']) {
        await reject('update public.projects set budget = $1 where id = $2', '23514', [
          value,
          projectA,
        ])
        await reject(
          'insert into public.quote_items (organization_id, quote_id, description, quantity, unit_price) values ($1, $2, $3, 1, $4)',
          '23514',
          [orgA, quoteA, 'Invalid', value],
        )
      }
    },
  )

  scenario(
    'keeps quote numbers unique within an organization and validates project dates',
    async ({ reject }) => {
      await reject(
        'insert into public.quotes (organization_id, client_id, number, title, created_by) values ($1, $2, $3, $4, $5)',
        '23505',
        [orgA, clientA, 'TEST/001', 'Duplicate', userA],
      )
      await reject(
        "update public.projects set starts_on = '2026-02-01', due_on = '2026-01-01' where id = $1",
        '23514',
        [projectA],
      )
      await reject('update public.quotes set valid_until = issued_on - 1 where id = $1', '23514', [
        quoteA,
      ])
    },
  )

  scenario('requires an explicit client relationship for client roles only', async ({ reject }) => {
    await reject(
      "insert into public.organization_members (organization_id, user_id, role) values ($1, $2, 'client')",
      '23514',
      [orgA, userB],
    )
    await reject(
      'update public.organization_members set client_id = $1 where organization_id = $2 and user_id = $3',
      '23514',
      [clientA, orgA, userA],
    )
  })

  scenario(
    'stores only invitation digests and prevents duplicate pending invitations',
    async ({ query, reject }) => {
      const sql =
        'insert into public.organization_invitations (organization_id, email, token_hash, invited_by) values ($1, $2, $3, $4)'
      await reject(sql, '23514', [orgA, 'invited@example.test', new Uint8Array(16), userA])
      await query(sql, [orgA, 'invited@example.test', new Uint8Array(32).fill(1), userA])
      await reject(sql, '23505', [orgA, 'invited@example.test', new Uint8Array(32).fill(2), userA])
      await query(
        'update public.organization_invitations set revoked_at = now() where organization_id = $1',
        [orgA],
      )
      await query(sql, [orgA, 'invited@example.test', new Uint8Array(32).fill(2), userA])
    },
  )

  scenario(
    'validates attachment scope, size, file name and generated object path',
    async ({ query, reject }) => {
      const sql =
        'insert into public.attachments (organization_id, project_id, quote_id, uploaded_by, file_name, mime_type, size_bytes) values ($1, $2, $3, $4, $5, $6, $7)'
      for (const [project, quote] of [
        [null, null],
        [projectA, quoteA],
      ]) {
        await reject(sql, '23514', [
          orgA,
          project,
          quote,
          userA,
          'file.pdf',
          'application/pdf',
          100,
        ])
      }
      for (const size of [0, -1, 20971521]) {
        await reject(sql, '23514', [
          orgA,
          projectA,
          null,
          userA,
          'file.pdf',
          'application/pdf',
          size,
        ])
      }
      for (const name of ['../file.pdf', 'folder\\file.pdf']) {
        await reject(sql, '23514', [orgA, projectA, null, userA, name, 'application/pdf', 100])
      }
      await query(sql, [orgA, projectA, null, userA, 'file.pdf', 'application/pdf', 20971520])
      await reject('update public.attachments set storage_path = $1', '428C9', ['foreign/object'])
    },
  )

  scenario('indexes every foreign key on its leading columns', async ({ query }) => {
    const result = await query(`
      select conrelid::regclass::text as relation, conname
      from pg_constraint constraint_row
      where contype = 'f' and connamespace = 'public'::regnamespace
        and not exists (
          select 1 from pg_index index_row
          where index_row.indrelid = constraint_row.conrelid
            and index_row.indisvalid and index_row.indpred is null
            and array(select unnest(index_row.indkey::smallint[]) limit cardinality(constraint_row.conkey))
              = constraint_row.conkey
        )
    `)
    assert.deepEqual(result.rows, [])
  })
})

describe('Explicit development seed', () => {
  it('refuses to run without an explicit development environment', async () => {
    const db = await createTestDatabase()
    try {
      await assert.rejects(
        db.exec(await readFile(new URL('../seed.sql', import.meta.url), 'utf8')),
        /Seed requires devflow.environment/,
      )
      await db.exec('rollback')
      assert.equal(
        (
          await db.query(
            "select count(*)::int as count from public.organizations where slug = 'demo-development-agency'",
          )
        ).rows[0].count,
        0,
      )
    } finally {
      await db.close()
    }
  })

  it('requires an existing Auth user and never creates credentials', async () => {
    const db = await createTestDatabase()
    try {
      await db.exec("set devflow.environment = 'development'")
      await assert.rejects(
        db.exec(await readFile(new URL('../seed.sql', import.meta.url), 'utf8')),
        /Seed requires devflow.seed_user_id/,
      )
      await db.exec('rollback')
      assert.equal(
        (await db.query('select count(*)::int as count from auth.users')).rows[0].count,
        4,
      )
    } finally {
      await db.close()
    }
  })

  it('creates clearly marked development data only on request and refuses to overwrite it', async () => {
    const db = await createTestDatabase()
    try {
      await db.query(
        "select set_config('devflow.environment', 'development', false), set_config('devflow.seed_user_id', $1, false)",
        [userA],
      )
      const seed = await readFile(new URL('../seed.sql', import.meta.url), 'utf8')
      await db.exec(seed)
      const organization = await db.query(
        "select id, name from public.organizations where slug = 'demo-development-agency'",
      )
      assert.equal(organization.rows.length, 1)
      assert.ok(organization.rows[0].name.startsWith('[DEMO]'))
      const member = await db.query(
        'select role from public.organization_members where organization_id = $1 and user_id = $2',
        [organization.rows[0].id, userA],
      )
      assert.equal(member.rows[0].role, 'owner')
      await assert.rejects(db.exec(seed), /Development seed already exists/)
      await db.exec('rollback')
      assert.equal(
        (
          await db.query(
            'select count(*)::int as count from public.tasks where organization_id = $1',
            [organization.rows[0].id],
          )
        ).rows[0].count,
        1,
      )
    } finally {
      await db.close()
    }
  })
})
