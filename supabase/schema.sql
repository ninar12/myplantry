-- Enable pgvector for future semantic search features
create extension if not exists vector;

create table if not exists users (
  id text primary key,
  email text unique not null,
  name text,
  created_at timestamptz default now()
);

create table if not exists pantry_items (
  id text primary key default gen_random_uuid()::text,
  user_id text not null references users(id) on delete cascade,
  name text not null,
  category text not null,
  quantity int not null default 1,
  amount text,
  opened boolean not null default false,
  expiration_date timestamptz not null,
  location text not null default 'fridge',
  created_at timestamptz default now()
);

create index if not exists pantry_items_user_id_idx on pantry_items(user_id);

create table if not exists grocery_items (
  id text primary key default gen_random_uuid()::text,
  user_id text not null references users(id) on delete cascade,
  name text not null,
  category text not null default 'Other',
  quantity int not null default 1,
  bought boolean not null default false,
  created_at timestamptz default now()
);

create index if not exists grocery_items_user_id_idx on grocery_items(user_id);

create table if not exists saved_recipes (
  id text primary key default gen_random_uuid()::text,
  user_id text not null references users(id) on delete cascade,
  title text not null,
  ingredients jsonb not null default '[]',
  instructions jsonb not null default '[]',
  match_percentage int,
  created_at timestamptz default now()
);

create index if not exists saved_recipes_user_id_idx on saved_recipes(user_id);

-- =============================================
-- SUBSCRIPTIONS
-- =============================================
-- Tiers:
--   free  — up to 30 pantry items, 5 saved recipes, AI features rate-limited
--   pro   — unlimited pantry items, unlimited saved recipes, full AI, photo scan ($9.99/mo)
--   team  — everything in pro + shared household pantry (roommates, family), up to 5 members ($24.99/mo)

create type if not exists subscription_plan as enum ('free', 'pro', 'team');
create type if not exists subscription_status as enum ('active', 'trialing', 'past_due', 'canceled');

create table if not exists subscriptions (
  id text primary key default gen_random_uuid()::text,
  user_id text not null unique references users(id) on delete cascade,
  plan subscription_plan not null default 'free',
  status subscription_status not null default 'active',
  stripe_customer_id text unique,
  stripe_subscription_id text unique,
  current_period_start timestamptz,
  current_period_end timestamptz,
  cancel_at_period_end boolean not null default false,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create index if not exists subscriptions_user_id_idx on subscriptions(user_id);
create index if not exists subscriptions_stripe_customer_id_idx on subscriptions(stripe_customer_id);

-- Auto-provision a free subscription when a user is created
create or replace function create_free_subscription()
returns trigger as $$
begin
  insert into subscriptions (user_id) values (new.id)
  on conflict (user_id) do nothing;
  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists on_user_created on users;
create trigger on_user_created
  after insert on users
  for each row execute function create_free_subscription();

-- =============================================
-- ROW LEVEL SECURITY
-- =============================================
-- Service role key (used by the app) bypasses RLS automatically.
-- Enable RLS + policies here so direct/anon access is locked down.

alter table users enable row level security;
alter table pantry_items enable row level security;
alter table grocery_items enable row level security;
alter table saved_recipes enable row level security;
alter table subscriptions enable row level security;

-- Users can only read/update their own row
create policy if not exists "users: own row" on users
  for all using (id = current_setting('app.user_id', true));

-- Pantry: own items only
create policy if not exists "pantry_items: own rows" on pantry_items
  for all using (user_id = current_setting('app.user_id', true));

-- Grocery: own items only
create policy if not exists "grocery_items: own rows" on grocery_items
  for all using (user_id = current_setting('app.user_id', true));

-- Saved recipes: own items only
create policy if not exists "saved_recipes: own rows" on saved_recipes
  for all using (user_id = current_setting('app.user_id', true));

-- Subscriptions: read-only for user, writes only via service role
create policy if not exists "subscriptions: read own" on subscriptions
  for select using (user_id = current_setting('app.user_id', true));
