create extension if not exists pg_trgm;

create table shelf_life (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  category text,
  pantry_days integer,
  fridge_days integer,
  freezer_days integer,
  opened_fridge_days integer,
  tips text,
  source text default 'usda',
  created_at timestamptz default now()
);

create index shelf_life_name_trgm_idx
  on shelf_life using gin (name gin_trgm_ops);
