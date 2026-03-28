-- ============================================================
-- Hvidbjerg Service – Kundeportal database schema
-- Kør dette i Supabase SQL Editor (Project > SQL Editor)
-- ============================================================

-- 1. Profiles (kunder)
create table if not exists public.profiles (
  id uuid primary key references auth.users on delete cascade,
  company_name text,
  contact_name text,
  phone text,
  created_at timestamptz not null default now()
);

-- Opret automatisk en profil ved ny bruger-registrering
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id) values (new.id)
  on conflict (id) do nothing;
  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- 2. Services (ydelser – admin opretter disse)
create table if not exists public.services (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  description text,
  duration_hours int,
  active boolean not null default true
);

-- Eksempel-ydelser
insert into public.services (name, description, duration_hours, active) values
  ('Inspektion', 'Kvalitetsinspektion af lokaler eller produkter', 2, true),
  ('Rengøring', 'Professionel rengøring af erhvervslokaler', 4, true),
  ('Vedligeholdelse', 'Løbende vedligeholdelse og service', 3, true)
on conflict do nothing;

-- 3. Tasks (opgaver/bookings)
create table if not exists public.tasks (
  id uuid primary key default gen_random_uuid(),
  customer_id uuid not null references public.profiles on delete cascade,
  service_id uuid references public.services on delete set null,
  title text not null,
  description text,
  status text not null default 'afventer'
    check (status in ('afventer', 'planlagt', 'igangværende', 'afsluttet')),
  scheduled_at timestamptz,
  completed_at timestamptz,
  created_at timestamptz not null default now()
);

-- 4. Task employees (medarbejdere på opgave)
create table if not exists public.task_employees (
  id uuid primary key default gen_random_uuid(),
  task_id uuid not null references public.tasks on delete cascade,
  employee_name text not null,
  employee_role text,
  assigned_at timestamptz not null default now()
);

-- 5. Task feedback (feedback fra kunder)
create table if not exists public.task_feedback (
  id uuid primary key default gen_random_uuid(),
  task_id uuid not null references public.tasks on delete cascade,
  customer_id uuid not null references public.profiles on delete cascade,
  rating int not null check (rating between 1 and 5),
  comment text,
  created_at timestamptz not null default now(),
  unique (task_id, customer_id)
);

-- 6. Messages (chat beskeder)
create table if not exists public.messages (
  id uuid primary key default gen_random_uuid(),
  task_id uuid not null references public.tasks on delete cascade,
  sender_id uuid not null references auth.users on delete cascade,
  sender_type text not null check (sender_type in ('customer', 'admin')),
  content text not null,
  created_at timestamptz not null default now()
);

-- ============================================================
-- Row Level Security (RLS)
-- ============================================================

alter table public.profiles enable row level security;
alter table public.services enable row level security;
alter table public.tasks enable row level security;
alter table public.task_employees enable row level security;
alter table public.task_feedback enable row level security;
alter table public.messages enable row level security;

-- profiles: kunden kan se og redigere sin egen profil
create policy "Kunder kan se egen profil" on public.profiles
  for select using (auth.uid() = id);
create policy "Kunder kan opdatere egen profil" on public.profiles
  for update using (auth.uid() = id);
create policy "Kunder kan oprette profil" on public.profiles
  for insert with check (auth.uid() = id);

-- services: alle autentificerede brugere kan se aktive ydelser
create policy "Alle kan se aktive ydelser" on public.services
  for select using (active = true);

-- tasks: kunden ser kun egne opgaver
create policy "Kunder ser egne opgaver" on public.tasks
  for select using (auth.uid() = customer_id);
create policy "Kunder kan oprette opgaver" on public.tasks
  for insert with check (auth.uid() = customer_id);

-- task_employees: kunden kan se medarbejdere på egne opgaver
create policy "Kunder kan se medarbejdere på egne opgaver" on public.task_employees
  for select using (
    exists (
      select 1 from public.tasks
      where tasks.id = task_employees.task_id
      and tasks.customer_id = auth.uid()
    )
  );

-- task_feedback: kunden kan se og oprette feedback på egne opgaver
create policy "Kunder ser feedback på egne opgaver" on public.task_feedback
  for select using (auth.uid() = customer_id);
create policy "Kunder kan give feedback" on public.task_feedback
  for insert with check (auth.uid() = customer_id);

-- messages: kunden kan se og sende beskeder på egne opgaver
create policy "Kunder ser beskeder på egne opgaver" on public.messages
  for select using (
    exists (
      select 1 from public.tasks
      where tasks.id = messages.task_id
      and tasks.customer_id = auth.uid()
    )
  );
create policy "Kunder kan sende beskeder" on public.messages
  for insert with check (
    auth.uid() = sender_id
    and sender_type = 'customer'
    and exists (
      select 1 from public.tasks
      where tasks.id = messages.task_id
      and tasks.customer_id = auth.uid()
    )
  );

-- ============================================================
-- Realtime (aktivér for chat og task status)
-- ============================================================
-- Kør i Supabase Dashboard > Database > Replication:
-- Aktivér replication for tabellerne: messages, tasks
