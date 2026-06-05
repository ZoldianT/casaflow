create extension if not exists pgcrypto;

create table if not exists households (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  created_at timestamp with time zone default now()
);

create table if not exists household_members (
  id uuid primary key default gen_random_uuid(),
  household_id uuid not null references households(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  display_name text not null,
  created_at timestamp with time zone default now(),
  unique(household_id, user_id)
);

create table if not exists tasks (
  id uuid primary key default gen_random_uuid(),
  household_id uuid not null references households(id) on delete cascade,
  title text not null,
  note text,
  category text not null default 'Altro',
  assigned_to text not null default 'Chi puo',
  priority text not null default 'Normale',
  due_date date,
  status text not null default 'Da fare',
  recurrence text not null default 'Nessuna',
  created_by uuid references auth.users(id),
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now(),
  completed_at timestamp with time zone,
  constraint tasks_category_check check (category in ('Bimba', 'Spesa', 'Bucato', 'Cucina', 'Pulizie', 'Casa / lavoretti', 'Amministrativo', 'Altro')),
  constraint tasks_assigned_check check (assigned_to in ('Peppe', 'Moglie', 'Chi puo')),
  constraint tasks_priority_check check (priority in ('Essenziale', 'Normale', 'Bassa')),
  constraint tasks_status_check check (status in ('Da fare', 'Fatto', 'Archiviato')),
  constraint tasks_recurrence_check check (recurrence in ('Nessuna', 'Giornaliera', 'Settimanale', 'Ogni 2 settimane', 'Mensile'))
);

create table if not exists shopping_items (
  id uuid primary key default gen_random_uuid(),
  household_id uuid not null references households(id) on delete cascade,
  title text not null,
  category text not null default 'Altro',
  note text,
  status text not null default 'Da comprare',
  created_by uuid references auth.users(id),
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now(),
  bought_at timestamp with time zone,
  constraint shopping_category_check check (category in ('Bimba', 'Alimentari', 'Casa', 'Farmacia', 'Igiene', 'Altro')),
  constraint shopping_status_check check (status in ('Da comprare', 'Comprato'))
);

create table if not exists laundry_items (
  id uuid primary key default gen_random_uuid(),
  household_id uuid not null references households(id) on delete cascade,
  title text not null,
  laundry_status text not null default 'Da lavare',
  assigned_to text not null default 'Chi puo',
  note text,
  created_by uuid references auth.users(id),
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now(),
  completed_at timestamp with time zone,
  constraint laundry_status_check check (laundry_status in ('Da lavare', 'Lavatrice da avviare', 'Da stendere / asciugare', 'Da piegare', 'Da mettere a posto', 'Fatto')),
  constraint laundry_assigned_check check (assigned_to in ('Peppe', 'Moglie', 'Chi puo'))
);

create table if not exists reset_checklist (
  id uuid primary key default gen_random_uuid(),
  household_id uuid not null references households(id) on delete cascade,
  reset_date date not null,
  label text not null,
  is_done boolean not null default false,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now(),
  unique(household_id, reset_date, label)
);

create or replace function set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists tasks_set_updated_at on tasks;
create trigger tasks_set_updated_at before update on tasks
for each row execute function set_updated_at();

drop trigger if exists shopping_items_set_updated_at on shopping_items;
create trigger shopping_items_set_updated_at before update on shopping_items
for each row execute function set_updated_at();

drop trigger if exists laundry_items_set_updated_at on laundry_items;
create trigger laundry_items_set_updated_at before update on laundry_items
for each row execute function set_updated_at();

drop trigger if exists reset_checklist_set_updated_at on reset_checklist;
create trigger reset_checklist_set_updated_at before update on reset_checklist
for each row execute function set_updated_at();

alter table households enable row level security;
alter table household_members enable row level security;
alter table tasks enable row level security;
alter table shopping_items enable row level security;
alter table laundry_items enable row level security;
alter table reset_checklist enable row level security;

create or replace function is_household_member(target_household_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from household_members
    where household_id = target_household_id
      and user_id = auth.uid()
  );
$$;

create policy "Members can read households"
on households for select
using (is_household_member(id));

create policy "Members can read household members"
on household_members for select
using (is_household_member(household_id));

create policy "Members can manage household members"
on household_members for all
using (is_household_member(household_id))
with check (is_household_member(household_id));

create policy "Members can read tasks"
on tasks for select
using (is_household_member(household_id));

create policy "Members can insert tasks"
on tasks for insert
with check (is_household_member(household_id));

create policy "Members can update tasks"
on tasks for update
using (is_household_member(household_id))
with check (is_household_member(household_id));

create policy "Members can delete tasks"
on tasks for delete
using (is_household_member(household_id));

create policy "Members can read shopping items"
on shopping_items for select
using (is_household_member(household_id));

create policy "Members can insert shopping items"
on shopping_items for insert
with check (is_household_member(household_id));

create policy "Members can update shopping items"
on shopping_items for update
using (is_household_member(household_id))
with check (is_household_member(household_id));

create policy "Members can delete shopping items"
on shopping_items for delete
using (is_household_member(household_id));

create policy "Members can read laundry items"
on laundry_items for select
using (is_household_member(household_id));

create policy "Members can insert laundry items"
on laundry_items for insert
with check (is_household_member(household_id));

create policy "Members can update laundry items"
on laundry_items for update
using (is_household_member(household_id))
with check (is_household_member(household_id));

create policy "Members can delete laundry items"
on laundry_items for delete
using (is_household_member(household_id));

create policy "Members can read reset checklist"
on reset_checklist for select
using (is_household_member(household_id));

create policy "Members can insert reset checklist"
on reset_checklist for insert
with check (is_household_member(household_id));

create policy "Members can update reset checklist"
on reset_checklist for update
using (is_household_member(household_id))
with check (is_household_member(household_id));

create policy "Members can delete reset checklist"
on reset_checklist for delete
using (is_household_member(household_id));

-- Seed manuale dopo aver creato Peppe e Moglie da Supabase Auth.
-- 1. Recupera i due id da Authentication > Users.
-- 2. Esegui e conserva l'id restituito:
-- insert into households (name) values ('Casa Peppe') returning id;
-- 3. Associa gli utenti:
-- insert into household_members (household_id, user_id, display_name)
-- values
--   ('HOUSEHOLD_ID', 'AUTH_USER_ID_PEPPE', 'Peppe'),
--   ('HOUSEHOLD_ID', 'AUTH_USER_ID_MOGLIE', 'Moglie');
