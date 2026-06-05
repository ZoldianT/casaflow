alter table tasks drop constraint if exists tasks_assigned_check;
alter table laundry_items drop constraint if exists laundry_assigned_check;
alter table shopping_trips drop constraint if exists shopping_trips_assigned_check;

update tasks
set assigned_to = 'Chi puo'
where assigned_to = U&'Chi pu\00F2';

update laundry_items
set assigned_to = 'Chi puo'
where assigned_to = U&'Chi pu\00F2';

update shopping_trips
set assigned_to = 'Chi puo'
where assigned_to = U&'Chi pu\00F2';

alter table tasks alter column assigned_to set default 'Chi puo';
alter table laundry_items alter column assigned_to set default 'Chi puo';
alter table shopping_trips alter column assigned_to set default 'Chi puo';

alter table tasks
  add constraint tasks_assigned_check
  check (assigned_to in ('Peppe', 'Moglie', 'Chi puo'));

alter table laundry_items
  add constraint laundry_assigned_check
  check (assigned_to in ('Peppe', 'Moglie', 'Chi puo'));

alter table shopping_trips
  add constraint shopping_trips_assigned_check
  check (assigned_to in ('Peppe', 'Moglie', 'Chi puo'));
