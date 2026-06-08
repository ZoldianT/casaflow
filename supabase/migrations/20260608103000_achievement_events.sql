create table if not exists achievement_events (
  id uuid primary key default gen_random_uuid(),
  household_id uuid not null references households(id) on delete cascade,
  task_id uuid references tasks(id) on delete set null,
  task_title text not null,
  task_category text not null,
  assigned_to text not null default 'Chi puo',
  awarded_to uuid references auth.users(id) on delete set null,
  awarded_to_name text not null,
  badge_code text not null,
  badge_title text not null,
  badge_tone text not null default 'calm',
  level_title text not null,
  message text not null,
  awarded_at timestamp with time zone default now(),
  created_at timestamp with time zone default now(),
  unique(household_id, task_id, badge_code)
);

create index if not exists achievement_events_household_awarded_at_idx
on achievement_events (household_id, awarded_at desc);

alter table achievement_events enable row level security;

create policy "Members can read achievement events"
on achievement_events for select
using (is_household_member(household_id));

create policy "Members can insert achievement events"
on achievement_events for insert
with check (is_household_member(household_id));

create policy "Members can update achievement events"
on achievement_events for update
using (is_household_member(household_id))
with check (is_household_member(household_id));

create policy "Members can delete achievement events"
on achievement_events for delete
using (is_household_member(household_id));
