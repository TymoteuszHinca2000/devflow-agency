-- Read-only structural comparison between the migrated local and remote databases.
select jsonb_build_object(
  'columns', (select jsonb_agg(jsonb_build_object(
    'table', c.relname, 'column', a.attname, 'type', format_type(a.atttypid, a.atttypmod),
    'nullable', not a.attnotnull, 'generated', a.attgenerated,
    'default', pg_get_expr(d.adbin, d.adrelid)
  ) order by c.relname, a.attnum)
    from pg_class c join pg_namespace n on n.oid = c.relnamespace
    join pg_attribute a on a.attrelid = c.oid and a.attnum > 0 and not a.attisdropped
    left join pg_attrdef d on d.adrelid = c.oid and d.adnum = a.attnum
    where n.nspname = 'public' and c.relkind = 'r'),
  'constraints', (select jsonb_agg(jsonb_build_object(
    'table', c.relname, 'name', con.conname, 'definition', pg_get_constraintdef(con.oid)
  ) order by c.relname, con.conname)
    from pg_constraint con join pg_class c on c.oid = con.conrelid
    join pg_namespace n on n.oid = c.relnamespace where n.nspname = 'public' and con.contype <> 'n'),
  'enums', (select jsonb_agg(jsonb_build_object('type', t.typname, 'value', e.enumlabel)
    order by t.typname, e.enumsortorder)
    from pg_enum e join pg_type t on t.oid = e.enumtypid join pg_namespace n on n.oid = t.typnamespace
    where n.nspname = 'public')
) as snapshot;
