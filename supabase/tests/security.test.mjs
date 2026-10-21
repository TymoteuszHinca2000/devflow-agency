import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import { after, before, describe, it } from 'node:test'
import { createTestDatabase, expectSqlError, inRollback, tables } from './helpers/database.mjs'

const id = (prefix, number) => `${prefix}0000000-0000-4000-8000-${String(number).padStart(12, '0')}`
const owner = id('1', 1)
const foreignOwner = id('1', 2)
const member = id('1', 3)
const outsider = id('1', 4)
const admin = id('1', 5)
const client = id('1', 6)
const suspended = id('1', 7)
const unassigned = id('1', 8)
const colleague = id('1', 9)
const org = id('2', 1)
const foreignOrg = id('2', 2)
const project = id('4', 1)
const foreignProject = id('4', 2)
const hiddenProject = id('4', 3)
const task = id('5', 1)
const quote = id('6', 1)
const sentQuote = id('6', 3)
const objectPath = (number, organization = org) => `${organization}/${id('a', number)}`
const avatarPath = (user, number = 1) => `${user}/${id('b', number)}.png`

describe('Role policies and private Storage (complete migration chain)', () => {
  let db
  before(async () => {
    db = await createTestDatabase()
    await db.exec(await readFile(new URL('./fixtures/security.sql', import.meta.url), 'utf8'))
  })
  after(async () => {
    await db?.close()
  })

  async function signIn(user) {
    await db.exec('reset role')
    if (!user) return
    const role = ['anon', 'authenticated', 'service_role'].includes(user) ? user : 'authenticated'
    const subject = role === 'authenticated' && user !== 'authenticated' ? user : ''
    await db.query(
      "select set_config('request.jwt.claim.sub', $1, true), set_config('request.jwt.claims', $2, true)",
      [subject, JSON.stringify({ sub: subject, role, user_metadata: { role: 'owner' } })],
    )
    await db.exec(`set local role ${role}`)
  }

  function scenario(name, user, operation) {
    it(name, () =>
      inRollback(db, async () => {
        await signIn(user)
        await operation({
          query: (sql, values) => db.query(sql, values),
          reject: (sql, code, values) => expectSqlError(db, assert, sql, code, values),
          signIn,
        })
      }),
    )
  }

  scenario(
    'upgrades the first schema and preserves all tables with RLS enabled',
    null,
    async ({ query }) => {
      const result = await query(
        "select relname, relrowsecurity from pg_class where relnamespace = 'public'::regnamespace and relkind = 'r'",
      )
      assert.deepEqual(result.rows.map((row) => row.relname).sort(), [...tables].sort())
      assert.ok(result.rows.every((row) => row.relrowsecurity))
      assert.equal(
        (await query('select count(*)::int as count from public.profiles')).rows[0].count,
        9,
      )
      assert.equal(
        (await query('select status from public.project_members limit 1')).rows[0].status,
        'active',
      )
    },
  )

  scenario('creates private buckets with size and MIME restrictions', null, async ({ query }) => {
    const buckets = (await query('select * from storage.buckets order by id')).rows
    assert.deepEqual(
      buckets.map((bucket) => [bucket.id, bucket.public, bucket.file_size_limit]),
      [
        ['agency-files', false, 20971520],
        ['avatars', false, 2097152],
      ],
    )
    assert.ok(buckets[0].allowed_mime_types.includes('application/pdf'))
    assert.deepEqual(buckets[1].allowed_mime_types, ['image/jpeg', 'image/png', 'image/webp'])
  })

  const resources = [
    'clients',
    'projects',
    'tasks',
    'task_comments',
    'time_entries',
    'quotes',
    'quote_items',
    'attachments',
    'activity_logs',
    'notifications',
  ]
  const visibility = [
    ['owner', owner, org, [2, 2, 2, 4, 3, 2, 2, 7, 1, 1], 7, 6],
    ['administrator', admin, org, [2, 2, 2, 4, 3, 2, 2, 7, 1, 0], 7, 6],
    ['assigned employee', member, org, [1, 1, 1, 4, 1, 0, 0, 5, 0, 1], 7, 6],
    ['unassigned employee', unassigned, org, [0, 0, 0, 0, 0, 0, 0, 0, 0, 0], 7, 6],
    ['client account', client, org, [0, 0, 0, 0, 0, 0, 0, 0, 0, 1], 1, 1],
    ['suspended account', suspended, null, [0, 0, 0, 0, 0, 0, 0, 0, 0, 0], 0, 1],
    [
      'unrelated account with forged owner metadata',
      outsider,
      null,
      [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
      0,
      1,
    ],
    [
      'owner of another organization',
      foreignOwner,
      foreignOrg,
      [1, 1, 1, 1, 1, 1, 1, 2, 1, 1],
      1,
      1,
    ],
  ]
  for (const [label, user, organization, counts, memberships, profiles] of visibility) {
    scenario(`limits the exact visible data for ${label}`, user, async ({ query, reject }) => {
      for (let index = 0; index < resources.length; index++) {
        const rows = (await query(`select id, organization_id from public.${resources[index]}`))
          .rows
        assert.equal(rows.length, counts[index], resources[index])
        assert.ok(
          rows.every((row) => row.organization_id === organization),
          resources[index],
        )
      }
      assert.equal(
        (await query('select id from public.organizations')).rows.length,
        organization ? 1 : 0,
      )
      assert.equal(
        (await query('select id from public.organization_members')).rows.length,
        memberships,
      )
      assert.equal((await query('select id from public.profiles')).rows.length, profiles)
      await reject('select token_hash from public.organization_invitations', '42501')
    })
  }

  scenario(
    'denies anonymous reads, writes, private helper calls and table-wide operations',
    'anon',
    async ({ query, reject }) => {
      for (const table of tables) await reject(`select * from public.${table}`, '42501')
      await reject('select private.is_org_manager($1)', '42501', [org])
      await reject(`truncate ${tables.map((table) => `public.${table}`).join(', ')}`, '42501')
      assert.equal((await query('select * from storage.objects')).rows.length, 0)
      await reject(
        'insert into storage.objects (bucket_id, name, owner_id) values ($1, $2, $3)',
        '42501',
        ['avatars', avatarPath(owner, 2), owner],
      )
    },
  )

  scenario(
    'denies business data and writes without an authenticated user identity',
    'authenticated',
    async ({ query, reject }) => {
      for (const table of tables.filter((name) => name !== 'organization_invitations')) {
        assert.equal((await query(`select id from public.${table}`)).rows.length, 0, table)
      }
      await reject(
        'insert into public.clients (organization_id, name, created_by) values ($1, $2, $3)',
        '42501',
        [org, 'Forbidden', owner],
      )
      assert.equal((await query('select * from storage.objects')).rows.length, 0)
    },
  )

  scenario(
    'denies direct portal-client writes even with a project membership and known identifiers',
    client,
    async ({ reject }) => {
      await reject(
        'insert into public.tasks (organization_id, project_id, title, created_by) values ($1, $2, $3, $4)',
        '42501',
        [org, project, 'Forbidden', client],
      )
      await reject(
        'insert into public.task_comments (organization_id, task_id, author_id, body) values ($1, $2, $3, $4)',
        '42501',
        [org, task, client, 'Forbidden'],
      )
      await reject(
        'insert into public.time_entries (organization_id, project_id, user_id, started_at) values ($1, $2, $3, now())',
        '42501',
        [org, project, client],
      )
      await reject(
        "insert into public.attachments (organization_id, project_id, uploaded_by, file_name, mime_type, size_bytes) values ($1, $2, $3, 'forbidden.pdf', 'application/pdf', 100)",
        '42501',
        [org, project, client],
      )
    },
  )

  for (const user of [owner, admin]) {
    scenario(
      `allows manager ${user === owner ? 'owner' : 'admin'} to create, edit and remove a client`,
      user,
      async ({ query }) => {
        const row = (
          await query(
            'insert into public.clients (organization_id, name, created_by) values ($1, $2, $3) returning id',
            [org, 'New Client', user],
          )
        ).rows[0]
        assert.equal(
          (
            await query("update public.clients set name = 'Edited' where id = $1 returning name", [
              row.id,
            ])
          ).rows[0].name,
          'Edited',
        )
        assert.equal(
          (await query('delete from public.clients where id = $1 returning id', [row.id])).rows
            .length,
          1,
        )
      },
    )
  }

  scenario(
    'prevents managers from writing to another organization or forging an author',
    owner,
    async ({ reject, query }) => {
      await reject(
        'insert into public.clients (organization_id, name, created_by) values ($1, $2, $3)',
        '42501',
        [foreignOrg, 'Foreign', owner],
      )
      await reject(
        'insert into public.clients (organization_id, name, created_by) values ($1, $2, $3)',
        '42501',
        [org, 'Forged', member],
      )
      assert.equal(
        (
          await query("update public.clients set name = 'Foreign' where id = $1 returning id", [
            id('3', 2),
          ])
        ).rows.length,
        0,
      )
      assert.equal(
        (await query('delete from public.clients where id = $1 returning id', [id('3', 2)])).rows
          .length,
        0,
      )
    },
  )

  scenario(
    'keeps client management read-only for project employees',
    member,
    async ({ query, reject }) => {
      await reject(
        'insert into public.clients (organization_id, name, created_by) values ($1, $2, $3)',
        '42501',
        [org, 'Forbidden', member],
      )
      assert.equal(
        (
          await query("update public.clients set name = 'Forbidden' where id = $1 returning id", [
            id('3', 1),
          ])
        ).rows.length,
        0,
      )
      assert.equal(
        (await query('delete from public.clients where id = $1 returning id', [id('3', 1)])).rows
          .length,
        0,
      )
    },
  )

  scenario(
    'allows manager project CRUD but keeps membership management server-only',
    admin,
    async ({ query, reject }) => {
      const row = (
        await query(
          'insert into public.projects (organization_id, name, created_by) values ($1, $2, $3) returning id',
          [org, 'New Project', admin],
        )
      ).rows[0]
      assert.equal(
        (
          await query("update public.projects set status = 'active' where id = $1 returning id", [
            row.id,
          ])
        ).rows.length,
        1,
      )
      await reject(
        'insert into public.project_members (organization_id, project_id, user_id) values ($1, $2, $3)',
        '42501',
        [org, row.id, admin],
      )
      assert.equal(
        (await query('delete from public.projects where id = $1 returning id', [row.id])).rows
          .length,
        1,
      )
    },
  )

  scenario('denies project management to employees', member, async ({ query, reject }) => {
    await reject(
      'insert into public.projects (organization_id, name, created_by) values ($1, $2, $3)',
      '42501',
      [org, 'Forbidden', member],
    )
    assert.equal(
      (
        await query("update public.projects set name = 'Forbidden' where id = $1 returning id", [
          project,
        ])
      ).rows.length,
      0,
    )
    assert.equal(
      (await query('delete from public.projects where id = $1 returning id', [project])).rows
        .length,
      0,
    )
  })

  scenario(
    'allows assigned employees to create, edit and delete their tasks',
    member,
    async ({ query }) => {
      const row = (
        await query(
          'insert into public.tasks (organization_id, project_id, title, created_by) values ($1, $2, $3, $4) returning id',
          [org, project, 'My Task', member],
        )
      ).rows[0]
      const edited = await query(
        "update public.tasks set title = 'Edited', status = 'in_progress', assigned_to = $1 where id = $2 returning title",
        [colleague, row.id],
      )
      assert.equal(edited.rows[0].title, 'Edited')
      assert.equal(
        (await query('delete from public.tasks where id = $1 returning id', [row.id])).rows.length,
        1,
      )
    },
  )

  scenario(
    'prevents writes to unassigned projects and forged task authors',
    member,
    async ({ reject, query }) => {
      for (const target of [hiddenProject, foreignProject]) {
        await reject(
          'insert into public.tasks (organization_id, project_id, title, created_by) values ($1, $2, $3, $4)',
          '42501',
          [target === foreignProject ? foreignOrg : org, target, 'Forbidden', member],
        )
      }
      await reject(
        'insert into public.tasks (organization_id, project_id, title, created_by) values ($1, $2, $3, $4)',
        '42501',
        [org, project, 'Forged', owner],
      )
      assert.equal(
        (
          await query("update public.tasks set title = 'Forbidden' where id = $1 returning id", [
            id('5', 3),
          ])
        ).rows.length,
        0,
      )
      assert.equal(
        (await query('delete from public.tasks where id = $1 returning id', [task])).rows.length,
        0,
      )
    },
  )

  scenario(
    'rejects assignment to suspended staff, portal clients and non-team members',
    owner,
    async ({ reject }) => {
      for (const user of [suspended, client, unassigned]) {
        await reject('update public.tasks set assigned_to = $1 where id = $2', '23514', [
          user,
          task,
        ])
      }
    },
  )

  scenario(
    'allows own comments and denies edits to a colleague comment or its visibility',
    member,
    async ({ query, reject }) => {
      const row = (
        await query(
          'insert into public.task_comments (organization_id, task_id, author_id, body) values ($1, $2, $3, $4) returning id',
          [org, task, member, 'New comment'],
        )
      ).rows[0]
      assert.equal(
        (
          await query(
            "update public.task_comments set body = 'Edited' where id = $1 returning id",
            [row.id],
          )
        ).rows.length,
        1,
      )
      assert.equal(
        (
          await query(
            "update public.task_comments set body = 'Forbidden' where id = $1 returning id",
            [id('7', 4)],
          )
        ).rows.length,
        0,
      )
      await reject('update public.task_comments set is_internal = false where id = $1', '42501', [
        row.id,
      ])
      await reject(
        'insert into public.task_comments (organization_id, task_id, author_id, body) values ($1, $2, $3, $4)',
        '42501',
        [org, task, colleague, 'Forged'],
      )
      assert.equal(
        (await query('delete from public.task_comments where id = $1 returning id', [row.id])).rows
          .length,
        1,
      )
    },
  )

  scenario('allows managers to moderate comments', admin, async ({ query }) => {
    assert.equal(
      (
        await query(
          "update public.task_comments set body = 'Moderated' where id = $1 returning id",
          [id('7', 4)],
        )
      ).rows.length,
      1,
    )
    assert.equal(
      (await query('delete from public.task_comments where id = $1 returning id', [id('7', 4)]))
        .rows.length,
      1,
    )
  })

  scenario(
    'allows a personal timer but denies forging another worker or changing rates',
    member,
    async ({ query, reject }) => {
      const row = (
        await query(
          'insert into public.time_entries (organization_id, project_id, user_id, started_at) values ($1, $2, $3, $4) returning id',
          [org, project, member, '2026-02-01T10:00Z'],
        )
      ).rows[0]
      assert.equal(
        (
          await query(
            "update public.time_entries set ended_at = '2026-02-01T11:00Z' where id = $1 returning id",
            [row.id],
          )
        ).rows.length,
        1,
      )
      await reject(
        'insert into public.time_entries (organization_id, project_id, user_id, started_at) values ($1, $2, $3, $4)',
        '42501',
        [org, project, colleague, '2026-02-01T12:00Z'],
      )
      await reject('update public.time_entries set hourly_rate = 1 where id = $1', '42501', [
        row.id,
      ])
      assert.equal(
        (
          await query(
            "update public.time_entries set description = 'Forbidden' where id = $1 returning id",
            [id('8', 3)],
          )
        ).rows.length,
        0,
      )
      assert.equal(
        (await query('delete from public.time_entries where id = $1 returning id', [row.id])).rows
          .length,
        1,
      )
    },
  )

  scenario(
    'permits manager correction of team time without exposing rate writes',
    owner,
    async ({ query, reject }) => {
      assert.equal(
        (
          await query(
            "update public.time_entries set description = 'Corrected' where id = $1 returning id",
            [id('8', 3)],
          )
        ).rows.length,
        1,
      )
      await reject('update public.time_entries set hourly_rate = 1 where id = $1', '42501', [
        id('8', 3),
      ])
    },
  )

  scenario('supports manager draft quotes and exact line totals', admin, async ({ query }) => {
    const row = (
      await query(
        'insert into public.quotes (organization_id, client_id, number, title, created_by) values ($1, $2, $3, $4, $5) returning id, status',
        [org, id('3', 1), 'TEST/NEW', 'Draft', admin],
      )
    ).rows[0]
    assert.equal(row.status, 'draft')
    const item = (
      await query(
        'insert into public.quote_items (organization_id, quote_id, description, quantity, unit_price) values ($1, $2, $3, 3, 0.1) returning id, line_total',
        [org, row.id, 'Work'],
      )
    ).rows[0]
    assert.equal(item.line_total, '0.30')
    assert.equal(
      (
        await query(
          'update public.quote_items set quantity = 4 where id = $1 returning line_total',
          [item.id],
        )
      ).rows[0].line_total,
      '0.40',
    )
    await query('delete from public.quote_items where id = $1', [item.id])
    assert.equal(
      (await query('delete from public.quotes where id = $1 returning id', [row.id])).rows.length,
      1,
    )
  })

  scenario(
    'keeps sent quotes immutable and quote acceptance server-only',
    owner,
    async ({ query, reject }) => {
      assert.equal(
        (
          await query("update public.quotes set title = 'Forbidden' where id = $1 returning id", [
            sentQuote,
          ])
        ).rows.length,
        0,
      )
      assert.equal(
        (await query('delete from public.quotes where id = $1 returning id', [sentQuote])).rows
          .length,
        0,
      )
      await reject("update public.quotes set status = 'accepted' where id = $1", '42501', [quote])
      await reject(
        'insert into public.quote_items (organization_id, quote_id, description, quantity, unit_price, position) values ($1, $2, $3, 1, 1, 1)',
        '42501',
        [org, sentQuote, 'Forbidden'],
      )
      assert.equal(
        (
          await query('update public.quote_items set unit_price = 1 where id = $1 returning id', [
            id('9', 3),
          ])
        ).rows.length,
        0,
      )
      assert.equal(
        (await query('delete from public.quote_items where id = $1 returning id', [id('9', 3)]))
          .rows.length,
        0,
      )
    },
  )

  scenario(
    'denies employee quote writes even within their assigned project',
    member,
    async ({ reject }) => {
      await reject(
        'insert into public.quotes (organization_id, client_id, number, title, created_by) values ($1, $2, $3, $4, $5)',
        '42501',
        [org, id('3', 1), 'FORBIDDEN', 'Forbidden', member],
      )
      await reject(
        'insert into public.quote_items (organization_id, quote_id, description, quantity, unit_price, position) values ($1, $2, $3, 1, 1, 1)',
        '42501',
        [org, quote, 'Forbidden'],
      )
    },
  )

  scenario(
    'permits organization setting changes by managers without membership or ownership writes',
    owner,
    async ({ query, reject }) => {
      assert.equal(
        (
          await query(
            "update public.organizations set name = 'Edited' where id = $1 returning id",
            [org],
          )
        ).rows.length,
        1,
      )
      await reject('update public.organizations set created_by = $1 where id = $2', '42501', [
        member,
        org,
      ])
      await reject('update public.organizations set archived_at = now() where id = $1', '42501', [
        org,
      ])
      await reject('delete from public.organizations where id = $1', '42501', [org])
      await reject(
        "insert into public.organizations (name, slug) values ('Forbidden', 'forbidden')",
        '42501',
      )
      await reject(
        "update public.organization_members set role = 'owner' where user_id = $1",
        '42501',
        [member],
      )
      await reject('delete from public.organization_members where user_id = $1', '42501', [owner])
      await reject(
        'insert into public.organization_members (organization_id, user_id) values ($1, $2)',
        '42501',
        [org, outsider],
      )
    },
  )

  scenario(
    'prevents employee role escalation and organization setting changes',
    member,
    async ({ query, reject }) => {
      assert.equal(
        (
          await query(
            "update public.organizations set name = 'Forbidden' where id = $1 returning id",
            [org],
          )
        ).rows.length,
        0,
      )
      await reject(
        "update public.organization_members set role = 'owner' where user_id = $1",
        '42501',
        [member],
      )
      await reject('update public.project_members set status = $1 where user_id = $2', '42501', [
        'active',
        member,
      ])
      await reject('alter table public.organization_members disable row level security', '42501')
    },
  )

  scenario(
    'lets users update only their profile and their own avatar folder',
    member,
    async ({ query, reject }) => {
      assert.equal(
        (
          await query(
            "update public.profiles set display_name = 'New Name', avatar_path = $1 where id = $2 returning display_name",
            [avatarPath(member, 2), member],
          )
        ).rows[0].display_name,
        'New Name',
      )
      assert.equal(
        (
          await query(
            "update public.profiles set display_name = 'Forbidden' where id = $1 returning id",
            [owner],
          )
        ).rows.length,
        0,
      )
      await reject('update public.profiles set avatar_path = $1 where id = $2', '23514', [
        avatarPath(owner),
        member,
      ])
      await reject("update public.profiles set created_at = '2000-01-01' where id = $1", '42501', [
        member,
      ])
    },
  )

  scenario('allows only personal notification read markers', client, async ({ query, reject }) => {
    assert.equal(
      (
        await query(
          'update public.notifications set read_at = now() where id = $1 returning read_at',
          [id('c', 4)],
        )
      ).rows[0].read_at instanceof Date,
      true,
    )
    assert.equal(
      (
        await query('update public.notifications set read_at = now() where id = $1 returning id', [
          id('c', 1),
        ])
      ).rows.length,
      0,
    )
    await reject("update public.notifications set title = 'Forged' where id = $1", '42501', [
      id('c', 4),
    ])
    await reject(
      "insert into public.notifications (organization_id, recipient_id, kind, title) values ($1, $2, 'test', 'Forged')",
      '42501',
      [org, client],
    )
  })

  scenario(
    'keeps invitations, audit writes and table-wide privileges server-only',
    owner,
    async ({ reject }) => {
      await reject('select * from public.organization_invitations', '42501')
      await reject(
        "insert into public.activity_logs (organization_id, actor_id, entity_type, entity_id, action) values ($1, $2, 'task', $3, 'forged')",
        '42501',
        [org, owner, task],
      )
      await reject('delete from public.activity_logs', '42501')
      await reject('truncate public.tasks cascade', '42501')
      await reject('select private.create_user_profile()', '42501')
      await reject('select private.validate_task_assignment()', '42501')
    },
  )

  scenario(
    'prevents changing tenant, author and project scope through allowed CRUD',
    member,
    async ({ reject }) => {
      for (const [column, value] of [
        ['organization_id', foreignOrg],
        ['created_by', owner],
        ['project_id', hiddenProject],
        ['id', id('5', 99)],
      ]) {
        await reject(`update public.tasks set ${column} = $1 where id = $2`, '42501', [value, task])
      }
    },
  )

  scenario(
    'preserves composite tenant constraints even for a manager of both organizations',
    owner,
    async ({ query, reject, signIn }) => {
      await signIn(null)
      await query(
        "insert into public.organization_members (organization_id, user_id, role) values ($1, $2, 'admin')",
        [foreignOrg, owner],
      )
      await signIn(owner)
      await reject(
        'insert into public.projects (organization_id, client_id, name, created_by) values ($1, $2, $3, $4)',
        '23503',
        [org, id('3', 2), 'Invalid mixed tenant', owner],
      )
    },
  )

  scenario(
    'revokes project access immediately without deleting referenced historical memberships',
    member,
    async ({ query, reject, signIn }) => {
      assert.equal(
        (await query('select id from public.tasks where id = $1', [task])).rows.length,
        1,
      )
      await signIn(null)
      await query(
        "update public.project_members set status = 'suspended' where organization_id = $1 and project_id = $2 and user_id = $3",
        [org, project, member],
      )
      await signIn(member)
      assert.equal((await query('select * from public.tasks')).rows.length, 0)
      assert.equal(
        (await query("select * from storage.objects where bucket_id = 'agency-files'")).rows.length,
        0,
      )
      await reject(
        'insert into public.tasks (organization_id, project_id, title, created_by) values ($1, $2, $3, $4)',
        '42501',
        [org, project, 'Forbidden', member],
      )
      await reject(
        'insert into public.time_entries (organization_id, project_id, user_id, started_at) values ($1, $2, $3, now())',
        '42501',
        [org, project, member],
      )
    },
  )

  scenario(
    'revokes organization access and files immediately after suspension',
    member,
    async ({ query, signIn }) => {
      await signIn(null)
      await query(
        "update public.organization_members set status = 'suspended' where organization_id = $1 and user_id = $2",
        [org, member],
      )
      await signIn(member)
      for (const table of resources)
        assert.equal((await query(`select id from public.${table}`)).rows.length, 0, table)
      assert.equal(
        (await query("select * from storage.objects where bucket_id = 'agency-files'")).rows.length,
        0,
      )
    },
  )

  scenario(
    'removes manager privileges immediately after a database role downgrade',
    admin,
    async ({ query, reject, signIn }) => {
      assert.equal((await query('select * from public.quotes')).rows.length, 2)
      await signIn(null)
      await query(
        "update public.organization_members set role = 'member' where organization_id = $1 and user_id = $2",
        [org, admin],
      )
      await signIn(admin)
      assert.equal((await query('select * from public.quotes')).rows.length, 0)
      assert.equal((await query('select * from public.projects')).rows.length, 0)
      await reject(
        'insert into public.clients (organization_id, name, created_by) values ($1, $2, $3)',
        '42501',
        [org, 'Forbidden', admin],
      )
    },
  )

  scenario(
    'rejects new assignments after project membership suspension while preserving old task history',
    owner,
    async ({ query, reject, signIn }) => {
      await signIn(null)
      await query(
        "update public.project_members set status = 'suspended' where organization_id = $1 and project_id = $2 and user_id = $3",
        [org, project, colleague],
      )
      await signIn(owner)
      await reject('update public.tasks set assigned_to = $1 where id = $2', '23514', [
        colleague,
        task,
      ])
      assert.equal(
        (
          await query(
            "update public.tasks set title = 'History preserved' where id = $1 returning id",
            [task],
          )
        ).rows.length,
        1,
      )
    },
  )

  scenario(
    'does not confuse memberships when one employee joins another organization',
    member,
    async ({ query, signIn }) => {
      await signIn(null)
      await query(
        'insert into public.organization_members (organization_id, user_id) values ($1, $2)',
        [foreignOrg, member],
      )
      await query(
        'insert into public.project_members (organization_id, project_id, user_id) values ($1, $2, $3)',
        [foreignOrg, foreignProject, member],
      )
      await signIn(member)
      assert.deepEqual(
        (await query('select id from public.projects order by id')).rows.map((row) => row.id),
        [project, foreignProject],
      )
      assert.equal((await query('select * from public.quotes')).rows.length, 0)
      assert.equal((await query('select * from public.time_entries')).rows.length, 1)
    },
  )

  scenario(
    'does not trust forged search_path objects when checking memberships',
    null,
    async ({ query, signIn }) => {
      await query('create schema attack')
      await query(
        'create table attack.organization_members as select * from public.organization_members',
      )
      await query(
        "insert into attack.organization_members (organization_id, user_id, role, status) values ($1, $2, 'owner', 'active')",
        [org, outsider],
      )
      await query('grant usage on schema attack to authenticated')
      await signIn(outsider)
      await query('set local search_path = attack, public')
      assert.equal(
        (await query('select private.is_org_manager($1) as allowed', [org])).rows[0].allowed,
        false,
      )
      assert.equal((await query('select * from public.projects')).rows.length, 0)
    },
  )

  scenario(
    'uses locked search paths and grants only policy helpers to authenticated',
    null,
    async ({ query }) => {
      const functions = (
        await query(
          "select oid, proname, proconfig, prosecdef from pg_proc where pronamespace = 'private'::regnamespace",
        )
      ).rows
      for (const fn of functions) {
        assert.ok(fn.proconfig.includes('search_path=""'), fn.proname)
        assert.equal(
          (
            await query('select has_function_privilege($1, $2::oid, $3) as allowed', [
              'anon',
              fn.oid,
              'execute',
            ])
          ).rows[0].allowed,
          false,
          fn.proname,
        )
      }
      assert.equal(
        (await query("select has_schema_privilege('authenticated', 'public', 'create') as allowed"))
          .rows[0].allowed,
        false,
      )
    },
  )

  scenario(
    'permits attachment registration but protects ownership, scope and client visibility',
    member,
    async ({ query, reject }) => {
      const row = (
        await query(
          "insert into public.attachments (organization_id, project_id, uploaded_by, file_name, mime_type, size_bytes) values ($1, $2, $3, 'new.pdf', 'application/pdf', 100) returning id",
          [org, project, member],
        )
      ).rows[0]
      assert.equal(
        (
          await query(
            "update public.attachments set file_name = 'renamed.pdf' where id = $1 returning id",
            [row.id],
          )
        ).rows.length,
        1,
      )
      await reject(
        'update public.attachments set is_client_visible = true where id = $1',
        '42501',
        [row.id],
      )
      await reject('update public.attachments set uploaded_by = $1 where id = $2', '42501', [
        owner,
        row.id,
      ])
      await reject('update public.attachments set project_id = $1 where id = $2', '42501', [
        hiddenProject,
        row.id,
      ])
      await reject('delete from public.attachments where id = $1', '42501', [row.id])
      await reject(
        "insert into public.attachments (organization_id, project_id, uploaded_by, file_name, mime_type, size_bytes, is_client_visible) values ($1, $2, $3, 'new.pdf', 'application/pdf', 100, true)",
        '42501',
        [org, project, member],
      )
    },
  )

  scenario(
    'allows managers to change sharing metadata without opening the future portal',
    owner,
    async ({ query, signIn }) => {
      assert.equal(
        (
          await query(
            'update public.attachments set is_client_visible = true where id = $1 returning id',
            [id('a', 1)],
          )
        ).rows.length,
        1,
      )
      await signIn(client)
      assert.equal((await query('select * from public.attachments')).rows.length, 0)
      assert.equal(
        (await query("select * from storage.objects where bucket_id = 'agency-files'")).rows.length,
        0,
      )
    },
  )

  scenario(
    'reads project files but hides unassigned projects, finance files and foreign organizations',
    member,
    async ({ query }) => {
      assert.deepEqual(
        (
          await query(
            "select name from storage.objects where bucket_id = 'agency-files' order by name",
          )
        ).rows.map((row) => row.name),
        [objectPath(1), objectPath(5), objectPath(6)],
      )
      assert.equal(
        (await query('select * from storage.objects where name = $1', [objectPath(3, foreignOrg)]))
          .rows.length,
        0,
      )
    },
  )

  scenario(
    'allows a new upload only at the current uploader metadata path',
    member,
    async ({ query }) => {
      const row = await query(
        'insert into storage.objects (bucket_id, name, owner_id) values ($1, $2, $3) returning name',
        ['agency-files', objectPath(7), member],
      )
      assert.equal(row.rows[0].name, objectPath(7))
    },
  )

  for (const [label, path, uploader] of [
    ['foreign organization', objectPath(9, foreignOrg), member],
    ['another uploader', objectPath(8), member],
    ['unregistered metadata', objectPath(99), member],
    ['extra path segment', `${objectPath(7)}/file.pdf`, member],
    ['forged storage owner', objectPath(7), owner],
    ['missing storage owner', objectPath(7), null],
  ]) {
    scenario(`rejects Storage upload with ${label}`, member, async ({ reject }) => {
      await reject(
        'insert into storage.objects (bucket_id, name, owner_id) values ($1, $2, $3)',
        '42501',
        ['agency-files', path, uploader],
      )
    })
  }

  scenario(
    'prevents overwrite, upsert, rename and moving existing objects',
    member,
    async ({ query, reject }) => {
      assert.equal(
        (
          await query(
            "update storage.objects set metadata = '{\"changed\":true}' where bucket_id = 'agency-files' and name = $1 returning id",
            [objectPath(1)],
          )
        ).rows.length,
        0,
      )
      assert.equal(
        (
          await query(
            "update storage.objects set name = $1 where bucket_id = 'agency-files' and name = $2 returning id",
            [objectPath(7), objectPath(1)],
          )
        ).rows.length,
        0,
      )
      await reject(
        "insert into storage.objects (bucket_id, name, owner_id) values ('agency-files', $1, $2) on conflict (bucket_id, name) do update set metadata = excluded.metadata",
        '42501',
        [objectPath(1), member],
      )
    },
  )

  scenario(
    'allows uploaders to delete their objects but not colleague files or metadata',
    member,
    async ({ query, reject }) => {
      assert.equal(
        (await query('delete from storage.objects where name = $1 returning id', [objectPath(1)]))
          .rows.length,
        1,
      )
      assert.equal(
        (await query('delete from storage.objects where name = $1 returning id', [objectPath(5)]))
          .rows.length,
        0,
      )
      await reject('delete from public.attachments where id = $1', '42501', [id('a', 1)])
    },
  )

  scenario(
    'permits manager file cleanup within the organization only',
    admin,
    async ({ query }) => {
      assert.equal(
        (await query('delete from storage.objects where name = $1 returning id', [objectPath(5)]))
          .rows.length,
        1,
      )
      assert.equal(
        (
          await query('delete from storage.objects where name = $1 returning id', [
            objectPath(3, foreignOrg),
          ])
        ).rows.length,
        0,
      )
      assert.equal(
        (
          await query(
            "delete from storage.objects where bucket_id = 'avatars' and name = $1 returning id",
            [avatarPath(member)],
          )
        ).rows.length,
        0,
      )
    },
  )

  scenario(
    'lets a new user upload and remove an avatar without organization membership',
    outsider,
    async ({ query, reject }) => {
      const path = avatarPath(outsider, 2)
      await query(
        "insert into storage.objects (bucket_id, name, owner_id) values ('avatars', $1, $2)",
        [path, outsider],
      )
      assert.equal(
        (await query('select * from storage.objects where name = $1', [path])).rows.length,
        1,
      )
      assert.equal(
        (await query('delete from storage.objects where name = $1 returning id', [path])).rows
          .length,
        1,
      )
      await reject(
        "insert into storage.objects (bucket_id, name, owner_id) values ('avatars', $1, $2)",
        '42501',
        [avatarPath(owner, 2), outsider],
      )
      await reject(
        "insert into storage.objects (bucket_id, name, owner_id) values ('avatars', $1, $2)",
        '42501',
        [`${outsider}/../file.png`, outsider],
      )
      await reject(
        "insert into storage.objects (bucket_id, name, owner_id) values ('avatars', $1, $2)",
        '42501',
        [`${outsider}/${id('b', 2)}.svg`, outsider],
      )
    },
  )

  scenario(
    'shares only current avatars with active staff, while clients see only their own',
    member,
    async ({ query, signIn }) => {
      assert.equal(
        (await query("select * from storage.objects where bucket_id = 'avatars'")).rows.length,
        3,
      )
      await signIn(owner)
      await query('update public.profiles set avatar_path = null where id = $1', [owner])
      await signIn(member)
      assert.equal(
        (await query('select * from storage.objects where name = $1', [avatarPath(owner)])).rows
          .length,
        0,
      )
      await signIn(client)
      assert.deepEqual(
        (await query("select name from storage.objects where bucket_id = 'avatars'")).rows.map(
          (row) => row.name,
        ),
        [avatarPath(client)],
      )
    },
  )

  scenario(
    'restrictive Storage guards resist an unrelated permissive policy',
    null,
    async ({ query, reject, signIn }) => {
      await query(
        'create policy unrelated_open_policy on storage.objects for all to public using (true) with check (true)',
      )
      await query(
        "insert into storage.buckets (id, name, public) values ('unrelated', 'unrelated', false)",
      )
      await query(
        "insert into storage.objects (bucket_id, name) values ('unrelated', 'public.txt')",
      )
      await signIn('anon')
      assert.deepEqual(
        (await query('select bucket_id from storage.objects')).rows.map((row) => row.bucket_id),
        ['unrelated'],
      )
      await reject(
        "insert into storage.objects (bucket_id, name, owner_id) values ('avatars', $1, $2)",
        '42501',
        [avatarPath(owner, 2), owner],
      )
      await signIn(member)
      assert.equal(
        (await query('select * from storage.objects where name = $1', [objectPath(3, foreignOrg)]))
          .rows.length,
        0,
      )
      assert.equal(
        (
          await query('update storage.objects set name = $1 where name = $2 returning id', [
            objectPath(7),
            objectPath(1),
          ])
        ).rows.length,
        0,
      )
      await reject(
        "update storage.objects set bucket_id = 'avatars', name = $1 where bucket_id = 'unrelated'",
        '42501',
        [avatarPath(owner, 2)],
      )
      assert.equal(
        (await query('delete from storage.objects where name = $1 returning id', [objectPath(5)]))
          .rows.length,
        0,
      )
    },
  )

  scenario(
    'protects private bucket settings even if another feature grants broad bucket management',
    null,
    async ({ query, reject, signIn }) => {
      await query('grant select, insert, update, delete on storage.buckets to authenticated, anon')
      await query(
        'create policy unrelated_bucket_management on storage.buckets for all to public using (true) with check (true)',
      )
      await query(
        "insert into storage.buckets (id, name, public) values ('unrelated', 'unrelated', false)",
      )
      for (const user of [owner, 'anon']) {
        await signIn(user)
        assert.equal(
          (
            await query(
              "update storage.buckets set public = true where id in ('agency-files', 'avatars') returning id",
            )
          ).rows.length,
          0,
        )
        assert.equal(
          (await query("delete from storage.buckets where id = 'avatars' returning id")).rows
            .length,
          0,
        )
        await reject("update storage.buckets set id = 'avatars' where id = 'unrelated'", '42501')
        assert.equal(
          (
            await query(
              "update storage.buckets set public = true where id = 'unrelated' returning id",
            )
          ).rows.length,
          1,
        )
      }
    },
  )

  scenario(
    'keeps service-role maintenance possible without granting it to browser roles',
    'service_role',
    async ({ query }) => {
      assert.equal((await query('select * from public.projects')).rows.length, 3)
      assert.equal(
        (await query('select token_hash from public.organization_invitations')).rows.length,
        1,
      )
      assert.equal(
        (await query("select * from storage.objects where bucket_id = 'agency-files'")).rows.length,
        6,
      )
    },
  )

  it('keeps the explicit development seed compatible with the complete migration chain', async () => {
    const seeded = await createTestDatabase()
    try {
      await seeded.query(
        "select set_config('devflow.environment', 'development', false), set_config('devflow.seed_user_id', $1, false)",
        [owner],
      )
      await seeded.exec(await readFile(new URL('../seed.sql', import.meta.url), 'utf8'))
      await seeded.query("select set_config('request.jwt.claim.sub', $1, false)", [owner])
      await seeded.exec('set role authenticated')
      const organizations = await seeded.query(
        "select id from public.organizations where slug = 'demo-development-agency'",
      )
      assert.equal(organizations.rows.length, 1)
      assert.equal(
        (
          await seeded.query('select title from public.tasks where organization_id = $1', [
            organizations.rows[0].id,
          ])
        ).rows[0].title.startsWith('[DEMO]'),
        true,
      )
    } finally {
      await seeded.close()
    }
  })
})
