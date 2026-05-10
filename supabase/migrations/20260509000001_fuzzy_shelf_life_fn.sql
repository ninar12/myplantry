-- Fuzzy name match for shelf_life lookups
-- Uses pg_trgm similarity to handle "roma tomatoes" → "tomatoes", etc.

create or replace function fuzzy_shelf_life(query text)
returns setof shelf_life
language sql
stable
as $$
  select *
  from shelf_life
  where similarity(name, query) > 0.25
  order by similarity(name, query) desc
  limit 1;
$$;
