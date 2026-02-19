create table categories (
  id serial primary key,
  category_name text not null unique
);

insert into categories (category_name) values
('Doctor'),
('Work'),
('Personal'),
('Fitness'),
('Other'),
('Kids');

create table appointments (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  appointment_date date not null,
  appointment_time time not null,
  user_id uuid not null references auth.users(id) on delete cascade,
  category_id integer references categories(id) on delete set null,
  created_at timestamp default now()
);

create table reminders (
  id serial primary key,
  appointment_id uuid not null references appointments(id) on delete cascade,
  reminder_minutes integer not null
);

insert into appointments 
(title, appointment_date, appointment_time, user_id, category_id)
values
('Doctor Checkup', '2026-02-25', '10:30:00', 'cffb2aa6-3255-42b2-ba28-ec95e3745e2f', 1),
('Team Meeting', '2026-02-26', '14:00:00', 'cffb2aa6-3255-42b2-ba28-ec95e3745e2f', 2),
('Gym Session', '2026-02-27', '18:00:00', 'cffb2aa6-3255-42b2-ba28-ec95e3745e2f', 4),
('Dinner with Family', '2026-02-28', '19:30:00', 'cffb2aa6-3255-42b2-ba28-ec95e3745e2f', 3);

select id, title from appointments;

insert into reminders (appointment_id, reminder_minutes)
values
('cd3fbf25-97f7-4075-8482-eeebb5849132', 30),
('f2df2218-b566-47ec-87b0-2ff7dd29fc0a', 60),
('f2df2218-b566-47ec-87b0-2ff7dd29fc0a', 15),
('bcf90d13-09d2-48fe-97f2-d0e52eb5be43', 45),
('4827a1bd-b64c-4dc0-b869-35ffda2ecaa6', 10);

select * from reminders

select * from appointments;


select 
  a.title,
  a.appointment_date,
  a.appointment_time,
  c.category_name,
  r.reminder_minutes
from appointments a
left join categories c on a.category_id = c.id
left join reminders r on a.id = r.appointment_id;

alter table appointments
add column appointment_datetime timestamptz;

alter table appointments
add column timezone text;

update appointments
set appointment_datetime = 
  (appointment_date + appointment_time)::timestamptz;



update appointments
set timezone = 'UTC';

alter table appointments
drop column appointment_date;

alter table appointments
drop column appointment_time;


select * from appointments;

insert into appointments 
(title, appointment_datetime, timezone, user_id, category_id)
values
(
  'New York Client Meeting',
  '2026-03-01 10:00:00 America/New_York',
  'America/New_York',
  'cffb2aa6-3255-42b2-ba28-ec95e3745e2f',
  2
),
(
  'London Team Sync',
  '2026-03-02 09:30:00 Europe/London',
  'Europe/London',
  'cffb2aa6-3255-42b2-ba28-ec95e3745e2f',
  2
),
(
  'India Project Discussion',
  '2026-03-03 18:00:00 Asia/Kolkata',
  'Asia/Kolkata',
  'cffb2aa6-3255-42b2-ba28-ec95e3745e2f',
  2
),
(
  'Sydney Strategy Call',
  '2026-03-04 14:00:00 Australia/Sydney',
  'Australia/Sydney',
  'cffb2aa6-3255-42b2-ba28-ec95e3745e2f',
  2
),
(
  'Toronto Doctor Appointment',
  '2026-03-05 11:15:00 America/Toronto',
  'America/Toronto',
  'cffb2aa6-3255-42b2-ba28-ec95e3745e2f',
  1
);

select * from appointments;

select title, appointment_datetime from appointments;


