\set ON_ERROR_STOP on
begin;

insert into public.categories (id, name, slug)
values ('f2000000-0000-0000-0000-000000000001', 'Phase 2 QA', 'phase-2-qa');

insert into public.participants (id, name, slug, category_id, active)
values ('f2000000-0000-0000-0000-000000000002', 'Phase 2 Participant', 'phase-2-participant', 'f2000000-0000-0000-0000-000000000001', true);

insert into public.donors (id, display_name)
values ('f2000000-0000-0000-0000-000000000003', 'Phase 2 Donor');

insert into public.donations (id, donor_id, participant_id, anonymous, impact_units, amount, status, payment_reference, created_at)
values
  ('f2000000-0000-0000-0000-000000000010', 'f2000000-0000-0000-0000-000000000003', 'f2000000-0000-0000-0000-000000000002', false, 2, 10000, 'pending', null, now()),
  ('f2000000-0000-0000-0000-000000000011', 'f2000000-0000-0000-0000-000000000003', 'f2000000-0000-0000-0000-000000000002', false, 3, 15000, 'rejected', null, now()),
  ('f2000000-0000-0000-0000-000000000012', 'f2000000-0000-0000-0000-000000000003', 'f2000000-0000-0000-0000-000000000002', false, 4, 20000, 'refunded', null, now()),
  ('f2000000-0000-0000-0000-000000000013', null, null, true, 11, 55000, 'approved', 'phase2-general-approved', now());

do $$
declare
  period_name text;
  units bigint;
begin
  foreach period_name in array array['historical', 'month', 'today'] loop
    select total_impact_units into units from public.get_ranking(period_name)
    where participant_id = 'f2000000-0000-0000-0000-000000000002';
    if units <> 0 then raise exception 'non-approved donation leaked into % ranking: %', period_name, units; end if;
  end loop;

  if exists (select 1 from public.get_recent_donations(20, 'phase-2-participant')) then
    raise exception 'non-approved donation leaked into recent donations';
  end if;
  if exists (select 1 from public.get_top_donors(20, 'phase-2-participant')) then
    raise exception 'non-approved donation leaked into top donors';
  end if;
end $$;

update public.donations
set status = 'approved', payment_reference = 'phase2-payment-unique'
where id = 'f2000000-0000-0000-0000-000000000010';

do $$
declare
  period_name text;
  units bigint;
  top_units bigint;
begin
  foreach period_name in array array['historical', 'month', 'today'] loop
    select total_impact_units into units from public.get_ranking(period_name)
    where participant_id = 'f2000000-0000-0000-0000-000000000002';
    if units <> 2 then raise exception 'approved total in % ranking is %, expected 2', period_name, units; end if;
  end loop;

  select impact_units into top_units from public.get_top_donors(20, 'phase-2-participant')
  where donor_name = 'Phase 2 Donor';
  if top_units <> 2 then raise exception 'top donor total is %, expected 2', top_units; end if;
end $$;

-- Repeating the same state/reference update must not change aggregate impact.
update public.donations
set status = 'approved', payment_reference = 'phase2-payment-unique'
where id = 'f2000000-0000-0000-0000-000000000010';

do $$
declare units bigint;
begin
  select total_impact_units into units from public.get_ranking('historical')
  where participant_id = 'f2000000-0000-0000-0000-000000000002';
  if units <> 2 then raise exception 'idempotent retry produced %, expected 2', units; end if;

  begin
    insert into public.donations (id, participant_id, anonymous, impact_units, amount, status, payment_reference)
    values ('f2000000-0000-0000-0000-000000000014', 'f2000000-0000-0000-0000-000000000002', true, 7, 35000, 'approved', 'phase2-payment-unique');
    raise exception 'duplicate payment_reference was accepted';
  exception when unique_violation then
    null;
  end;
end $$;

update public.donations set status = 'refunded'
where id = 'f2000000-0000-0000-0000-000000000010';

do $$
declare units bigint;
begin
  select total_impact_units into units from public.get_ranking('historical')
  where participant_id = 'f2000000-0000-0000-0000-000000000002';
  if units <> 0 then raise exception 'refunded/rejected total is %, expected 0', units; end if;
  if exists (select 1 from public.get_top_donors(20, 'phase-2-participant')) then
    raise exception 'refunded/rejected donation leaked into top donors';
  end if;
end $$;

select 'PASS' as phase_2_payment_invariants;
rollback;
