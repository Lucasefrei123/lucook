-- =========================================================
-- 001_schema.sql — Générateur de recettes
-- Tables, RLS, bucket privé et Realtime
-- =========================================================

-- ---------- Fonction utilitaire : met à jour updated_at ----------
create or replace function public.maj_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- ---------- Table profils ----------
create table if not exists public.profils (
  user_id              uuid primary key references auth.users(id) on delete cascade,
  role                 text not null default 'utilisateur'
                         check (role in ('utilisateur', 'admin')),
  regime               text,
  ingredients_a_eviter text[] not null default '{}',
  objectif_sport       text
                         check (objectif_sport in ('prise_de_masse', 'seche', 'maintien')),
  created_at           timestamptz not null default now(),
  updated_at           timestamptz not null default now()
);

-- ---------- Table generations ----------
create table if not exists public.generations (
  id             uuid primary key default gen_random_uuid(),
  user_id        uuid not null default auth.uid()
                   references auth.users(id) on delete cascade,
  mode           text not null check (mode in ('frigo', 'envie', 'sport')),
  entrees        jsonb not null default '{}',
  chemin_photo   text,
  statut         text not null default 'en_attente'
                   check (statut in ('en_attente', 'en_cours', 'terminee', 'erreur')),
  message_erreur text,
  tentatives     int not null default 0,
  created_at     timestamptz not null default now(),
  updated_at     timestamptz not null default now()
);

-- ---------- Table recettes (liée à generations par clé étrangère) ----------
create table if not exists public.recettes (
  id             uuid primary key default gen_random_uuid(),
  user_id        uuid not null references auth.users(id) on delete cascade,
  generation_id  uuid not null references public.generations(id) on delete cascade,
  titre          text not null,
  description    text,
  temps_minutes  int,
  difficulte     text check (difficulte in ('facile', 'moyen', 'difficile')),
  portions       int,
  ingredients    jsonb not null default '[]',
  etapes         jsonb not null default '[]',
  macros         jsonb,
  tags           text[] not null default '{}',
  favori         boolean not null default false,
  created_at     timestamptz not null default now()
);

-- ---------- Table envois_email ----------
create table if not exists public.envois_email (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null default auth.uid()
                references auth.users(id) on delete cascade,
  recette_ids uuid[] not null,
  statut      text not null check (statut in ('envoye', 'echec')),
  erreur      text,
  created_at  timestamptz not null default now()
);

-- ---------- Index ----------
create index if not exists generations_user_id_idx   on public.generations (user_id);
create index if not exists generations_statut_idx    on public.generations (statut);
create index if not exists recettes_user_id_idx      on public.recettes (user_id);
create index if not exists recettes_generation_idx   on public.recettes (generation_id);
create index if not exists envois_email_user_id_idx  on public.envois_email (user_id);

-- ---------- Triggers updated_at ----------
drop trigger if exists profils_maj on public.profils;
create trigger profils_maj before update on public.profils
  for each row execute function public.maj_updated_at();

drop trigger if exists generations_maj on public.generations;
create trigger generations_maj before update on public.generations
  for each row execute function public.maj_updated_at();

-- ---------- Création automatique du profil à l'inscription ----------
create or replace function public.creer_profil()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.profils (user_id) values (new.id)
  on conflict (user_id) do nothing;
  return new;
end;
$$;

drop trigger if exists a_l_inscription on auth.users;
create trigger a_l_inscription after insert on auth.users
  for each row execute function public.creer_profil();

-- ---------- Fonction est_admin() ----------
-- security definer : lit profils sans repasser par la RLS (évite la récursion)
create or replace function public.est_admin()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1 from public.profils
    where user_id = (select auth.uid()) and role = 'admin'
  );
$$;

-- =========================================================
-- Row Level Security : activée sur TOUTES les tables
-- =========================================================
alter table public.profils      enable row level security;
alter table public.generations  enable row level security;
alter table public.recettes     enable row level security;
alter table public.envois_email enable row level security;

