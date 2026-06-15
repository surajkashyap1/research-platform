-- Supabase Storage setup for profile pictures and certification proof uploads.
-- Apply on fresh databases with:
--   node scripts/apply-sql.mjs drizzle/manual/0003_profile_assets_storage.sql

insert into storage.buckets (id, name, public)
values ('profile-assets', 'profile-assets', true)
on conflict (id) do update set public = excluded.public;

drop policy if exists "Profile assets are publicly readable" on storage.objects;
create policy "Profile assets are publicly readable"
on storage.objects for select
using (bucket_id = 'profile-assets');

drop policy if exists "Users can upload their own profile assets" on storage.objects;
create policy "Users can upload their own profile assets"
on storage.objects for insert
to authenticated
with check (
  bucket_id = 'profile-assets'
  and (storage.foldername(name))[1] = auth.uid()::text
);

drop policy if exists "Users can update their own profile assets" on storage.objects;
create policy "Users can update their own profile assets"
on storage.objects for update
to authenticated
using (
  bucket_id = 'profile-assets'
  and (storage.foldername(name))[1] = auth.uid()::text
)
with check (
  bucket_id = 'profile-assets'
  and (storage.foldername(name))[1] = auth.uid()::text
);

drop policy if exists "Users can delete their own profile assets" on storage.objects;
create policy "Users can delete their own profile assets"
on storage.objects for delete
to authenticated
using (
  bucket_id = 'profile-assets'
  and (storage.foldername(name))[1] = auth.uid()::text
);
