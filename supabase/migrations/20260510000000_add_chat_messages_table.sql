create table if not exists chat_messages (
  id uuid primary key default gen_random_uuid(),
  user_id text not null references users(id) on delete cascade,
  role text not null check (role in ('user', 'assistant')),
  content text not null,
  created_at timestamptz default now()
);

create index if not exists chat_messages_user_id_idx
  on chat_messages(user_id);

create index if not exists chat_messages_created_at_idx
  on chat_messages(user_id, created_at desc);
