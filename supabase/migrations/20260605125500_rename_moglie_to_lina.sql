alter table tasks drop constraint if exists tasks_assigned_check;
alter table laundry_items drop constraint if exists laundry_assigned_check;
alter table shopping_trips drop constraint if exists shopping_trips_assigned_check;

update tasks
set assigned_to = 'Lina'
where assigned_to = 'Moglie';

update laundry_items
set assigned_to = 'Lina'
where assigned_to = 'Moglie';

update shopping_trips
set assigned_to = 'Lina'
where assigned_to = 'Moglie';

update household_members
set display_name = 'Lina'
where display_name = 'Moglie';

alter table tasks
  add constraint tasks_assigned_check
  check (assigned_to in ('Peppe', 'Lina', 'Chi puo'));

alter table laundry_items
  add constraint laundry_assigned_check
  check (assigned_to in ('Peppe', 'Lina', 'Chi puo'));

alter table shopping_trips
  add constraint shopping_trips_assigned_check
  check (assigned_to in ('Peppe', 'Lina', 'Chi puo'));
