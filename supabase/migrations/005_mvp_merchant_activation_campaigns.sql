alter table public.shops
  add column if not exists merchant_status text not null default 'TRIAL',
  add column if not exists trial_ends_at timestamptz not null default (now() + interval '14 days');

alter table public.shops
  drop constraint if exists shops_merchant_status_check,
  add constraint shops_merchant_status_check
    check (merchant_status in ('TRIAL', 'ACTIVE', 'EXPIRED', 'BLOCKED'));

create index if not exists idx_shops_merchant_status on public.shops(merchant_status);

alter table public.campaigns
  add column if not exists scheduled_at timestamptz,
  add column if not exists retry_count integer not null default 0,
  add column if not exists max_retries integer not null default 1,
  add column if not exists last_error text;

update public.campaigns
set template_key = 'festival'
where template_key in ('durga_puja', 'diwali', 'eid', 'christmas', 'new_year');

alter table public.campaigns
  drop constraint if exists campaigns_template_key_check,
  add constraint campaigns_template_key_check
    check (template_key in ('birthday', 'anniversary', 'festival', 'winback')),
  drop constraint if exists campaigns_status_check,
  add constraint campaigns_status_check
    check (status in ('draft', 'scheduled', 'sending', 'sent', 'partial', 'failed'));

create index if not exists idx_campaigns_scheduled on public.campaigns(status, scheduled_at)
where status = 'scheduled';
