alter table public.users add column if not exists has_onboarded boolean not null default false;
