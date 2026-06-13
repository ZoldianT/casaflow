alter table achievement_events
  add column if not exists source_type text not null default 'task',
  add column if not exists source_id uuid;

update achievement_events
set source_type = 'task',
    source_id = task_id
where source_id is null
  and task_id is not null;

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'achievement_events_source_unique'
  ) then
    alter table achievement_events
      add constraint achievement_events_source_unique
      unique (household_id, source_type, source_id, badge_code);
  end if;
end $$;
