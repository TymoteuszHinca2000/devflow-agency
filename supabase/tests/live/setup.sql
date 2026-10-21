-- Disposable HTTP integration fixtures. Never a migration or application seed.
-- Execute only on a development project, with devflow.environment=development.
-- The result includes temporary credentials: pass privately to the HTTP runner.
do $$
declare
  run_id uuid := gen_random_uuid();
  user_a uuid := gen_random_uuid();
  user_b uuid := gen_random_uuid();
  member_a uuid := gen_random_uuid();
  org_a uuid := gen_random_uuid();
  org_b uuid := gen_random_uuid();
  project_a uuid := gen_random_uuid();
  project_b uuid := gen_random_uuid();
  task_a uuid := gen_random_uuid();
  attachment uuid := gen_random_uuid();
  test_password text := encode(extensions.gen_random_bytes(32), 'hex');
  account record;
  credentials jsonb := '{}'::jsonb;
begin
  if current_setting('devflow.environment', true) is distinct from 'development' then
    raise exception 'Live fixtures require explicit development environment';
  end if;
  for account in select * from (values (user_a, 'ownerA'), (user_b, 'ownerB'), (member_a, 'memberA')) as accounts(id, label)
  loop
    insert into auth.users (
      instance_id, id, aud, role, email, encrypted_password, email_confirmed_at,
      raw_app_meta_data, raw_user_meta_data, created_at, updated_at,
      confirmation_token, recovery_token, email_change_token_new, email_change,
      email_change_token_current, reauthentication_token
    ) values (
      '00000000-0000-0000-0000-000000000000', account.id, 'authenticated', 'authenticated',
      lower('devflow-' || run_id || '-' || account.label || '@example.test'),
      extensions.crypt(test_password, extensions.gen_salt('bf')), now(),
      '{"provider":"email","providers":["email"]}', '{"display_name":"[INTEGRATION TEST]"}', now(), now(),
      '', '', '', '', '', ''
    );
    insert into auth.identities (provider_id, user_id, identity_data, provider, created_at, updated_at)
    values (account.id::text, account.id, jsonb_build_object('sub', account.id::text,
      'email', lower('devflow-' || run_id || '-' || account.label || '@example.test'), 'email_verified', true), 'email', now(), now());
    credentials := credentials || jsonb_build_object(account.label, jsonb_build_object(
      'id', account.id, 'email', lower('devflow-' || run_id || '-' || account.label || '@example.test'), 'password', test_password));
  end loop;
  insert into public.organizations (id, name, slug, created_by) values
    (org_a, '[INTEGRATION TEST] A', 'devflow-test-a-' || run_id, user_a),
    (org_b, '[INTEGRATION TEST] B', 'devflow-test-b-' || run_id, user_b);
  insert into public.organization_members (organization_id, user_id, role) values
    (org_a, user_a, 'owner'), (org_b, user_b, 'owner'), (org_a, member_a, 'member');
  insert into public.projects (id, organization_id, name, created_by) values
    (project_a, org_a, '[INTEGRATION TEST] A', user_a), (project_b, org_b, '[INTEGRATION TEST] B', user_b);
  insert into public.project_members (organization_id, project_id, user_id) values
    (org_a, project_a, user_a), (org_a, project_a, member_a), (org_b, project_b, user_b);
  insert into public.tasks (id, organization_id, project_id, title, assigned_to, created_by)
  values (task_a, org_a, project_a, '[INTEGRATION TEST] task', member_a, user_a);
  insert into public.attachments (id, organization_id, project_id, uploaded_by, file_name, size_bytes, mime_type)
  values (attachment, org_a, project_a, user_a, 'integration.txt', 18, 'text/plain');
  perform set_config('devflow.live_fixture', (credentials || jsonb_build_object(
    'environment', 'development', 'runId', run_id, 'organizationA', org_a, 'organizationB', org_b,
    'projectA', project_a, 'projectB', project_b, 'taskA', task_a, 'attachmentId', attachment,
    'storagePath', org_a || '/' || attachment,
    'avatarPath', member_a || '/' || gen_random_uuid() || '.png'))::text, true);
end $$;
select current_setting('devflow.live_fixture')::jsonb as fixture;
