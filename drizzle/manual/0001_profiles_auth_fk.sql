-- Manual migration (cross-schema FK that drizzle-kit can't express).
-- Links public.profiles.id -> auth.users.id with ON DELETE CASCADE, so
-- deleting a Supabase auth user also removes their profile row.
-- Apply with: node scripts/apply-sql.mjs drizzle/manual/0001_profiles_auth_fk.sql

-- 1) Remove any orphaned profiles (auth user already deleted).
delete from public.profiles p
where not exists (select 1 from auth.users u where u.id = p.id);

-- 2) Add the cascade FK if it isn't already there.
do $$
begin
  if not exists (
    select 1 from pg_constraint where conname = 'profiles_id_auth_users_fk'
  ) then
    alter table public.profiles
      add constraint profiles_id_auth_users_fk
      foreign key (id) references auth.users(id) on delete cascade;
  end if;
end $$;
