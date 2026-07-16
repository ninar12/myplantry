-- Usage visibility: login events + last-seen tracking

-- Last-seen heartbeat on users
alter table public.users add column if not exists last_seen_at timestamptz;

-- Login events log
create table if not exists public.login_events (
  id uuid primary key default gen_random_uuid(),
  user_id text references public.users(id) on delete cascade,
  provider text,
  created_at timestamptz not null default now()
);

alter table public.login_events enable row level security;

create policy "Service role can manage login events"
  on public.login_events for all using (true) with check (true);

create index if not exists login_events_user_created_idx
  on public.login_events (user_id, created_at desc);

-- Throttled last-seen update: writes at most once per 15 minutes per user
create or replace function public.touch_last_seen(p_user_id text)
returns void language sql security definer as $$
  update public.users
  set last_seen_at = now()
  where id = p_user_id
    and (last_seen_at is null or last_seen_at < now() - interval '15 minutes');
$$;
