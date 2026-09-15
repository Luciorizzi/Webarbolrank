begin;

do $$
declare bucket storage.buckets%rowtype;
begin
  select * into bucket from storage.buckets where id = 'campaign-images';
  if bucket.id is null then raise exception 'campaign-images bucket missing'; end if;
  if not bucket.public then raise exception 'campaign-images must be public'; end if;
  if bucket.file_size_limit <> 5242880 then raise exception 'campaign-images size limit mismatch'; end if;
  if not bucket.allowed_mime_types @> array['image/jpeg', 'image/png', 'image/webp'] then raise exception 'campaign-images MIME restrictions mismatch'; end if;
  if exists (select 1 from pg_policies where schemaname = 'storage' and tablename = 'objects' and 'anon' = any(roles)) then raise exception 'anon storage policy exists'; end if;
  if (select count(*) from pg_policies where schemaname = 'storage' and tablename = 'objects' and policyname like 'Admins can % campaign images') <> 3 then raise exception 'admin storage policies missing'; end if;
end $$;

rollback;
