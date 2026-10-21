-- Least-privilege browser access. Membership/invitation/lifecycle writes stay server-only.
begin;

revoke create on schema public from public, anon, authenticated;

-- Revoke project access without deleting memberships referenced by historical work.
alter table public.project_members add column status public.membership_status not null default 'active';

create function private.is_org_member(target_org uuid)
returns boolean language sql stable security definer set search_path = '' as $$
  select exists (
    select 1 from public.organization_members member
    where member.organization_id = target_org and member.user_id = (select auth.uid())
      and member.status = 'active'
  );
$$;

create function private.is_org_staff(target_org uuid)
returns boolean language sql stable security definer set search_path = '' as $$
  select exists (
    select 1 from public.organization_members member
    where member.organization_id = target_org and member.user_id = (select auth.uid())
      and member.status = 'active' and member.role in ('owner', 'admin', 'member')
  );
$$;

create function private.is_org_manager(target_org uuid)
returns boolean language sql stable security definer set search_path = '' as $$
  select exists (
    select 1 from public.organization_members member
    where member.organization_id = target_org and member.user_id = (select auth.uid())
      and member.status = 'active' and member.role in ('owner', 'admin')
  );
$$;

create function private.can_read_project(target_org uuid, target_project uuid)
returns boolean language sql stable security definer set search_path = '' as $$
  select exists (
    select 1 from public.projects project
    join public.organization_members member on member.organization_id = project.organization_id
    where project.organization_id = target_org and project.id = target_project
      and member.user_id = (select auth.uid()) and member.status = 'active'
      and (
        member.role in ('owner', 'admin')
        or (member.role = 'member' and exists (
          select 1 from public.project_members team
          where team.organization_id = target_org and team.project_id = target_project
            and team.user_id = member.user_id and team.status = 'active'
        ))
      )
  );
$$;

create function private.can_log_time(target_org uuid, target_project uuid)
returns boolean language sql stable security definer set search_path = '' as $$
  select exists (
    select 1 from public.project_members team
    join public.organization_members member
      on member.organization_id = team.organization_id and member.user_id = team.user_id
    where team.organization_id = target_org and team.project_id = target_project
      and team.user_id = (select auth.uid()) and team.status = 'active'
      and member.status = 'active' and member.role in ('owner', 'admin', 'member')
  );
$$;

create function private.validate_task_assignment()
returns trigger language plpgsql security definer set search_path = '' as $$
begin
  if new.assigned_to is not null and (
    tg_op = 'INSERT' or new.assigned_to is distinct from old.assigned_to
    or new.project_id is distinct from old.project_id
  ) and not exists (
    select 1 from public.project_members team
    join public.organization_members member
      on member.organization_id = team.organization_id and member.user_id = team.user_id
    where team.organization_id = new.organization_id and team.project_id = new.project_id
      and team.user_id = new.assigned_to and team.status = 'active' and member.status = 'active'
      and member.role in ('owner', 'admin', 'member')
  ) then
    raise exception 'Task assignee must be an active staff member of the project' using errcode = '23514';
  end if;
  return new;
end;
$$;
revoke all on function private.validate_task_assignment() from public, anon, authenticated;
create trigger validate_task_assignment before insert or update of assigned_to, project_id on public.tasks
  for each row execute function private.validate_task_assignment();

create function private.can_read_client(target_org uuid, target_client uuid)
returns boolean language sql stable security definer set search_path = '' as $$
  select private.is_org_manager(target_org) or exists (
    select 1 from public.projects project
    where project.organization_id = target_org and project.client_id = target_client
      and private.can_read_project(target_org, project.id)
  );
$$;

create function private.can_read_task(target_org uuid, target_task uuid)
returns boolean language sql stable security definer set search_path = '' as $$
  select exists (
    select 1 from public.tasks task
    where task.organization_id = target_org and task.id = target_task
      and private.can_read_project(target_org, task.project_id)
  );
$$;

create function private.can_edit_quote(target_org uuid, target_quote uuid)
returns boolean language sql stable security definer set search_path = '' as $$
  select private.is_org_manager(target_org) and exists (
    select 1 from public.quotes quote
    where quote.organization_id = target_org and quote.id = target_quote and quote.status = 'draft'
  );
