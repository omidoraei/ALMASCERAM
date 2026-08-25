begin;

create table public.surface (
  id uuid primary key default gen_random_uuid(),
  name text not null check (char_length(name) between 2 and 100),
  slug text not null unique check (slug ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$'),
  description text,
  is_active boolean not null default true,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.finishes (
  id uuid primary key default gen_random_uuid(),
  name text not null check (char_length(name) between 2 and 100),
  slug text not null unique check (slug ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$'),
  description text,
  is_active boolean not null default true,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.spaces (
  id uuid primary key default gen_random_uuid(),
  name text not null check (char_length(name) between 2 and 100),
  slug text not null unique check (slug ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$'),
  icon text,
  is_active boolean not null default true,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.collections (
  id uuid primary key default gen_random_uuid(),
  name text not null check (char_length(name) between 2 and 120),
  slug text not null unique check (slug ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$'),
  description text,
  cover_image_path text,
  is_published boolean not null default false,
  sort_order integer not null default 0,
  published_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.series (
  id uuid primary key default gen_random_uuid(),
  collection_id uuid not null references public.collections(id) on delete restrict,
  name text not null check (char_length(name) between 2 and 120),
  slug text not null unique check (slug ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$'),
  description text,
  cover_image_path text,
  is_published boolean not null default false,
  sort_order integer not null default 0,
  published_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.products (
  id uuid primary key default gen_random_uuid(),
  series_id uuid not null references public.series(id) on delete restrict,
  surface_id uuid references public.surface(id) on delete set null,
  finish_id uuid references public.finishes(id) on delete set null,
  name text not null check (char_length(name) between 2 and 140),
  slug text not null unique check (slug ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$'),
  sku text not null unique check (char_length(sku) between 2 and 60),
  description text,
  color_name text,
  is_published boolean not null default false,
  is_featured boolean not null default false,
  sort_order integer not null default 0,
  published_at timestamptz,
  search_vector tsvector,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.sizes (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.products(id) on delete cascade,
  width_mm integer not null check (width_mm > 0 and width_mm <= 5000),
  height_mm integer not null check (height_mm > 0 and height_mm <= 5000),
  thickness_mm numeric(5,2) not null check (thickness_mm > 0 and thickness_mm <= 100),
  is_rectified boolean not null default true,
  pieces_per_box integer check (pieces_per_box > 0),
  sqm_per_box numeric(8,3) check (sqm_per_box > 0),
  box_weight_kg numeric(8,2) check (box_weight_kg > 0),
  is_active boolean not null default true,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (product_id, width_mm, height_mm, thickness_mm)
);

create table public.size_technical_data (
  id uuid primary key default gen_random_uuid(),
  size_id uuid not null unique references public.sizes(id) on delete cascade,
  application public.application_type[] not null default '{}',
  water_absorption text,
  breaking_strength_n integer check (breaking_strength_n > 0),
  abrasion_resistance text,
  slip_resistance text,
  frost_resistant boolean,
  chemical_resistance text,
  shade_variation text,
  standard_codes text[] not null default '{}',
  extra_data jsonb not null default '{}'::jsonb check (jsonb_typeof(extra_data) = 'object'),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.size_faces (
  id uuid primary key default gen_random_uuid(),
  size_id uuid not null references public.sizes(id) on delete cascade,
  image_path text not null,
  alt_text text,
  face_number integer not null check (face_number > 0),
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  unique (size_id, face_number)
);

create table public.size_media (
  id uuid primary key default gen_random_uuid(),
  size_id uuid not null references public.sizes(id) on delete cascade,
  media_type text not null check (media_type in ('image', 'video', 'room_scene', 'texture')),
  storage_path text not null,
  alt_text text,
  title text,
  sort_order integer not null default 0,
  created_at timestamptz not null default now()
);

create table public.size_spaces (
  size_id uuid not null references public.sizes(id) on delete cascade,
  space_id uuid not null references public.spaces(id) on delete cascade,
  application public.application_type not null,
  created_at timestamptz not null default now(),
  primary key (size_id, space_id, application)
);

create table public.size_pdf_catalog (
  id uuid primary key default gen_random_uuid(),
  size_id uuid not null references public.sizes(id) on delete cascade,
  title text not null,
  storage_path text not null,
  language_code text not null default 'fa' check (language_code ~ '^[a-z]{2}$'),
  file_size_bytes bigint check (file_size_bytes > 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index series_collection_id_idx on public.series(collection_id);
create index products_series_id_idx on public.products(series_id);
create index products_surface_id_idx on public.products(surface_id);
create index products_finish_id_idx on public.products(finish_id);
create index products_published_sort_idx on public.products(is_published, sort_order);
create index products_search_vector_idx on public.products using gin(search_vector);
create index sizes_product_id_idx on public.sizes(product_id);
create index size_faces_size_id_idx on public.size_faces(size_id);
create index size_media_size_id_idx on public.size_media(size_id);

commit;
