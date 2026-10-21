-- Application schema. Supabase owns auth/storage; never replace their tables.
-- Browser roles start with no privileges and no permissive RLS policies.
begin;

create schema if not exists private;
revoke all on schema private from public, anon, authenticated;

create type public.organization_role as enum ('owner', 'admin', 'member', 'client');
create type public.membership_status as enum ('active', 'suspended');
create type public.project_status as enum ('draft', 'active', 'on_hold', 'completed', 'cancelled');
create type public.task_status as enum ('backlog', 'todo', 'in_progress', 'in_review', 'done', 'cancelled');
create type public.task_priority as enum ('low', 'medium', 'high', 'urgent');
create type public.quote_status as enum ('draft', 'sent', 'accepted', 'declined', 'expired', 'cancelled');

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text not null default '' check (char_length(display_name) <= 120),
  avatar_path text check (char_length(avatar_path) between 1 and 512),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.organizations (
  id uuid primary key default gen_random_uuid(),
  name text not null check (char_length(btrim(name)) between 1 and 160),
  slug text not null unique check (char_length(slug) between 3 and 63 and slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
  currency text not null default 'PLN' check (currency ~ '^[A-Z]{3}$'),
  timezone text not null default 'Europe/Warsaw' check (char_length(timezone) between 1 and 100),
  created_by uuid references public.profiles(id) on delete set null,
  archived_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.clients (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete restrict,
  name text not null check (char_length(btrim(name)) between 1 and 160),
  company_name text check (char_length(company_name) <= 200),
  email text check (char_length(email) <= 254 and email = lower(btrim(email)) and position('@' in email) > 1),
  phone text check (char_length(phone) <= 40),
  tax_id text check (char_length(tax_id) <= 32),
  address_line_1 text check (char_length(address_line_1) <= 200),
  address_line_2 text check (char_length(address_line_2) <= 200),
  postal_code text check (char_length(postal_code) <= 20),
  city text check (char_length(city) <= 100),
  country_code text check (country_code ~ '^[A-Z]{2}$'),
  notes text not null default '' check (char_length(notes) <= 10000),
  created_by uuid not null references public.profiles(id) on delete restrict,
  archived_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (organization_id, id)
);

create table public.organization_members (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete restrict,
  user_id uuid not null references public.profiles(id) on delete restrict,
  role public.organization_role not null default 'member',
  status public.membership_status not null default 'active',
  client_id uuid,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (organization_id, user_id),
  foreign key (organization_id, client_id) references public.clients(organization_id, id) on delete restrict,
  check ((role = 'client') = (client_id is not null))
);

create table public.organization_invitations (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete restrict,
  email text not null check (char_length(email) between 3 and 254 and email = lower(btrim(email)) and position('@' in email) > 1),
  role public.organization_role not null default 'member' check (role <> 'owner'),
  client_id uuid,
  token_hash bytea not null unique check (octet_length(token_hash) = 32),
  invited_by uuid not null references public.profiles(id) on delete restrict,
  expires_at timestamptz not null default (now() + interval '7 days'),
  accepted_at timestamptz,
  accepted_by uuid references public.profiles(id) on delete restrict,
  revoked_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  foreign key (organization_id, client_id) references public.clients(organization_id, id) on delete restrict,
  check ((role = 'client') = (client_id is not null)),
  check (expires_at > created_at),
  check ((accepted_at is null) = (accepted_by is null)),
  check (accepted_at is null or revoked_at is null)
);

create unique index organization_invitations_pending_email_idx
  on public.organization_invitations (organization_id, email)
  where accepted_at is null and revoked_at is null;

create table public.projects (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete restrict,
  client_id uuid,
  name text not null check (char_length(btrim(name)) between 1 and 200),
  description text not null default '' check (char_length(description) <= 20000),
  status public.project_status not null default 'draft',
  budget numeric(14, 2) check (budget between 0 and 999999999999.99),
  currency text not null default 'PLN' check (currency ~ '^[A-Z]{3}$'),
  starts_on date,
  due_on date,
  created_by uuid not null references public.profiles(id) on delete restrict,
  archived_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (organization_id, id),
  unique (organization_id, client_id, id),
  foreign key (organization_id, client_id) references public.clients(organization_id, id) on delete restrict,
  check (due_on is null or starts_on is null or due_on >= starts_on)
);

create table public.project_members (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete restrict,
  project_id uuid not null,
  user_id uuid not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (organization_id, project_id, user_id),
  foreign key (organization_id, project_id) references public.projects(organization_id, id) on delete restrict,
  foreign key (organization_id, user_id) references public.organization_members(organization_id, user_id) on delete restrict
);

create table public.tasks (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete restrict,
  project_id uuid not null,
  parent_task_id uuid,
  title text not null check (char_length(btrim(title)) between 1 and 240),
  description text not null default '' check (char_length(description) <= 20000),
  status public.task_status not null default 'todo',
  priority public.task_priority not null default 'medium',
  position bigint not null default 0 check (position >= 0),
  assigned_to uuid,
  due_at timestamptz,
  completed_at timestamptz,
  created_by uuid not null references public.profiles(id) on delete restrict,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (organization_id, id),
  unique (organization_id, project_id, id),
  foreign key (organization_id, project_id) references public.projects(organization_id, id) on delete restrict,
  foreign key (organization_id, project_id, parent_task_id) references public.tasks(organization_id, project_id, id) on delete restrict,
  foreign key (organization_id, project_id, assigned_to) references public.project_members(organization_id, project_id, user_id) on delete restrict,
  check (parent_task_id is null or parent_task_id <> id)
);

create table public.task_comments (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete restrict,
  task_id uuid not null,
  author_id uuid not null references public.profiles(id) on delete restrict,
  body text not null check (char_length(btrim(body)) between 1 and 10000),
  is_internal boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  foreign key (organization_id, task_id) references public.tasks(organization_id, id) on delete restrict
);

create table public.time_entries (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete restrict,
  project_id uuid not null,
  task_id uuid,
  user_id uuid not null,
  description text not null default '' check (char_length(description) <= 2000),
  started_at timestamptz not null,
  ended_at timestamptz,
  hourly_rate numeric(12, 2) check (hourly_rate between 0 and 9999999999.99),
  currency text not null default 'PLN' check (currency ~ '^[A-Z]{3}$'),
  is_billable boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  foreign key (organization_id, project_id) references public.projects(organization_id, id) on delete restrict,
  foreign key (organization_id, project_id, task_id) references public.tasks(organization_id, project_id, id) on delete restrict,
  foreign key (organization_id, project_id, user_id) references public.project_members(organization_id, project_id, user_id) on delete restrict,
  check (ended_at is null or ended_at > started_at)
);

create unique index time_entries_one_running_timer_idx on public.time_entries (user_id) where ended_at is null;

create table public.quotes (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete restrict,
  client_id uuid not null,
  project_id uuid,
  number text not null check (char_length(btrim(number)) between 1 and 80),
  title text not null check (char_length(btrim(title)) between 1 and 200),
  status public.quote_status not null default 'draft',
  currency text not null default 'PLN' check (currency ~ '^[A-Z]{3}$'),
  issued_on date not null default current_date,
  valid_until date,
  notes text not null default '' check (char_length(notes) <= 10000),
  created_by uuid not null references public.profiles(id) on delete restrict,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (organization_id, id),
  unique (organization_id, number),
  foreign key (organization_id, client_id) references public.clients(organization_id, id) on delete restrict,
  foreign key (organization_id, client_id, project_id) references public.projects(organization_id, client_id, id) on delete restrict,
  check (valid_until is null or valid_until >= issued_on)
);

create table public.quote_items (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete restrict,
  quote_id uuid not null,
  description text not null check (char_length(btrim(description)) between 1 and 2000),
  quantity numeric(12, 3) not null check (quantity > 0 and quantity <= 999999999.999),
  unit_price numeric(14, 2) not null check (unit_price between 0 and 999999999999.99),
  line_total numeric(24, 2) generated always as (round(quantity * unit_price, 2)) stored,
  position integer not null default 0 check (position >= 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  foreign key (organization_id, quote_id) references public.quotes(organization_id, id) on delete restrict,
  unique (organization_id, quote_id, position) deferrable initially immediate
);

create table public.attachments (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete restrict,
  project_id uuid,
  task_id uuid,
  quote_id uuid,
  uploaded_by uuid not null references public.profiles(id) on delete restrict,
  bucket_id text not null default 'agency-files' check (bucket_id = 'agency-files'),
  storage_path text generated always as (organization_id::text || '/' || id::text) stored,
  file_name text not null check (char_length(btrim(file_name)) between 1 and 255 and file_name !~ '[/\\]'),
  mime_type text not null check (char_length(mime_type) between 3 and 150),
  size_bytes bigint not null check (size_bytes between 1 and 20971520),
  is_client_visible boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (bucket_id, storage_path),
  foreign key (organization_id, project_id) references public.projects(organization_id, id) on delete restrict,
  foreign key (organization_id, project_id, task_id) references public.tasks(organization_id, project_id, id) on delete restrict,
  foreign key (organization_id, quote_id) references public.quotes(organization_id, id) on delete restrict,
  check (num_nonnulls(project_id, quote_id) = 1),
  check (task_id is null or project_id is not null)
);

create table public.notifications (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete restrict,
  recipient_id uuid not null references public.profiles(id) on delete restrict,
  kind text not null check (char_length(kind) between 1 and 80),
  title text not null check (char_length(btrim(title)) between 1 and 200),
  body text not null default '' check (char_length(body) <= 2000),
  read_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  foreign key (organization_id, recipient_id) references public.organization_members(organization_id, user_id) on delete restrict
);

create table public.activity_logs (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete restrict,
  actor_id uuid references public.profiles(id) on delete set null,
  entity_type text not null check (char_length(entity_type) between 1 and 80),
  entity_id uuid not null,
  action text not null check (char_length(action) between 1 and 80),
  details jsonb not null default '{}'::jsonb check (jsonb_typeof(details) = 'object' and octet_length(details::text) <= 16384),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Index tenant filters, reverse foreign keys and common list/order operations.
create index organizations_created_by_idx on public.organizations (created_by);
create index clients_created_by_idx on public.clients (created_by);
create index clients_active_name_idx on public.clients (organization_id, name, id) where archived_at is null;
create index organization_members_user_idx on public.organization_members (user_id, organization_id);
create index organization_members_client_idx on public.organization_members (organization_id, client_id);
create index organization_invitations_client_idx on public.organization_invitations (organization_id, client_id);
create index organization_invitations_invited_by_idx on public.organization_invitations (invited_by);
create index organization_invitations_accepted_by_idx on public.organization_invitations (accepted_by);
create index projects_client_idx on public.projects (organization_id, client_id);
create index projects_created_by_idx on public.projects (created_by);
create index projects_active_status_idx on public.projects (organization_id, status, due_on, id) where archived_at is null;
create index project_members_user_idx on public.project_members (organization_id, user_id);
create index tasks_board_idx on public.tasks (organization_id, project_id, status, position, id);
create index tasks_parent_idx on public.tasks (organization_id, project_id, parent_task_id);
create index tasks_assignee_idx on public.tasks (organization_id, project_id, assigned_to);
create index tasks_created_by_idx on public.tasks (created_by);
create index task_comments_task_idx on public.task_comments (organization_id, task_id, created_at, id);
create index task_comments_author_idx on public.task_comments (author_id);
create index time_entries_report_idx on public.time_entries (organization_id, project_id, started_at, id);
create index time_entries_task_idx on public.time_entries (organization_id, project_id, task_id);
create index time_entries_member_idx on public.time_entries (organization_id, project_id, user_id);
create index quotes_client_project_idx on public.quotes (organization_id, client_id, project_id);
create index quotes_project_idx on public.quotes (organization_id, project_id);
create index quotes_created_by_idx on public.quotes (created_by);
create index attachments_project_idx on public.attachments (organization_id, project_id);
create index attachments_task_idx on public.attachments (organization_id, project_id, task_id);
create index attachments_quote_idx on public.attachments (organization_id, quote_id);
create index attachments_uploader_idx on public.attachments (uploaded_by);
create index notifications_recipient_idx on public.notifications (recipient_id, organization_id, created_at desc, id);
create index notifications_unread_idx on public.notifications (recipient_id, organization_id, created_at desc) where read_at is null;
create index notifications_organization_recipient_idx on public.notifications (organization_id, recipient_id);
create index activity_logs_entity_idx on public.activity_logs (organization_id, entity_type, entity_id, created_at desc, id);
create index activity_logs_actor_idx on public.activity_logs (actor_id);

create function private.maintain_row_metadata()
returns trigger language plpgsql set search_path = '' as $$
begin
  if new.id is distinct from old.id
    or new.created_at is distinct from old.created_at
    or (to_jsonb(new)->'organization_id') is distinct from (to_jsonb(old)->'organization_id') then
    raise exception 'Row identity, organization and creation time are immutable' using errcode = '23514';
  end if;
  new.updated_at := clock_timestamp();
  return new;
end;
$$;
revoke all on function private.maintain_row_metadata() from public, anon, authenticated;

create function private.create_user_profile()
returns trigger language plpgsql security definer set search_path = '' as $$
begin
  -- Untrusted metadata is display text only, never a source of permissions.
  insert into public.profiles (id, display_name)
  values (new.id, left(coalesce(new.raw_user_meta_data->>'display_name', ''), 120));
  return new;
end;
$$;
revoke all on function private.create_user_profile() from public, anon, authenticated;

create function private.prevent_task_cycle()
returns trigger language plpgsql security definer set search_path = '' as $$
begin
  if new.parent_task_id is null then
    return new;
  end if;
  -- Serialize hierarchy changes within one project, including future concurrent writes.
  perform pg_catalog.pg_advisory_xact_lock(pg_catalog.hashtextextended(new.project_id::text, 0));
  if exists (
    with recursive ancestors as (
      select id, parent_task_id from public.tasks
      where organization_id = new.organization_id and project_id = new.project_id and id = new.parent_task_id
      union
      select task.id, task.parent_task_id from public.tasks task
      join ancestors ancestor on task.id = ancestor.parent_task_id
      where task.organization_id = new.organization_id and task.project_id = new.project_id
    )
    select 1 from ancestors where id = new.id
  ) then
    raise exception 'Task hierarchy cannot contain a cycle' using errcode = '23514';
  end if;
  return new;
end;
$$;
revoke all on function private.prevent_task_cycle() from public, anon, authenticated;

create trigger prevent_task_cycle before insert or update of parent_task_id, project_id on public.tasks
  for each row execute function private.prevent_task_cycle();

create trigger on_auth_user_created after insert on auth.users
  for each row execute function private.create_user_profile();

-- Existing accounts are preserved when applying the migration to a dev project.
insert into public.profiles (id, display_name)
select id, left(coalesce(raw_user_meta_data->>'display_name', ''), 120) from auth.users
on conflict (id) do nothing;

do $$
declare
  table_name text;
begin
  foreach table_name in array array[
    'profiles', 'organizations', 'organization_members', 'organization_invitations',
    'clients', 'projects', 'project_members', 'tasks', 'task_comments', 'time_entries',
    'quotes', 'quote_items', 'attachments', 'notifications', 'activity_logs'
  ] loop
    execute format('alter table public.%I enable row level security', table_name);
    execute format('revoke all on table public.%I from public, anon, authenticated', table_name);
    execute format('grant select, insert, update, delete on table public.%I to service_role', table_name);
    execute format('create trigger maintain_row_metadata before update on public.%I for each row execute function private.maintain_row_metadata()', table_name);
  end loop;
end;
$$;

comment on table public.organization_invitations is 'Server-managed. Store only a SHA-256 token digest; never the invitation secret.';
comment on table public.activity_logs is 'Server-managed audit events. Browser access is granted separately by security policies.';
comment on table public.attachments is 'Metadata only; private Storage policies are introduced by the next migration.';
comment on column public.quote_items.line_total is 'Exact decimal quantity times unit price, rounded per line; tax/quote lifecycle belongs to the quotes module.';

commit;