$$;

create function private.can_read_profile(target_user uuid)
returns boolean language sql stable security definer set search_path = '' as $$
  select target_user = (select auth.uid()) or exists (
    select 1 from public.organization_members caller
    join public.organization_members colleague on colleague.organization_id = caller.organization_id
    where caller.user_id = (select auth.uid()) and caller.status = 'active'
      and caller.role in ('owner', 'admin', 'member')
      and colleague.user_id = target_user and colleague.status = 'active'
  );
$$;

create function private.can_read_attachment(target_attachment uuid)
returns boolean language sql stable security definer set search_path = '' as $$
  select exists (
    select 1 from public.attachments attachment
    where attachment.id = target_attachment and (
      (attachment.project_id is not null and private.can_read_project(attachment.organization_id, attachment.project_id))
      or (attachment.quote_id is not null and private.is_org_manager(attachment.organization_id))
    )
  );
$$;

create function private.owns_avatar_path(object_name text)
returns boolean language sql stable security definer set search_path = '' as $$
  select (select auth.uid()) is not null
    and split_part(object_name, '/', 1) = (select auth.uid())::text
    and object_name ~ '^[0-9a-f-]{36}/[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}\.(png|jpg|jpeg|webp)$';
$$;

create function private.can_read_storage_object(target_bucket text, object_name text)
returns boolean language sql stable security definer set search_path = '' as $$
  select case target_bucket
    when 'agency-files' then exists (
      select 1 from public.attachments attachment
      where attachment.bucket_id = target_bucket and attachment.storage_path = object_name
        and private.can_read_attachment(attachment.id)
    )
    when 'avatars' then private.owns_avatar_path(object_name) or exists (
      select 1 from public.profiles profile
      where profile.avatar_path = object_name and private.can_read_profile(profile.id)
    )
    else false
  end;
$$;

create function private.can_write_storage_object(target_bucket text, object_name text, operation text)
returns boolean language sql stable security definer set search_path = '' as $$
  select operation in ('insert', 'delete') and case target_bucket
    when 'agency-files' then exists (
      select 1 from public.attachments attachment
      where attachment.bucket_id = target_bucket and attachment.storage_path = object_name
        and private.can_read_attachment(attachment.id)
        and (
          attachment.uploaded_by = (select auth.uid())
          or (operation = 'delete' and private.is_org_manager(attachment.organization_id))
        )
    )
    when 'avatars' then private.owns_avatar_path(object_name)
    else false
  end;
$$;

-- Only the policy helpers are callable by authenticated. Trigger functions stay private.
grant usage on schema private to authenticated;
do $$
declare
  signature text;
begin
  foreach signature in array array[
    'private.is_org_member(uuid)', 'private.is_org_staff(uuid)', 'private.is_org_manager(uuid)',
    'private.can_read_project(uuid,uuid)', 'private.can_log_time(uuid,uuid)', 'private.can_read_client(uuid,uuid)',
    'private.can_read_task(uuid,uuid)', 'private.can_edit_quote(uuid,uuid)',
    'private.can_read_profile(uuid)', 'private.can_read_attachment(uuid)',
    'private.owns_avatar_path(text)', 'private.can_read_storage_object(text,text)',
    'private.can_write_storage_object(text,text,text)'
  ] loop
    execute format('revoke all on function %s from public, anon, authenticated', signature);
    execute format('grant execute on function %s to authenticated', signature);
  end loop;
end;
$$;

alter table public.profiles add constraint profiles_avatar_own_folder
  check (avatar_path is null or (
    split_part(avatar_path, '/', 1) = id::text
    and avatar_path ~ '^[0-9a-f-]{36}/[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}\.(png|jpg|jpeg|webp)$'
  ));

-- Table DML is intentionally not granted: updates/inserts list editable columns.
grant select on public.profiles, public.organizations, public.organization_members,
  public.clients, public.projects, public.project_members, public.tasks, public.task_comments,
  public.time_entries, public.quotes, public.quote_items, public.attachments,
  public.notifications, public.activity_logs to authenticated;

