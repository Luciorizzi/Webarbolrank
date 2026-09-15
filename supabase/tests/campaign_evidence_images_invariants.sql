begin;

do $$
declare
  campaign_id uuid;
  v_evidence_id uuid;
  first_image uuid;
begin
  if to_regclass('public.campaign_evidence_images') is null then
    raise exception 'campaign_evidence_images table missing';
  end if;
  if not exists (
    select 1 from pg_policies
    where schemaname = 'public'
      and tablename = 'campaign_evidence_images'
      and policyname = 'Published campaign evidence images are readable'
  ) then raise exception 'public read policy missing'; end if;

  insert into public.campaigns (slug, title, status)
  values ('evidence-images-test', 'Evidence images test', 'scheduled')
  returning id into campaign_id;
  insert into public.campaign_evidence (campaign_id, type, label)
  values (campaign_id, 'photo', 'Entrega de prueba')
  returning id into v_evidence_id;
  insert into public.campaign_evidence_images (evidence_id, image_url, storage_path, sort_order)
  values (v_evidence_id, 'https://example.com/one.jpg', 'campaigns/test/evidence/test/one.jpg', 0)
  returning id into first_image;
  insert into public.campaign_evidence_images (evidence_id, image_url, storage_path, sort_order)
  values (v_evidence_id, 'https://example.com/two.jpg', 'campaigns/test/evidence/test/two.jpg', 1);

  if (select count(*) from public.campaign_evidence_images where evidence_id = v_evidence_id) <> 2 then
    raise exception 'multiple images were not stored';
  end if;
  delete from public.campaign_evidence where id = v_evidence_id;
  if exists (select 1 from public.campaign_evidence_images where id = first_image) then
    raise exception 'evidence image cascade failed';
  end if;
end $$;

rollback;
