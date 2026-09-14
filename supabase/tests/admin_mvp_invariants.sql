begin;

do $$
declare
  before_ranking jsonb;
  after_ranking jsonb;
  category uuid;
  participant uuid;
  campaign uuid;
begin
  if to_regclass('public.admin_users') is null then raise exception 'admin_users missing'; end if;
  if not (select relrowsecurity from pg_class where oid = 'public.admin_users'::regclass) then raise exception 'admin_users RLS disabled'; end if;
  if has_table_privilege('anon', 'public.admin_users', 'select') or has_table_privilege('authenticated', 'public.admin_users', 'select') then raise exception 'admin_users exposed'; end if;
  if has_table_privilege('authenticated', 'public.donations', 'update') then raise exception 'authenticated may update donations'; end if;

  select coalesce(jsonb_agg(to_jsonb(r) order by r.rank_position), '[]') into before_ranking from public.get_ranking('historical') r;
  select id into category from public.categories order by created_at limit 1;
  insert into public.participants(name, slug, category_id, active) values ('Admin test', 'admin-mvp-test', category, true) returning id into participant;
  begin
    insert into public.participants(name, slug, category_id) values ('Duplicate', 'admin-mvp-test', category);
    raise exception 'duplicate slug accepted';
  exception when unique_violation then null;
  end;
  update public.participants set name = 'Admin test editado', active = false where id = participant;
  if not found then raise exception 'participant update failed'; end if;

  insert into public.campaigns(slug,title,status,description) values ('admin-campaign-test','Admin campaign','fundraising','Test') returning id into campaign;
  update public.campaigns set published_at = now() where id = campaign;
  update public.campaigns set published_at = null where id = campaign;
  insert into public.campaign_updates(campaign_id,title,event_date) values (campaign,'Update',current_date);
  insert into public.campaign_evidence(campaign_id,type,label,url) values (campaign,'external_link','Evidence','https://example.com');

  select coalesce(jsonb_agg(to_jsonb(r) order by r.rank_position), '[]') into after_ranking from public.get_ranking('historical') r;
  if before_ranking <> after_ranking then raise exception 'admin CRUD altered ranking'; end if;
end $$;

rollback;

