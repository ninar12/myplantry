-- Use word_similarity so multi-word queries like "strawberry jam" match
-- "strawberry jam" in the shelf_life table instead of collapsing onto
-- "strawberries" (which has high token overlap but wrong shelf life).
-- Threshold raised to 0.4 to filter out weak matches.

create or replace function fuzzy_shelf_life(query text)
returns setof shelf_life
language sql
stable
as $$
  select *
  from shelf_life
  where word_similarity(query, name) > 0.4
  order by word_similarity(query, name) desc
  limit 1;
$$;
