create table public.bug_reports (
  id uuid primary key default gen_random_uuid(),
  user_id text references public.users(id) on delete set null,
  email text,
  description text not null,
  page_url text,
  user_agent text,
  created_at timestamptz not null default now(),
  status text not null default 'new' check (status in ('new', 'seen', 'resolved'))
);
alter table public.bug_reports enable row level security;
create policy "Users can insert their own bug reports"
  on public.bug_reports for insert
  with check (user_id = auth.uid()::text);
create policy "Service role can manage bug reports"
  on public.bug_reports for all using (true) with check (true);
