insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'campaign-images',
  'campaign-images',
  true,
  5242880,
  array['image/jpeg', 'image/png', 'image/webp']
)
on conflict (id) do update set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

-- Permite comprobar la membresía propia sin revelar la lista de admins.
create policy "Users can read their own admin membership"
on public.admin_users for select to authenticated
using ((select auth.uid()) = user_id);

grant select on public.admin_users to authenticated;

create policy "Admins can upload campaign images"
on storage.objects for insert to authenticated
with check (
  bucket_id = 'campaign-images'
  and (storage.foldername(name))[1] = 'campaigns'
  and (storage.foldername(name))[3] in ('cover', 'evidence')
  and lower(storage.extension(name)) in ('jpg', 'jpeg', 'png', 'webp')
  and exists (select 1 from public.admin_users where user_id = (select auth.uid()))
);

create policy "Admins can update campaign images"
on storage.objects for update to authenticated
using (
  bucket_id = 'campaign-images'
  and exists (select 1 from public.admin_users where user_id = (select auth.uid()))
)
with check (
  bucket_id = 'campaign-images'
  and (storage.foldername(name))[1] = 'campaigns'
  and (storage.foldername(name))[3] in ('cover', 'evidence')
  and lower(storage.extension(name)) in ('jpg', 'jpeg', 'png', 'webp')
  and exists (select 1 from public.admin_users where user_id = (select auth.uid()))
);

create policy "Admins can delete campaign images"
on storage.objects for delete to authenticated
using (
  bucket_id = 'campaign-images'
  and exists (select 1 from public.admin_users where user_id = (select auth.uid()))
);