grant update (display_name, avatar_path) on public.profiles to authenticated;
grant update (name, slug, currency, timezone) on public.organizations to authenticated;
grant insert (organization_id, name, company_name, email, phone, tax_id, address_line_1,
  address_line_2, postal_code, city, country_code, notes, created_by, archived_at)
  on public.clients to authenticated;
grant update (name, company_name, email, phone, tax_id, address_line_1, address_line_2,
  postal_code, city, country_code, notes, archived_at) on public.clients to authenticated;
grant insert (organization_id, client_id, name, description, status, budget, currency,
  starts_on, due_on, created_by, archived_at) on public.projects to authenticated;
grant update (client_id, name, description, status, budget, currency, starts_on, due_on, archived_at)
  on public.projects to authenticated;
grant insert (organization_id, project_id, parent_task_id, title, description, status, priority,
  position, assigned_to, due_at, completed_at, created_by) on public.tasks to authenticated;
grant update (parent_task_id, title, description, status, priority, position, assigned_to, due_at, completed_at)
  on public.tasks to authenticated;
grant insert (organization_id, task_id, author_id, body) on public.task_comments to authenticated;
grant update (body) on public.task_comments to authenticated;
grant insert (organization_id, project_id, task_id, user_id, description, started_at, ended_at, currency, is_billable)
  on public.time_entries to authenticated;
grant update (task_id, description, started_at, ended_at, is_billable) on public.time_entries to authenticated;
grant insert (organization_id, client_id, project_id, number, title, currency, issued_on, valid_until, notes, created_by)
  on public.quotes to authenticated;
grant update (client_id, project_id, number, title, currency, issued_on, valid_until, notes)
  on public.quotes to authenticated;
grant insert (organization_id, quote_id, description, quantity, unit_price, position)
  on public.quote_items to authenticated;
grant update (description, quantity, unit_price, position) on public.quote_items to authenticated;
grant insert (organization_id, project_id, task_id, quote_id, uploaded_by, file_name, mime_type, size_bytes, is_client_visible)
  on public.attachments to authenticated;
grant update (file_name, is_client_visible) on public.attachments to authenticated;
grant update (read_at) on public.notifications to authenticated;
grant delete on public.clients, public.projects, public.tasks, public.task_comments,
  public.time_entries, public.quotes, public.quote_items to authenticated;

create policy profiles_read on public.profiles for select to authenticated
  using (private.can_read_profile(id));
create policy profiles_update_self on public.profiles for update to authenticated
  using (id = (select auth.uid())) with check (id = (select auth.uid()));
create policy organizations_read on public.organizations for select to authenticated
  using (private.is_org_member(id));
create policy organizations_update on public.organizations for update to authenticated
  using (private.is_org_manager(id)) with check (private.is_org_manager(id));
create policy organization_members_read on public.organization_members for select to authenticated
  using (private.is_org_staff(organization_id)
    or (user_id = (select auth.uid()) and private.is_org_member(organization_id)));
create policy project_members_read on public.project_members for select to authenticated
  using (private.can_read_project(organization_id, project_id));

create policy clients_read on public.clients for select to authenticated
  using (private.can_read_client(organization_id, id));
create policy clients_insert on public.clients for insert to authenticated
  with check (private.is_org_manager(organization_id) and created_by = (select auth.uid()));
create policy clients_update on public.clients for update to authenticated
  using (private.is_org_manager(organization_id)) with check (private.is_org_manager(organization_id));
create policy clients_delete on public.clients for delete to authenticated
  using (private.is_org_manager(organization_id));

create policy projects_read on public.projects for select to authenticated
  -- Managers must read a new row during INSERT ... RETURNING before helper lookups see it.
  using (private.is_org_manager(organization_id) or private.can_read_project(organization_id, id));
create policy projects_insert on public.projects for insert to authenticated
  with check (private.is_org_manager(organization_id) and created_by = (select auth.uid()));
create policy projects_update on public.projects for update to authenticated
  using (private.is_org_manager(organization_id)) with check (private.is_org_manager(organization_id));
