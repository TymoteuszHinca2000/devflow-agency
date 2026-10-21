-- OPTIONAL DEVELOPMENT DATA. Disabled in config.toml; never deploy as a migration.
-- Requires an existing Auth account and explicit settings in this same session.
begin;

do $$
declare
  seed_user uuid := nullif(current_setting('devflow.seed_user_id', true), '')::uuid;
  seed_organization constant uuid := 'f0000000-0000-4000-8000-000000000001';
  seed_client constant uuid := 'f0000000-0000-4000-8000-000000000002';
  seed_project constant uuid := 'f0000000-0000-4000-8000-000000000003';
begin
  if current_setting('devflow.environment', true) is distinct from 'development' then
    raise exception 'Seed requires devflow.environment=development';
  end if;
  if seed_user is null or not exists (select 1 from public.profiles where id = seed_user) then
    raise exception 'Seed requires devflow.seed_user_id referencing an existing Auth profile';
  end if;
  if exists (select 1 from public.organizations where id = seed_organization) then
    raise exception 'Development seed already exists; refusing to overwrite data';
  end if;

  insert into public.organizations (id, name, slug, created_by)
  values (seed_organization, '[DEMO] Development Agency', 'demo-development-agency', seed_user);
  insert into public.organization_members (organization_id, user_id, role)
  values (seed_organization, seed_user, 'owner');
  insert into public.clients (id, organization_id, name, created_by)
  values (seed_client, seed_organization, '[DEMO] Sample Client', seed_user);
  insert into public.projects (id, organization_id, client_id, name, created_by)
  values (seed_project, seed_organization, seed_client, '[DEMO] Sample Project', seed_user);
  insert into public.project_members (organization_id, project_id, user_id)
  values (seed_organization, seed_project, seed_user);
  insert into public.tasks (organization_id, project_id, title, created_by)
  values (seed_organization, seed_project, '[DEMO] Explore the development project', seed_user);
end;
$$;

commit;
