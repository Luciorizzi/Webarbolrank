alter table public.donations rename column trees to impact_units;
alter table public.campaigns rename column tree_goal to impact_goal;

alter table public.campaigns
  add column food_kg integer check (food_kg is null or food_kg >= 0),
  add column delivery_date date;

drop function public.get_ranking(text);
drop function public.get_recent_donations(integer, text);
drop function public.get_top_donors(integer, text);

create function public.get_ranking(ranking_period text default 'historical')
returns table (
  participant_id uuid, name text, slug text, avatar_url text, bio text,
  category_slug text, verified boolean, total_impact_units bigint,
  donor_count bigint, recent_impact_units bigint, rank_position bigint
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
      coalesce(sum(f.impact_units), 0)::bigint as total_impact_units,
      count(distinct coalesce(f.donor_id::text, f.id::text))::bigint as donor_count,
      coalesce(sum(f.impact_units) filter (where f.created_at >= now() - interval '7 days'), 0)::bigint as recent_impact_units
    from public.participants p
    left join public.categories c on c.id = p.category_id
    left join filtered f on f.participant_id = p.id
    where p.active = true
    group by p.id, c.slug
  )
  select totals.*, dense_rank() over (order by total_impact_units desc, name asc)::bigint as rank_position
  from totals order by rank_position, name;
$$;

create function public.get_recent_donations(result_limit integer default 5, filter_participant_slug text default null)
returns table (id uuid, donor_name text, anonymous boolean, participant_slug text, impact_units integer, amount integer, created_at timestamptz)
language sql stable security definer set search_path = public as $$
  select d.id,
    case when d.anonymous then null else dr.display_name end,
    d.anonymous, p.slug, d.impact_units, d.amount, d.created_at
  from public.donations d
  left join public.donors dr on dr.id = d.donor_id
  left join public.participants p on p.id = d.participant_id
  where d.status = 'approved' and (filter_participant_slug is null or p.slug = filter_participant_slug)
  order by d.created_at desc limit greatest(1, least(result_limit, 20));
$$;

create function public.get_top_donors(result_limit integer default 3, filter_participant_slug text default null)
returns table (donor_name text, impact_units bigint)
language sql stable security definer set search_path = public as $$
  select dr.display_name, sum(d.impact_units)::bigint
  from public.donations d join public.donors dr on dr.id = d.donor_id
  left join public.participants p on p.id = d.participant_id
  where d.status = 'approved' and d.anonymous = false and dr.display_name is not null
    and (filter_participant_slug is null or p.slug = filter_participant_slug)
  group by dr.id, dr.display_name order by sum(d.impact_units) desc limit greatest(1, least(result_limit, 20));
$$;

revoke execute on function public.get_ranking(text), public.get_recent_donations(integer, text), public.get_top_donors(integer, text) from public;
grant execute on function public.get_ranking(text), public.get_recent_donations(integer, text), public.get_top_donors(integer, text) to anon, authenticated;
