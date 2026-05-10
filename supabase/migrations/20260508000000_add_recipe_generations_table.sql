create table if not exists recipe_generations (
  id text primary key default gen_random_uuid()::text,
  user_id text not null references users(id) on delete cascade,
  created_at timestamptz default now()
);
create index if not exists recipe_generations_user_id_idx
  on recipe_generations(user_id);
