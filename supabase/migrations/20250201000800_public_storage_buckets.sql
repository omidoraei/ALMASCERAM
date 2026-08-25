begin;

-- MVP STORAGE DECISION (FINAL): public-read buckets avoid signed URLs and Edge Functions.
-- Writes remain protected by storage.objects RLS and public.is_admin().
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values
  (
    'catalog-media',
    'catalog-media',
    true,
    52428800,
    array['image/jpeg', 'image/png', 'image/webp', 'image/avif', 'video/mp4']::text[]
  ),
  (
    'catalog-documents',
    'catalog-documents',
    true,
    26214400,
    array['application/pdf']::text[]
  ),
  (
    'seo-media',
    'seo-media',
    true,
    8388608,
    array['image/jpeg', 'image/png', 'image/webp', 'image/avif']::text[]
  )
on conflict (id) do update
set
  name = excluded.name,
  public = true,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

-- Drop only the canonical policy names so unrelated future/private buckets are untouched.
drop policy if exists catalog_public_assets_select on storage.objects;
drop policy if exists catalog_admin_assets_insert on storage.objects;
drop policy if exists catalog_admin_assets_update on storage.objects;
drop policy if exists catalog_admin_assets_delete on storage.objects;

-- Public bucket delivery bypasses RLS for direct object URLs by design. This SELECT policy
-- additionally allows list/download operations through the Storage API for anon/authenticated.
create policy catalog_public_assets_select
on storage.objects
for select
to anon, authenticated
using (
  bucket_id in ('catalog-media', 'catalog-documents', 'seo-media')
);

create policy catalog_admin_assets_insert
on storage.objects
for insert
to authenticated
with check (
  bucket_id in ('catalog-media', 'catalog-documents', 'seo-media')
  and public.is_admin()
);

create policy catalog_admin_assets_update
on storage.objects
for update
to authenticated
using (
  bucket_id in ('catalog-media', 'catalog-documents', 'seo-media')
  and public.is_admin()
)
with check (
  bucket_id in ('catalog-media', 'catalog-documents', 'seo-media')
  and public.is_admin()
);

create policy catalog_admin_assets_delete
on storage.objects
for delete
to authenticated
using (
  bucket_id in ('catalog-media', 'catalog-documents', 'seo-media')
  and public.is_admin()
);

comment on policy catalog_public_assets_select on storage.objects is
  'MVP public read for catalog media/documents/SEO assets. Direct public URLs require no signing.';
comment on policy catalog_admin_assets_insert on storage.objects is
  'Only active admins may upload objects to MVP public catalog buckets.';
comment on policy catalog_admin_assets_update on storage.objects is
  'Only active admins may replace or move objects inside MVP public catalog buckets.';
comment on policy catalog_admin_assets_delete on storage.objects is
  'Only active admins may delete objects from MVP public catalog buckets.';

commit;
