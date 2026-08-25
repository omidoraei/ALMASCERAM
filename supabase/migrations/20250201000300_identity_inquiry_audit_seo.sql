begin;

create table public.admin_profiles (
  user_id uuid primary key references auth.users(id) on delete cascade,
  role public.admin_role not null default 'viewer',
  full_name text not null check (char_length(full_name) between 2 and 100),
  is_active boolean not null default true,
  last_seen_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.customer_profiles (
  user_id uuid primary key references auth.users(id) on delete cascade,
  customer_type public.customer_type not null default 'individual',
  full_name text,
  phone text,
  company_name text,
  city text,
  marketing_consent boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.inquiries (
  id uuid primary key default gen_random_uuid(),
  customer_id uuid not null references auth.users(id) on delete restrict,
  inquiry_number bigint generated always as identity unique,
  status public.inquiry_status not null default 'submitted',
  project_city text,
  company_name text,
  notes text check (char_length(notes) <= 2000),
  assigned_admin_id uuid references public.admin_profiles(user_id) on delete set null,
  submitted_at timestamptz not null default now(),
  closed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.inquiry_items (
  id uuid primary key default gen_random_uuid(),
  inquiry_id uuid not null references public.inquiries(id) on delete cascade,
  size_id uuid not null references public.sizes(id) on delete restrict,
  quantity integer not null default 1 check (quantity > 0 and quantity <= 100000),
  requested_sqm numeric(12,2) check (requested_sqm > 0),
  notes text check (char_length(notes) <= 500),
  created_at timestamptz not null default now(),
  unique (inquiry_id, size_id)
);

-- Post-MVP reserved table. The MVP never reads or writes it; RLS exposes no policy to anon/authenticated.
create table public.pending_inquiries (
  id uuid primary key default gen_random_uuid(),
  email_normalized text not null,
  payload jsonb not null check (jsonb_typeof(payload) = 'object'),
  otp_hash text not null,
  attempt_count smallint not null default 0 check (attempt_count between 0 and 10),
  expires_at timestamptz not null,
  consumed_at timestamptz,
  request_ip_hash text,
  created_at timestamptz not null default now()
);

create table public.audit_logs (
  id bigint generated always as identity primary key,
  actor_user_id uuid references auth.users(id) on delete set null,
  level public.audit_log_level not null default 'info',
  action text not null,
  entity_type text,
  entity_id text,
  correlation_id uuid not null default gen_random_uuid(),
  ip_hash text,
  user_agent text,
  metadata jsonb not null default '{}'::jsonb check (jsonb_typeof(metadata) = 'object'),
  created_at timestamptz not null default now()
);

-- FINAL SEO SCHEMA VERSION. Metadata columns are intentionally explicit and one-to-one.
create table public.collection_seo (
  collection_id uuid primary key references public.collections(id) on delete cascade,
  meta_title text not null check (char_length(meta_title) between 10 and 70),
  meta_description text not null check (char_length(meta_description) between 50 and 170),
  canonical_url text,
  focus_keyword text,
  og_title text,
  og_description text,
  og_image_path text,
  robots_noindex boolean not null default false,
  robots_nofollow boolean not null default false,
  json_ld jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- FINAL SEO SCHEMA VERSION. Do not duplicate SEO fields on the series table.
create table public.series_seo (
  series_id uuid primary key references public.series(id) on delete cascade,
  meta_title text not null check (char_length(meta_title) between 10 and 70),
  meta_description text not null check (char_length(meta_description) between 50 and 170),
  canonical_url text,
  focus_keyword text,
  og_title text,
  og_description text,
  og_image_path text,
  robots_noindex boolean not null default false,
  robots_nofollow boolean not null default false,
  json_ld jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- FINAL SEO SCHEMA VERSION. Product structured data is stored in json_ld after server validation.
create table public.product_seo (
  product_id uuid primary key references public.products(id) on delete cascade,
  meta_title text not null check (char_length(meta_title) between 10 and 70),
  meta_description text not null check (char_length(meta_description) between 50 and 170),
  canonical_url text,
  focus_keyword text,
  og_title text,
  og_description text,
  og_image_path text,
  robots_noindex boolean not null default false,
  robots_nofollow boolean not null default false,
  json_ld jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index inquiries_customer_id_idx on public.inquiries(customer_id, created_at desc);
create index inquiries_status_idx on public.inquiries(status, created_at desc);
create index inquiry_items_inquiry_id_idx on public.inquiry_items(inquiry_id);
create index pending_inquiries_email_expiry_idx on public.pending_inquiries(email_normalized, expires_at desc);
create index pending_inquiries_cleanup_idx on public.pending_inquiries(expires_at) where consumed_at is null;
create index audit_logs_actor_idx on public.audit_logs(actor_user_id, created_at desc);
create index audit_logs_entity_idx on public.audit_logs(entity_type, entity_id, created_at desc);

commit;
