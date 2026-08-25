begin;

-- MVP invariant: the guest basket lives only in browser localStorage before OTP.
-- This table is reserved for a possible post-MVP workflow and is unreachable by anon/authenticated.
comment on table public.pending_inquiries is
  'POST-MVP RESERVED: not used by the MVP. Guest baskets remain client-side until Email OTP succeeds.';

-- Defense in depth: RLS is enabled in the prior migration and there are deliberately no policies.
-- Revoking table privileges also prevents accidental access if a broad policy is introduced later.
revoke all on table public.pending_inquiries from anon, authenticated;

create or replace function public.create_inquiry_from_basket(items jsonb, note text default null)
returns uuid
language plpgsql
security invoker
set search_path = public, auth, pg_catalog
as $$
declare
  v_user_id uuid := auth.uid();
  v_inquiry_id uuid;
  v_item_count integer;
  v_valid_size_count integer;
begin
  -- Authentication and profile checks are intentionally repeated here in addition to RLS.
  if v_user_id is null then
    raise exception using errcode = '28000', message = 'authentication_required';
  end if;

  if not exists (
    select 1 from public.customer_profiles cp where cp.user_id = v_user_id
  ) then
    raise exception using errcode = '42501', message = 'customer_profile_required';
  end if;

  if items is null or jsonb_typeof(items) <> 'array' then
    raise exception using errcode = '22023', message = 'items_must_be_an_array';
  end if;

  v_item_count := jsonb_array_length(items);
  if v_item_count < 1 or v_item_count > 50 then
    raise exception using errcode = '22023', message = 'basket_item_count_out_of_range';
  end if;

  if note is not null and char_length(btrim(note)) > 2000 then
    raise exception using errcode = '22001', message = 'inquiry_note_too_long';
  end if;

  if exists (
    select 1
    from jsonb_array_elements(items) as e(item)
    where jsonb_typeof(e.item) <> 'object'
      or coalesce(e.item->>'size_id', '') !~* '^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$'
      or (
        e.item ? 'quantity' and (
          coalesce(e.item->>'quantity', '') !~ '^[0-9]+$'
          or (e.item->>'quantity')::numeric < 1
          or (e.item->>'quantity')::numeric > 100000
        )
      )
      or (
        e.item ? 'requested_sqm' and e.item->>'requested_sqm' is not null and (
          coalesce(e.item->>'requested_sqm', '') !~ '^[0-9]+(?:\.[0-9]{1,2})?$'
          or (e.item->>'requested_sqm')::numeric <= 0
          or (e.item->>'requested_sqm')::numeric > 9999999999.99
        )
      )
      or char_length(coalesce(e.item->>'note', '')) > 500
  ) then
    raise exception using errcode = '22023', message = 'invalid_basket_item';
  end if;

  if exists (
    select lower(e.item->>'size_id')
    from jsonb_array_elements(items) as e(item)
    group by lower(e.item->>'size_id')
    having count(*) > 1
  ) then
    raise exception using errcode = '23505', message = 'duplicate_size_in_basket';
  end if;

  -- RLS on sizes/products remains active because this function is SECURITY INVOKER.
  select count(*)
  into v_valid_size_count
  from jsonb_array_elements(items) as e(item)
  join public.sizes s on s.id = (e.item->>'size_id')::uuid and s.is_active
  join public.products p on p.id = s.product_id and p.is_published
  join public.series se on se.id = p.series_id and se.is_published
  join public.collections c on c.id = se.collection_id and c.is_published;

  if v_valid_size_count <> v_item_count then
    raise exception using errcode = '23503', message = 'basket_contains_unavailable_size';
  end if;

  insert into public.inquiries (
    customer_id,
    status,
    project_city,
    company_name,
    notes
  )
  select
    cp.user_id,
    'submitted'::public.inquiry_status,
    cp.city,
    cp.company_name,
    nullif(btrim(note), '')
  from public.customer_profiles cp
  where cp.user_id = v_user_id
  returning id into v_inquiry_id;

  if v_inquiry_id is null then
    raise exception using errcode = '42501', message = 'inquiry_creation_not_allowed';
  end if;

  insert into public.inquiry_items (
    inquiry_id,
    size_id,
    quantity,
    requested_sqm,
    notes
  )
  select
    v_inquiry_id,
    (e.item->>'size_id')::uuid,
    coalesce((e.item->>'quantity')::integer, 1),
    nullif(e.item->>'requested_sqm', '')::numeric(12,2),
    nullif(btrim(e.item->>'note'), '')
  from jsonb_array_elements(items) as e(item);

  return v_inquiry_id;
end;
$$;

comment on function public.create_inquiry_from_basket(jsonb, text) is
  'Creates one inquiry and all basket items atomically for the authenticated customer. SECURITY INVOKER preserves RLS.';

revoke all on function public.create_inquiry_from_basket(jsonb, text) from public, anon;
grant execute on function public.create_inquiry_from_basket(jsonb, text) to authenticated;

commit;
