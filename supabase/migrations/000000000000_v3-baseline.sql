-- BÁN GÌ AI V3 — cơ sở dữ liệu nền
create extension if not exists pgcrypto;

create table if not exists public.profiles(
  id uuid primary key references auth.users(id) on delete cascade,
  role text not null default 'user' check(role in('user','admin')),
  account_plan text not null default 'mien_phi' check(account_plan in('mien_phi','vip')),
  display_name text,
  phone text,
  avatar_url text,
  primary_channel text,
  starting_capital bigint check(starting_capital is null or starting_capital>=0),
  experience text,
  goal text,
  interested_categories text[] not null default '{}',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.products(
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  name text not null,
  category text,
  category_label text,
  status text not null default 'active' check(status in('active','inactive','archived')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.research_sources(
  id uuid primary key default gen_random_uuid(),
  code text unique not null,
  name text not null,
  source_type text not null,
  trust_score smallint not null check(trust_score between 0 and 100),
  access_method text,
  enabled boolean not null default true,
  default_refresh_hours integer check(default_refresh_hours is null or default_refresh_hours>0),
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.product_evidence(
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.products(id) on delete cascade,
  source_id uuid references public.research_sources(id) on delete set null,
  signal_type text not null,
  classification text not null check(classification in('FACT','INFERENCE','UNKNOWN')),
  raw_value jsonb,
  normalized_score smallint check(normalized_score is null or normalized_score between 0 and 100),
  source_url text,
  source_trust smallint check(source_trust is null or source_trust between 0 and 100),
  confidence_score smallint check(confidence_score is null or confidence_score between 0 and 100),
  collected_at timestamptz not null,
  last_checked_at timestamptz,
  evidence_hash text not null,
  storage_path text,
  is_public boolean not null default true,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  unique(product_id,signal_type,evidence_hash)
);
create index if not exists idx_evidence_product on public.product_evidence(product_id,collected_at desc);
create index if not exists idx_evidence_source on public.product_evidence(source_id,collected_at desc);

create table if not exists public.product_current_state(
  product_id uuid primary key references public.products(id) on delete cascade,
  demand smallint check(demand is null or demand between 0 and 100),
  growth smallint check(growth is null or growth between 0 and 100),
  margin smallint check(margin is null or margin between 0 and 100),
  viral smallint check(viral is null or viral between 0 and 100),
  competition smallint check(competition is null or competition between 0 and 100),
  risk_penalty smallint check(risk_penalty is null or risk_penalty between 0 and 100),
  opportunity_score numeric(5,2) check(opportunity_score is null or opportunity_score between 0 and 100),
  confidence_score smallint not null default 0 check(confidence_score between 0 and 100),
  coverage_score smallint not null default 0 check(coverage_score between 0 and 100),
  trend_direction text check(trend_direction is null or trend_direction in('RISING','STABLE','FALLING','UNKNOWN')),
  opportunity_status text not null default 'INSUFFICIENT_EVIDENCE' check(opportunity_status in('READY','PROVISIONAL','INSUFFICIENT_EVIDENCE','CONFLICT')),
  heat text not null default 'COLD' check(heat in('HOT','WARM','COLD','ARCHIVED')),
  next_refresh_at timestamptz,
  evidence_hash text,
  updated_at timestamptz not null default now()
);
create index if not exists idx_state_rank on public.product_current_state(opportunity_score desc,confidence_score desc,coverage_score desc);
create index if not exists idx_state_refresh on public.product_current_state(next_refresh_at);

create table if not exists public.product_events(
  id bigint generated always as identity primary key,
  product_id uuid not null references public.products(id) on delete cascade,
  event_type text not null,
  signal_type text,
  previous_value jsonb,
  new_value jsonb,
  reason text,
  created_at timestamptz not null default now()
);
create index if not exists idx_events_product on public.product_events(product_id,created_at desc);

create table if not exists public.saved_products(
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  product_id uuid not null references public.products(id) on delete cascade,
  created_at timestamptz not null default now(),
  unique(user_id,product_id)
);

create table if not exists public.product_tests(
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  product_id uuid not null references public.products(id) on delete cascade,
  status text not null default 'planned' check(status in('planned','testing','stopped','reordered')),
  planned_at timestamptz not null default now(),
  follow_up_at timestamptz,
  notes text,
  outcome jsonb,
  actual_buy_price bigint check(actual_buy_price is null or actual_buy_price>=0),
  actual_sell_price bigint check(actual_sell_price is null or actual_sell_price>=0),
  quantity integer check(quantity is null or quantity>=0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(user_id,product_id)
);

create table if not exists public.collector_runs(
  id bigint generated always as identity primary key,
  source_id uuid references public.research_sources(id) on delete set null,
  status text not null check(status in('running','success','partial','failed')),
  products_attempted integer not null default 0,
  products_updated integer not null default 0,
  errors integer not null default 0,
  ai_calls integer not null default 0,
  started_at timestamptz not null default now(),
  finished_at timestamptz,
  metadata jsonb not null default '{}'::jsonb
);

create table if not exists public.review_queue(
  id bigint generated always as identity primary key,
  product_id uuid references public.products(id) on delete cascade,
  issue_type text not null,
  severity text not null default 'medium' check(severity in('low','medium','high','critical')),
  payload jsonb not null,
  status text not null default 'pending' check(status in('pending','resolved','ignored')),
  resolved_by uuid references auth.users(id) on delete set null,
  resolved_at timestamptz,
  created_at timestamptz not null default now()
);

create table if not exists public.ai_usage_daily(
  user_id uuid not null references auth.users(id) on delete cascade,
  usage_date date not null default current_date,
  request_count integer not null default 0,
  paid_calls integer not null default 0,
  deep_research_calls integer not null default 0,
  updated_at timestamptz not null default now(),
  primary key(user_id,usage_date)
);

create or replace function public.handle_new_user() returns trigger language plpgsql security definer set search_path=public as $$
begin
  insert into public.profiles(id,display_name,phone,avatar_url)
  values(new.id,coalesce(new.raw_user_meta_data->>'full_name',new.raw_user_meta_data->>'name'),new.raw_user_meta_data->>'phone',coalesce(new.raw_user_meta_data->>'avatar_url',new.raw_user_meta_data->>'picture'))
  on conflict(id) do nothing;
  return new;
end;$$;
create or replace trigger on_auth_user_created after insert on auth.users for each row execute procedure public.handle_new_user();

create or replace function public.is_admin() returns boolean language sql stable security definer set search_path=public as $$select exists(select 1 from public.profiles where id=auth.uid() and role='admin');$$;
create or replace function public.protect_profile_system_fields() returns trigger language plpgsql security definer set search_path=public as $$
begin
  if auth.uid()=old.id and not public.is_admin() then new.role:=old.role;new.account_plan:=old.account_plan;end if;
  new.updated_at:=now();return new;
end;$$;
create or replace trigger protect_profile_system_fields_trigger before update on public.profiles for each row execute procedure public.protect_profile_system_fields();

create or replace function public.reserve_ai_request(p_user_id uuid) returns void language sql security definer set search_path=public as $$
  insert into public.ai_usage_daily(user_id,usage_date,request_count) values(p_user_id,current_date,1)
  on conflict(user_id,usage_date) do update set request_count=public.ai_usage_daily.request_count+1,updated_at=now();
$$;
create or replace function public.record_paid_ai_call(p_user_id uuid) returns void language sql security definer set search_path=public as $$
  insert into public.ai_usage_daily(user_id,usage_date,paid_calls) values(p_user_id,current_date,1)
  on conflict(user_id,usage_date) do update set paid_calls=public.ai_usage_daily.paid_calls+1,updated_at=now();
$$;

alter table public.profiles enable row level security;
alter table public.products enable row level security;
alter table public.research_sources enable row level security;
alter table public.product_evidence enable row level security;
alter table public.product_current_state enable row level security;
alter table public.product_events enable row level security;
alter table public.saved_products enable row level security;
alter table public.product_tests enable row level security;
alter table public.collector_runs enable row level security;
alter table public.review_queue enable row level security;
alter table public.ai_usage_daily enable row level security;

create policy profiles_select on public.profiles for select using(auth.uid()=id or public.is_admin());
create policy profiles_update on public.profiles for update using(auth.uid()=id) with check(auth.uid()=id);
create policy products_read on public.products for select using(status='active' or public.is_admin());
create policy products_admin on public.products for all using(public.is_admin()) with check(public.is_admin());
create policy sources_read on public.research_sources for select using(enabled or public.is_admin());
create policy sources_admin on public.research_sources for all using(public.is_admin()) with check(public.is_admin());
create policy evidence_read on public.product_evidence for select using(is_public or public.is_admin());
create policy evidence_admin on public.product_evidence for all using(public.is_admin()) with check(public.is_admin());
create policy state_read on public.product_current_state for select using(true);
create policy state_admin on public.product_current_state for all using(public.is_admin()) with check(public.is_admin());
create policy events_read on public.product_events for select using(auth.role()='authenticated' or public.is_admin());
create policy events_admin on public.product_events for all using(public.is_admin()) with check(public.is_admin());
create policy saved_select on public.saved_products for select using(auth.uid()=user_id);
create policy saved_insert on public.saved_products for insert with check(auth.uid()=user_id);
create policy saved_delete on public.saved_products for delete using(auth.uid()=user_id);
create policy tests_select on public.product_tests for select using(auth.uid()=user_id);
create policy tests_insert on public.product_tests for insert with check(auth.uid()=user_id);
create policy tests_update on public.product_tests for update using(auth.uid()=user_id) with check(auth.uid()=user_id);
create policy tests_delete on public.product_tests for delete using(auth.uid()=user_id);
create policy collectors_admin on public.collector_runs for all using(public.is_admin()) with check(public.is_admin());
create policy review_admin on public.review_queue for all using(public.is_admin()) with check(public.is_admin());
create policy usage_select on public.ai_usage_daily for select using(auth.uid()=user_id or public.is_admin());

insert into storage.buckets(id,name,public,file_size_limit,allowed_mime_types)
values('avatars','avatars',true,3145728,array['image/jpeg','image/png','image/webp'])
on conflict(id) do update set public=excluded.public,file_size_limit=excluded.file_size_limit,allowed_mime_types=excluded.allowed_mime_types;
create policy avatar_read on storage.objects for select using(bucket_id='avatars');
create policy avatar_insert on storage.objects for insert to authenticated with check(bucket_id='avatars' and (storage.foldername(name))[1]=auth.uid()::text);
create policy avatar_update on storage.objects for update to authenticated using(bucket_id='avatars' and (storage.foldername(name))[1]=auth.uid()::text) with check(bucket_id='avatars' and (storage.foldername(name))[1]=auth.uid()::text);
create policy avatar_delete on storage.objects for delete to authenticated using(bucket_id='avatars' and (storage.foldername(name))[1]=auth.uid()::text);

insert into public.research_sources(code,name,source_type,trust_score,access_method,enabled,default_refresh_hours)
values
('google_trends','Google Trends','official_public',90,'api_or_authorized',true,24),
('tiktok_creative_center','TikTok Creative Center','official_public',88,'public_or_authorized',true,24),
('seller_outcomes','Kết quả thử của người bán trong BÁN GÌ AI','first_party',100,'first_party',true,24)
on conflict(code) do nothing;
