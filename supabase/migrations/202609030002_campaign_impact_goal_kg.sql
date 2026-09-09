-- impact_goal is the campaign's kilogram target. food_kg duplicated that value.
update public.campaigns
set impact_goal = food_kg
where food_kg is not null;

alter table public.campaigns drop column food_kg;