create policy projects_delete on public.projects for delete to authenticated
  using (private.is_org_manager(organization_id));

create policy tasks_read on public.tasks for select to authenticated
  using (private.can_read_project(organization_id, project_id));
create policy tasks_insert on public.tasks for insert to authenticated
  with check (private.can_read_project(organization_id, project_id) and created_by = (select auth.uid()));
create policy tasks_update on public.tasks for update to authenticated
  using (private.can_read_project(organization_id, project_id))
  with check (private.can_read_project(organization_id, project_id));
create policy tasks_delete on public.tasks for delete to authenticated
  using (private.can_read_project(organization_id, project_id)
    and (created_by = (select auth.uid()) or private.is_org_manager(organization_id)));

create policy task_comments_read on public.task_comments for select to authenticated
  using (private.can_read_task(organization_id, task_id));
create policy task_comments_insert on public.task_comments for insert to authenticated
  with check (private.can_read_task(organization_id, task_id) and author_id = (select auth.uid()));
create policy task_comments_update on public.task_comments for update to authenticated
  using (private.can_read_task(organization_id, task_id)
    and (author_id = (select auth.uid()) or private.is_org_manager(organization_id)))
  with check (private.can_read_task(organization_id, task_id)
    and (author_id = (select auth.uid()) or private.is_org_manager(organization_id)));
create policy task_comments_delete on public.task_comments for delete to authenticated
  using (private.can_read_task(organization_id, task_id)
    and (author_id = (select auth.uid()) or private.is_org_manager(organization_id)));

create policy time_entries_read on public.time_entries for select to authenticated
  using (private.can_read_project(organization_id, project_id)
    and (user_id = (select auth.uid()) or private.is_org_manager(organization_id)));
create policy time_entries_insert on public.time_entries for insert to authenticated
  with check (private.can_log_time(organization_id, project_id) and user_id = (select auth.uid()));
create policy time_entries_update on public.time_entries for update to authenticated
  using (private.can_read_project(organization_id, project_id)
    and (user_id = (select auth.uid()) or private.is_org_manager(organization_id)))
  with check (private.can_read_project(organization_id, project_id)
    and (user_id = (select auth.uid()) or private.is_org_manager(organization_id)));
create policy time_entries_delete on public.time_entries for delete to authenticated
  using (private.can_read_project(organization_id, project_id)
    and (user_id = (select auth.uid()) or private.is_org_manager(organization_id)));

create policy quotes_read on public.quotes for select to authenticated
  using (private.is_org_manager(organization_id));
create policy quotes_insert on public.quotes for insert to authenticated
  with check (private.is_org_manager(organization_id) and created_by = (select auth.uid()) and status = 'draft');
create policy quotes_update on public.quotes for update to authenticated
  using (private.is_org_manager(organization_id) and status = 'draft')
  with check (private.is_org_manager(organization_id) and status = 'draft');
create policy quotes_delete on public.quotes for delete to authenticated
  using (private.is_org_manager(organization_id) and status = 'draft');
create policy quote_items_read on public.quote_items for select to authenticated
  using (private.is_org_manager(organization_id));
create policy quote_items_insert on public.quote_items for insert to authenticated
  with check (private.can_edit_quote(organization_id, quote_id));
create policy quote_items_update on public.quote_items for update to authenticated
  using (private.can_edit_quote(organization_id, quote_id))
  with check (private.can_edit_quote(organization_id, quote_id));
create policy quote_items_delete on public.quote_items for delete to authenticated
  using (private.can_edit_quote(organization_id, quote_id));

create policy attachments_read on public.attachments for select to authenticated
  -- Evaluate the new row's scope directly, including INSERT ... RETURNING.
  using ((project_id is not null and private.can_read_project(organization_id, project_id))
    or (quote_id is not null and private.is_org_manager(organization_id)));
create policy attachments_insert on public.attachments for insert to authenticated
  with check (uploaded_by = (select auth.uid())
    and ((project_id is not null and private.can_read_project(organization_id, project_id))
      or (quote_id is not null and private.is_org_manager(organization_id)))
    and (not is_client_visible or private.is_org_manager(organization_id)));
