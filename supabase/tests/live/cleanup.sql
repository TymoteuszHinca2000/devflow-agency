-- Delete only fixtures identified by the private setup result, after removing
-- physical files through the Storage API. Never execute this as a migration.
do $$
declare
  fixture jsonb := current_setting('devflow.live_fixture')::jsonb;
  org_ids uuid[] := array[(fixture->>'organizationA')::uuid, (fixture->>'organizationB')::uuid];
  user_ids uuid[] := array[(fixture->'ownerA'->>'id')::uuid, (fixture->'ownerB'->>'id')::uuid, (fixture->'memberA'->>'id')::uuid];
begin
  if current_setting('devflow.environment', true) is distinct from 'development' then
    raise exception 'Cleanup requires explicit development environment';
  end if;
  if (select count(*) from public.organizations where id = any(org_ids) and name in ('[INTEGRATION TEST] A', '[INTEGRATION TEST] B')) <> 2
    or (select count(*) from auth.users where id = any(user_ids) and email like 'devflow-' || (fixture->>'runId') || '-%@example.test') <> 3 then
    raise exception 'Fixture identity check failed; no data deleted';
  end if;
  if exists (select 1 from storage.objects where
    (bucket_id = 'agency-files' and name = fixture->>'storagePath') or
    (bucket_id = 'avatars' and name = fixture->>'avatarPath')) then
    raise exception 'Remove test files through Storage API before deleting their metadata';
  end if;
  delete from public.attachments where organization_id = any(org_ids);
  delete from public.tasks where organization_id = any(org_ids);
  delete from public.project_members where organization_id = any(org_ids);
  delete from public.projects where organization_id = any(org_ids);
  delete from public.organization_members where organization_id = any(org_ids);
  delete from public.organizations where id = any(org_ids);
  delete from auth.users where id = any(user_ids);
end $$;
