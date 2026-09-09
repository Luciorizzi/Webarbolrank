alter table public.donations
  add column preference_id text;

create unique index donations_preference_id_uidx
  on public.donations (preference_id)
  where preference_id is not null;

create unique index donations_payment_reference_uidx
  on public.donations (payment_reference)
  where payment_reference is not null;