-- ---------- profils ----------
drop policy if exists "profils: lecture" on public.profils;
create policy "profils: lecture" on public.profils
  for select to authenticated
  using (user_id = (select auth.uid()) or public.est_admin());

drop policy if exists "profils: modification perso" on public.profils;
create policy "profils: modification perso" on public.profils
  for update to authenticated
  using (user_id = (select auth.uid()))
  with check (user_id = (select auth.uid()));

-- Un utilisateur ne peut modifier QUE ses préférences, jamais son rôle
revoke update on public.profils from authenticated;
grant update (regime, ingredients_a_eviter, objectif_sport) on public.profils to authenticated;

-- ---------- generations ----------
drop policy if exists "generations: lecture" on public.generations;
create policy "generations: lecture" on public.generations
  for select to authenticated
  using (user_id = (select auth.uid()) or public.est_admin());

drop policy if exists "generations: creation perso" on public.generations;
create policy "generations: creation perso" on public.generations
  for insert to authenticated
  with check (user_id = (select auth.uid()) and statut = 'en_attente');
-- Pas de politique update : seul le worker (clé secrète) fait avancer le statut

-- ---------- recettes ----------
drop policy if exists "recettes: lecture" on public.recettes;
create policy "recettes: lecture" on public.recettes
  for select to authenticated
  using (user_id = (select auth.uid()) or public.est_admin());

drop policy if exists "recettes: favori perso" on public.recettes;
create policy "recettes: favori perso" on public.recettes
  for update to authenticated
  using (user_id = (select auth.uid()))
  with check (user_id = (select auth.uid()));

drop policy if exists "recettes: suppression perso" on public.recettes;
create policy "recettes: suppression perso" on public.recettes
  for delete to authenticated
  using (user_id = (select auth.uid()));

-- Seule la colonne favori est modifiable par l'utilisateur
revoke update on public.recettes from authenticated;
grant update (favori) on public.recettes to authenticated;
-- Pas de politique insert : seul le worker crée les recettes

-- ---------- envois_email ----------
drop policy if exists "envois: lecture" on public.envois_email;
create policy "envois: lecture" on public.envois_email
  for select to authenticated
  using (user_id = (select auth.uid()) or public.est_admin());

drop policy if exists "envois: creation perso" on public.envois_email;
create policy "envois: creation perso" on public.envois_email
  for insert to authenticated
  with check (user_id = (select auth.uid()));

-- =========================================================
-- Realtime : diffuser les changements de generations et recettes
-- =========================================================
do $$
begin
  if not exists (
    select 1 from pg_publication_tables
    where pubname = 'supabase_realtime' and tablename = 'generations'
  ) then
    alter publication supabase_realtime add table public.generations;
  end if;
  if not exists (
    select 1 from pg_publication_tables
    where pubname = 'supabase_realtime' and tablename = 'recettes'
  ) then
    alter publication supabase_realtime add table public.recettes;
  end if;
end $$;

-- =========================================================
-- Storage : bucket privé pour les photos de frigo
-- =========================================================
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('photos-frigo', 'photos-frigo', false, 5242880,
        array['image/jpeg', 'image/png', 'image/webp'])
on conflict (id) do nothing;

-- Chaque utilisateur n'accède qu'à son dossier : photos-frigo/<son user_id>/...
drop policy if exists "photos: lecture perso" on storage.objects;
create policy "photos: lecture perso" on storage.objects
  for select to authenticated
  using (bucket_id = 'photos-frigo'
         and (storage.foldername(name))[1] = (select auth.uid())::text);

drop policy if exists "photos: envoi perso" on storage.objects;
create policy "photos: envoi perso" on storage.objects
  for insert to authenticated
  with check (bucket_id = 'photos-frigo'
              and (storage.foldername(name))[1] = (select auth.uid())::text);

drop policy if exists "photos: suppression perso" on storage.objects;
create policy "photos: suppression perso" on storage.objects
  for delete to authenticated
  using (bucket_id = 'photos-frigo'
         and (storage.foldername(name))[1] = (select auth.uid())::text);