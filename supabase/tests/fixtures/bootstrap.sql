-- TEST CONTRACT ONLY. These minimal Supabase-owned objects are never deployed.
-- Real Auth/Storage services and HTTP behavior require separate integration tests.
create role anon nologin;
create role authenticated nologin;
create role service_role nologin bypassrls;
create schema auth;
create table auth.users (
  id uuid primary key default gen_random_uuid(),
  email text unique,
  raw_user_meta_data jsonb not null default '{}'::jsonb
);
create function auth.uid() returns uuid language sql stable as $$
  select nullif(current_setting('request.jwt.claim.sub', true), '')::uuid;
$$;
create function auth.jwt() returns jsonb language sql stable as $$
  select coalesce(nullif(current_setting('request.jwt.claims', true), ''), '{}')::jsonb;
$$;
grant usage on schema public, auth to anon, authenticated, service_role;
grant execute on function auth.uid(), auth.jwt() to anon, authenticated, service_role;

-- Account created before migrations exercises profile backfill as well.
insert into auth.users (id, email, raw_user_meta_data)
values ('10000000-0000-4000-8000-000000000001', 'owner-a@example.test', '{"display_name":"Owner A","role":"owner"}');
