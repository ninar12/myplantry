-- Create subscription plan enum
do $$ begin
  create type subscription_plan as enum ('free', 'pro', 'team');
exception when duplicate_object then null;
end $$;

-- Create subscriptions table
create table if not exists public.subscriptions (
  id uuid primary key default gen_random_uuid(),
  user_id text not null references public.users(id) on delete cascade,
  plan subscription_plan not null default 'free',
  status text not null default 'active' check (status in ('active', 'cancelled', 'past_due')),
  stripe_customer_id text,
  stripe_subscription_id text,
  current_period_start timestamptz,
  current_period_end timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id)
);

-- RLS
alter table public.subscriptions enable row level security;

create policy "Users can view their own subscription"
  on public.subscriptions for select
  using (user_id = auth.uid()::text);

create policy "Service role can manage subscriptions"
  on public.subscriptions for all
  using (true)
  with check (true);

-- Auto-update updated_at
create or replace function public.handle_subscription_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger on_subscription_updated
  before update on public.subscriptions
  for each row execute function public.handle_subscription_updated_at();

-- Trigger: provision free subscription on new user
create or replace function public.on_user_created()
returns trigger language plpgsql security definer as $$
begin
  insert into public.subscriptions (user_id, plan)
  values (new.id, 'free')
  on conflict (user_id) do nothing;
  return new;
end;
$$;

create or replace trigger on_user_created
  after insert on public.users
  for each row execute function public.on_user_created();