create policy attachments_update on public.attachments for update to authenticated
  using (private.can_read_attachment(id)
    and (uploaded_by = (select auth.uid()) or private.is_org_manager(organization_id)))
  with check (private.can_read_attachment(id)
    and (uploaded_by = (select auth.uid()) or private.is_org_manager(organization_id))
    and (not is_client_visible or private.is_org_manager(organization_id)));
-- Metadata deletion requires a server cleanup operation to avoid orphaned blobs.

create policy notifications_read on public.notifications for select to authenticated
  using (recipient_id = (select auth.uid()) and private.is_org_member(organization_id));
create policy notifications_mark_read on public.notifications for update to authenticated
  using (recipient_id = (select auth.uid()) and private.is_org_member(organization_id))
  with check (recipient_id = (select auth.uid()) and private.is_org_member(organization_id));
create policy activity_logs_read on public.activity_logs for select to authenticated
  using (private.is_org_manager(organization_id));

-- Supabase Storage already owns these tables and enables RLS. Add rows/policies only.
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types) values
  ('agency-files', 'agency-files', false, 20971520, array[
    'application/pdf', 'image/jpeg', 'image/png', 'image/webp', 'text/plain', 'application/zip',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
  ]),
  ('avatars', 'avatars', false, 2097152, array['image/jpeg', 'image/png', 'image/webp']);

-- Public bucket downloads bypass object RLS, so browser roles cannot make these buckets public.
create policy devflow_bucket_insert_guard on storage.buckets as restrictive for insert to anon, authenticated
  with check (id not in ('agency-files', 'avatars'));
create policy devflow_bucket_update_guard on storage.buckets as restrictive for update to anon, authenticated
  using (id not in ('agency-files', 'avatars')) with check (id not in ('agency-files', 'avatars'));
create policy devflow_bucket_delete_guard on storage.buckets as restrictive for delete to anon, authenticated
  using (id not in ('agency-files', 'avatars'));

create policy devflow_storage_read on storage.objects for select to authenticated
  using (private.can_read_storage_object(bucket_id, name));
create policy devflow_storage_insert on storage.objects for insert to authenticated
  with check (owner_id = (select auth.uid())::text
    and private.can_write_storage_object(bucket_id, name, 'insert'));
create policy devflow_storage_delete on storage.objects for delete to authenticated
  using (private.can_write_storage_object(bucket_id, name, 'delete'));

-- Restrictive guards protect our buckets even if another bucket later uses a broad policy.
-- No UPDATE means no overwrite/upsert, rename, move or ownership change in our buckets.
create policy devflow_storage_anon_guard on storage.objects as restrictive for all to anon
  using (bucket_id not in ('agency-files', 'avatars'))
  with check (bucket_id not in ('agency-files', 'avatars'));
create policy devflow_storage_read_guard on storage.objects as restrictive for select to authenticated
  using (bucket_id not in ('agency-files', 'avatars') or private.can_read_storage_object(bucket_id, name));
create policy devflow_storage_insert_guard on storage.objects as restrictive for insert to authenticated
  with check (bucket_id not in ('agency-files', 'avatars') or (
    owner_id = (select auth.uid())::text and private.can_write_storage_object(bucket_id, name, 'insert')));
create policy devflow_storage_update_guard on storage.objects as restrictive for update to authenticated
  using (bucket_id not in ('agency-files', 'avatars'))
  with check (bucket_id not in ('agency-files', 'avatars'));
create policy devflow_storage_delete_guard on storage.objects as restrictive for delete to authenticated
  using (bucket_id not in ('agency-files', 'avatars') or private.can_write_storage_object(bucket_id, name, 'delete'));

comment on table public.organization_invitations is 'Server-only invitation lifecycle and hashed secrets. No browser grants.';
comment on table public.activity_logs is 'Managers can read. All event writes are server-only.';
comment on table public.attachments is 'Private Storage metadata. Browser cannot delete metadata or change its scope/owner/path.';

commit;
