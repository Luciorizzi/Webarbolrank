create table public.campaign_evidence_images (
  id uuid primary key default gen_random_uuid(),
  evidence_id uuid not null references public.campaign_evidence(id) on delete cascade,
  image_url text not null,
  storage_path text,
  sort_order integer not null default 0 check (sort_order >= 0),
  created_at timestamptz not null default now(),
  unique (evidence_id, sort_order)
);

create index campaign_evidence_images_evidence_id_idx
  on public.campaign_evidence_images (evidence_id, sort_order);

comment on column public.campaign_evidence.label is
  'Human-readable evidence description. Kept for backwards compatibility.';

insert into public.campaign_evidence_images (evidence_id, image_url, storage_path, sort_order)
select
  evidence.id,
  evidence.url,
  case
    when evidence.url like '%/storage/v1/object/public/campaign-images/%'
      then split_part(
        split_part(evidence.url, '/storage/v1/object/public/campaign-images/', 2),
        '?',
        1
      )
    else null
  end,
  0
from public.campaign_evidence as evidence
where evidence.type = 'photo'
  and evidence.url is not null
  and btrim(evidence.url) <> ''
on conflict (evidence_id, sort_order) do nothing;

alter table public.campaign_evidence_images enable row level security;

create policy "Published campaign evidence images are readable"
on public.campaign_evidence_images for select to anon, authenticated
using (
  exists (
    select 1
    from public.campaign_evidence as evidence
    join public.campaigns as campaign on campaign.id = evidence.campaign_id
    where evidence.id = evidence_id
      and campaign.published_at is not null
      and campaign.published_at <= now()
  )
);

grant select on public.campaign_evidence_images to anon, authenticated;
