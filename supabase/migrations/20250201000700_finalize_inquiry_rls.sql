begin;

-- FINAL/CANONICAL MVP POLICY SET FOR INQUIRIES.
-- This migration is intentionally idempotent at the policy level so environments that
-- previously applied an older policy set converge to the exact same least-privilege state.

alter table public.inquiries enable row level security;
alter table public.inquiry_items enable row level security;
alter table public.pending_inquiries enable row level security;

-- Remove every historical/custom policy from the three inquiry tables before rebuilding
-- the canonical set. pending_inquiries deliberately receives no replacement policy.
do $$
declare
  policy_record record;
begin
  for policy_record in
    select schemaname, tablename, policyname
    from pg_policies
    where schemaname = 'public'
      and tablename in ('inquiries', 'inquiry_items', 'pending_inquiries')
  loop
    execute format(
      'drop policy if exists %I on %I.%I',
      policy_record.policyname,
      policy_record.schemaname,
      policy_record.tablename
    );
  end loop;
end
$$;

-- Table grants are a second security boundary in addition to RLS.
revoke all on table public.pending_inquiries from anon, authenticated;
revoke all on table public.inquiries from anon;
revoke all on table public.inquiry_items from anon;

-- Authenticated customers need these grants for the SECURITY INVOKER RPC.
-- UPDATE on inquiries is granted at the PostgreSQL role level but its only RLS policy is admin-only.
revoke delete on table public.inquiries from authenticated;
revoke update, delete on table public.inquiry_items from authenticated;
grant select, insert, update on table public.inquiries to authenticated;
grant select, insert on table public.inquiry_items to authenticated;

-- SELECT: active admin OR the customer profile that owns this inquiry.
create policy inquiries_owner_or_admin_select
on public.inquiries
for select
to authenticated
using (
  public.is_admin()
  or exists (
    select 1
    from public.customer_profiles cp
    where cp.user_id = auth.uid()
      and cp.user_id = inquiries.customer_id
  )
);

-- INSERT: admin, or an authenticated customer creating only a submitted inquiry for self.
-- Normal customer insertion is performed by create_inquiry_from_basket(), which is SECURITY INVOKER.
create policy inquiries_owner_or_admin_insert
on public.inquiries
for insert
to authenticated
with check (
  public.is_admin()
  or (
    inquiries.status = 'submitted'::public.inquiry_status
    and exists (
      select 1
      from public.customer_profiles cp
      where cp.user_id = auth.uid()
        and cp.user_id = inquiries.customer_id
    )
  )
);

-- Submitted inquiry state is immutable for the customer; only an active admin can progress it.
create policy inquiries_admin_update
on public.inquiries
for update
to authenticated
using (public.is_admin())
with check (public.is_admin());

-- No DELETE policy is created for inquiries. Records are retained for auditability.

-- SELECT item: active admin OR owner of the parent inquiry through customer_profiles.
create policy inquiry_items_owner_or_admin_select
on public.inquiry_items
for select
to authenticated
using (
  public.is_admin()
  or exists (
    select 1
    from public.inquiries i
    join public.customer_profiles cp on cp.user_id = i.customer_id
    where i.id = inquiry_items.inquiry_id
      and cp.user_id = auth.uid()
  )
);

-- INSERT item: active admin OR owner of the parent inquiry. The RPC inserts all items atomically.
create policy inquiry_items_owner_or_admin_insert
on public.inquiry_items
for insert
to authenticated
with check (
  public.is_admin()
  or exists (
    select 1
    from public.inquiries i
    join public.customer_profiles cp on cp.user_id = i.customer_id
    where i.id = inquiry_items.inquiry_id
      and cp.user_id = auth.uid()
  )
);

-- No UPDATE/DELETE policy is created for inquiry_items. Submitted basket evidence is immutable.
-- No SELECT/INSERT/UPDATE/DELETE policy is created for pending_inquiries in the MVP.

comment on table public.pending_inquiries is
  'POST-MVP RESERVED. No policies and no anon/authenticated privileges. Guest basket is localStorage-only before OTP.';
comment on table public.inquiries is
  'Canonical RLS: owner through customer_profiles or active admin. Customer submissions use create_inquiry_from_basket.';
comment on table public.inquiry_items is
  'Canonical RLS: parent inquiry owner through customer_profiles or active admin. Immutable after insertion.';

commit;
