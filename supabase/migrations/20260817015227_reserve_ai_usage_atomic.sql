-- Fix TOCTOU race in AI usage rate limiting: checkAiRateLimit/checkAiUsageLimit
-- were separate count queries with the insert happening after the Gemini call,
-- so concurrent requests could all read the same count and all pass the cap.
--
-- reserve_ai_usage folds the burst check, the daily cap check, and the log
-- insert into one atomic operation, serialized per user with an advisory
-- transaction lock so concurrent calls can't race the count.

create or replace function public.reserve_ai_usage(
  p_user_id text,
  p_endpoint text,
  p_daily_limit int,
  p_max_per_minute int
)
returns table(allowed boolean, reason text)
language plpgsql
security definer
as $$
declare
  v_minute_count int;
  v_daily_count int;
begin
  perform pg_advisory_xact_lock(hashtextextended(p_user_id, 0));

  select count(*) into v_minute_count
  from public.ai_usage_log
  where user_id = p_user_id
    and created_at >= now() - interval '1 minute';

  if v_minute_count >= p_max_per_minute then
    return query select false, 'rate_limit';
    return;
  end if;

  select count(*) into v_daily_count
  from public.ai_usage_log
  where user_id = p_user_id
    and endpoint = p_endpoint
    and created_at >= date_trunc('day', now());

  if v_daily_count >= p_daily_limit then
    return query select false, 'daily_limit';
    return;
  end if;

  insert into public.ai_usage_log (user_id, endpoint) values (p_user_id, p_endpoint);

  return query select true, null::text;
end;
$$;

revoke execute on function public.reserve_ai_usage(text, text, int, int) from public;
grant execute on function public.reserve_ai_usage(text, text, int, int) to service_role;

-- Serves the per-user (burst + anomaly) queries above; the existing
-- (user_id, endpoint, created_at) index still serves the per-endpoint daily count.
create index if not exists ai_usage_log_user_created_idx
  on public.ai_usage_log (user_id, created_at);
