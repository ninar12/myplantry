create table if not exists user_preferences (
  user_id      text primary key references users(id) on delete cascade,
  display_name text,
  default_location      text not null default 'fridge'
    check (default_location in ('fridge', 'pantry', 'freezer')),
  expiry_warning_days   int  not null default 3
    check (expiry_warning_days in (1, 3, 7)),
  dietary_prefs         text[] not null default '{}',
  cuisine_prefs         text[] not null default '{}',
  notif_meal_reminders  boolean not null default true,
  notif_expiry_alerts   boolean not null default true,
  notif_grocery_restock boolean not null default true,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);
