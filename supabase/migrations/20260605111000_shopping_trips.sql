create table if not exists shopping_trips (
  id uuid primary key default gen_random_uuid(),
  household_id uuid not null references households(id) on delete cascade,
  task_id uuid not null references tasks(id) on delete cascade,
  title text not null,
  assigned_to text not null default 'Chi puo',
  status text not null default 'Da fare',
  created_by uuid references auth.users(id),
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now(),
  completed_at timestamp with time zone,
  constraint shopping_trips_assigned_check check (assigned_to in ('Peppe', 'Moglie', 'Chi puo')),
  constraint shopping_trips_status_check check (status in ('Da fare', 'Fatto', 'Archiviato'))
);

create table if not exists shopping_trip_items (
  id uuid primary key default gen_random_uuid(),
  household_id uuid not null references households(id) on delete cascade,
  trip_id uuid not null references shopping_trips(id) on delete cascade,
  shopping_item_id uuid references shopping_items(id) on delete set null,
  title text not null,
  category text not null default 'Altro',
  note text,
  is_done boolean not null default false,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now(),
  constraint shopping_trip_items_category_check check (category in ('Bimba', 'Alimentari', 'Casa', 'Farmacia', 'Igiene', 'Altro'))
);

drop trigger if exists shopping_trips_set_updated_at on shopping_trips;
create trigger shopping_trips_set_updated_at before update on shopping_trips
for each row execute function set_updated_at();

drop trigger if exists shopping_trip_items_set_updated_at on shopping_trip_items;
create trigger shopping_trip_items_set_updated_at before update on shopping_trip_items
for each row execute function set_updated_at();

alter table shopping_trips enable row level security;
alter table shopping_trip_items enable row level security;

create policy "Members can read shopping trips"
on shopping_trips for select
using (is_household_member(household_id));

create policy "Members can insert shopping trips"
on shopping_trips for insert
with check (is_household_member(household_id));

create policy "Members can update shopping trips"
on shopping_trips for update
using (is_household_member(household_id))
with check (is_household_member(household_id));

create policy "Members can delete shopping trips"
on shopping_trips for delete
using (is_household_member(household_id));

create policy "Members can read shopping trip items"
on shopping_trip_items for select
using (is_household_member(household_id));

create policy "Members can insert shopping trip items"
on shopping_trip_items for insert
with check (is_household_member(household_id));

create policy "Members can update shopping trip items"
on shopping_trip_items for update
using (is_household_member(household_id))
with check (is_household_member(household_id));

create policy "Members can delete shopping trip items"
on shopping_trip_items for delete
using (is_household_member(household_id));
