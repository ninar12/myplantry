create table public.ai_usage_log (
  id uuid primary key default gen_random_uuid(),
  user_id text references public.users(id) on delete cascade,
  endpoint text not null,
  created_at timestamptz not null default now()
);
alter table public.ai_usage_log enable row level security;
create policy "Service role can manage ai usage log"
  on public.ai_usage_log for all using (true) with check (true);
create index on public.ai_usage_log (user_id, endpoint, created_at);
