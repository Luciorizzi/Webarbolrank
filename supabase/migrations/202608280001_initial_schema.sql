create extension if not exists pgcrypto;

create type public.donation_status as enum ('pending', 'approved', 'rejected', 'refunded');
create type public.campaign_status as enum ('fundraising', 'goal_reached', 'scheduled', 'completed');
create type public.evidence_type as enum ('photo', 'receipt', 'document', 'external_link');

create table public.categories (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  created_at timestamptz not null default now()
);

create table public.participants (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  avatar_url text,
  bio text,
  category_id uuid references public.categories(id) on delete set null,
  verified boolean not null default false,
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.donors (
  id uuid primary key default gen_random_uuid(),
  display_name text,
  created_at timestamptz not null default now()
);

create table public.donations (
  id uuid primary key default gen_random_uuid(),
  donor_id uuid references public.donors(id) on delete set null,
  participant_id uuid references public.participants(id) on delete set null,
  anonymous boolean not null default false,
  trees integer not null check (trees >= 1),
  amount integer not null check (amount >= 0),
  status public.donation_status not null default 'pending',
  payment_provider text,
  payment_reference text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.campaigns (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  title text not null,
  location text,
  ngo_name text,
  goal_amount integer check (goal_amount is null or goal_amount >= 0),
  raised_amount integer check (raised_amount is null or raised_amount >= 0),
  tree_goal integer check (tree_goal is null or tree_goal >= 1),
  status public.campaign_status not null,
  activity_date date,
  excerpt text,
  description text,
  cover_image_url text,
  published_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.campaign_updates (
  id uuid primary key default gen_random_uuid(),
  campaign_id uuid not null references public.campaigns(id) on delete cascade,
  title text not null,
  content text,
  event_date date not null,
  created_at timestamptz not null default now()
);

create table public.campaign_evidence (
  id uuid primary key default gen_random_uuid(),
  campaign_id uuid not null references public.campaigns(id) on delete cascade,
  type public.evidence_type not null,
  label text not null,
  url text,
  evidence_date date,
  created_at timestamptz not null default now()
);

create index donations_participant_id_idx on public.donations(participant_id);
create index donations_donor_id_idx on public.donations(donor_id);
create index donations_status_idx on public.donations(status);
create index donations_created_at_idx on public.donations(created_at desc);
create index campaigns_status_idx on public.campaigns(status);
create index campaign_updates_campaign_id_idx on public.campaign_updates(campaign_id);
create index campaign_updates_event_date_idx on public.campaign_updates(event_date desc);

create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger participants_set_updated_at before update on public.participants
for each row execute function public.set_updated_at();
create trigger donations_set_updated_at before update on public.donations
for each row execute function public.set_updated_at();
create trigger campaigns_set_updated_at before update on public.campaigns
for each row execute function public.set_updated_at();

create or replace function public.get_ranking(ranking_period text default 'historical')
returns table (
  participant_id uuid, name text, slug text, avatar_url text, bio text,
  category_slug text, verified boolean, total_trees bigint,
  donor_count bigint, recent_trees bigint, rank_position bigint
)
language sql stable security definer set search_path = public as $$
  with filtered as (
    select d.* from public.donations d
    where d.status = 'approved'
      and case ranking_period
        when 'today' then d.created_at >= date_trunc('day', now())
        when 'month' then d.created_at >= date_trunc('month', now())
        else true
      end
  ), totals as (
    select p.id, p.name, p.slug, p.avatar_url, p.bio, c.slug as category_slug, p.verified,
      coalesce(sum(f.trees), 0)::bigint as total_trees,
      count(distinct coalesce(f.donor_id::text, f.id::text))::bigint as donor_count,
      coalesce(sum(f.trees) filter (where f.created_at >= now() - interval '7 days'), 0)::bigint as recent_trees
    from public.participants p
    left join public.categories c on c.id = p.category_id
    left join filtered f on f.participant_id = p.id
    where p.active = true
    group by p.id, c.slug
  )
  select totals.*, dense_rank() over (order by total_trees desc, name asc)::bigint as rank_position
  from totals order by rank_position, name;
$$;

create or replace function public.get_recent_donations(result_limit integer default 5, filter_participant_slug text default null)
returns table (id uuid, donor_name text, anonymous boolean, participant_slug text, trees integer, amount integer, created_at timestamptz)
language sql stable security definer set search_path = public as $$
  select d.id,
    case when d.anonymous then null else dr.display_name end,
    d.anonymous, p.slug, d.trees, d.amount, d.created_at
  from public.donations d
  left join public.donors dr on dr.id = d.donor_id
  left join public.participants p on p.id = d.participant_id
  where d.status = 'approved' and (filter_participant_slug is null or p.slug = filter_participant_slug)
  order by d.created_at desc limit greatest(1, least(result_limit, 20));
$$;

create or replace function public.get_top_donors(result_limit integer default 3, filter_participant_slug text default null)
returns table (donor_name text, trees bigint)
language sql stable security definer set search_path = public as $$
  select dr.display_name, sum(d.trees)::bigint
  from public.donations d join public.donors dr on dr.id = d.donor_id
  left join public.participants p on p.id = d.participant_id
  where d.status = 'approved' and d.anonymous = false and dr.display_name is not null
    and (filter_participant_slug is null or p.slug = filter_participant_slug)
  group by dr.id, dr.display_name order by sum(d.trees) desc limit greatest(1, least(result_limit, 20));
$$;

alter table public.categories enable row level security;
alter table public.participants enable row level security;
alter table public.donors enable row level security;
alter table public.donations enable row level security;
alter table public.campaigns enable row level security;
alter table public.campaign_updates enable row level security;
alter table public.campaign_evidence enable row level security;

create policy "Public categories are readable" on public.categories for select to anon, authenticated using (true);
create policy "Active participants are readable" on public.participants for select to anon, authenticated using (active = true);
create policy "Published campaigns are readable" on public.campaigns for select to anon, authenticated using (published_at is not null and published_at <= now());
create policy "Published campaign updates are readable" on public.campaign_updates for select to anon, authenticated using (exists (select 1 from public.campaigns c where c.id = campaign_id and c.published_at is not null and c.published_at <= now()));
create policy "Published campaign evidence is readable" on public.campaign_evidence for select to anon, authenticated using (exists (select 1 from public.campaigns c where c.id = campaign_id and c.published_at is not null and c.published_at <= now()));

revoke all on public.donors, public.donations from anon, authenticated;
revoke execute on function public.get_ranking(text), public.get_recent_donations(integer, text), public.get_top_donors(integer, text) from public;
grant select on public.categories, public.participants, public.campaigns, public.campaign_updates, public.campaign_evidence to anon, authenticated;
grant execute on function public.get_ranking(text), public.get_recent_donations(integer, text), public.get_top_donors(integer, text) to anon, authenticated;
