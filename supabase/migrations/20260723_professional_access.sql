-- Exécutez ce fichier dans Supabase SQL Editor avant de déployer l’application.
-- Les rôles ne sont jamais choisis côté navigateur : ils sont stockés ici.

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  role text not null default 'patient' check (role in ('patient', 'cabinet', 'admin')),
  full_name text,
  phone text,
  created_at timestamptz not null default now()
);

alter table public.cabinets add column if not exists owner_id uuid references auth.users(id) on delete set null;
alter table public.reviews add column if not exists reported boolean not null default false;
create index if not exists cabinets_owner_id_idx on public.cabinets(owner_id);

create or replace function public.create_profile_for_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  -- Ne dépend volontairement que des deux colonnes requises par l'application.
  -- Cela évite de bloquer la création Auth sur une ancienne table profiles.
  insert into public.profiles (id, role)
  values (new.id, 'patient')
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created after insert on auth.users
for each row execute procedure public.create_profile_for_user();

create or replace function public.is_admin()
returns boolean language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.profiles where id = auth.uid() and role = 'admin');
$$;

alter table public.profiles enable row level security;
alter table public.cabinets enable row level security;
alter table public.appointments enable row level security;
alter table public.reviews enable row level security;

drop policy if exists "profiles: own profile" on public.profiles;
create policy "profiles: own profile" on public.profiles for select using (id = auth.uid() or public.is_admin());

drop policy if exists "cabinets: public active read" on public.cabinets;
create policy "cabinets: public active read" on public.cabinets for select using (is_active = true or owner_id = auth.uid() or public.is_admin());
drop policy if exists "cabinets: admin insert" on public.cabinets;
create policy "cabinets: admin insert" on public.cabinets for insert with check (public.is_admin());
drop policy if exists "cabinets: admin update" on public.cabinets;
create policy "cabinets: admin update" on public.cabinets for update using (public.is_admin()) with check (public.is_admin());
drop policy if exists "cabinets: admin delete" on public.cabinets;
create policy "cabinets: admin delete" on public.cabinets for delete using (public.is_admin());
drop policy if exists "cabinets: owner update" on public.cabinets;
create policy "cabinets: owner update" on public.cabinets for update using (owner_id = auth.uid()) with check (owner_id = auth.uid());

drop policy if exists "appointments: patient insert" on public.appointments;
create policy "appointments: patient insert" on public.appointments for insert with check (patient_id = auth.uid());
drop policy if exists "appointments: patient read" on public.appointments;
create policy "appointments: patient read" on public.appointments for select using (patient_id = auth.uid());
drop policy if exists "appointments: professional read" on public.appointments;
create policy "appointments: professional read" on public.appointments for select using (public.is_admin() or exists (select 1 from public.cabinets where cabinets.id = appointments.cabinet_id and cabinets.owner_id = auth.uid()));
drop policy if exists "appointments: cabinet update" on public.appointments;
create policy "appointments: cabinet update" on public.appointments for update using (public.is_admin() or exists (select 1 from public.cabinets where cabinets.id = appointments.cabinet_id and cabinets.owner_id = auth.uid()));

drop policy if exists "reviews: public published read" on public.reviews;
create policy "reviews: public published read" on public.reviews for select using (status = 'published' or public.is_admin() or exists (select 1 from public.cabinets where cabinets.id = reviews.cabinet_id and cabinets.owner_id = auth.uid()));
drop policy if exists "reviews: cabinet report" on public.reviews;
create policy "reviews: cabinet report" on public.reviews for update using (public.is_admin() or exists (select 1 from public.cabinets where cabinets.id = reviews.cabinet_id and cabinets.owner_id = auth.uid()));

-- Après création des utilisateurs Auth, associez-les explicitement :
-- update public.profiles set role = 'admin' where id = '<uuid-admin>';
-- update public.profiles set role = 'cabinet' where id = '<uuid-cabinet>';
-- update public.cabinets set owner_id = '<uuid-cabinet>' where id = '<uuid-cabinet-record>';
