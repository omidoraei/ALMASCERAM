begin;

create extension if not exists pgcrypto;
create extension if not exists unaccent;

-- Domain enum values are intentionally frozen. Additions require a forward-only migration.
create type public.application_type as enum ('floor', 'wall', 'facade', 'pool', 'outdoor', 'industrial');
create type public.admin_role as enum ('super_admin', 'catalog_manager', 'sales_manager', 'content_manager', 'viewer');
create type public.customer_type as enum ('individual', 'business', 'architect', 'contractor', 'distributor');
create type public.inquiry_status as enum ('draft', 'pending_verification', 'submitted', 'in_review', 'quoted', 'closed', 'cancelled');
create type public.audit_log_level as enum ('info', 'warning', 'error', 'critical');

comment on type public.application_type is 'Approved physical application contexts for a tile size.';
comment on type public.admin_role is 'Least-privilege roles; super_admin is the only role allowed to administer admins.';
comment on type public.customer_type is 'Lead/customer segmentation used by inquiry qualification.';
comment on type public.inquiry_status is 'Forward lifecycle of a quotation inquiry.';
comment on type public.audit_log_level is 'Security and operational audit severity.';

commit;
