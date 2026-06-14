create extension if not exists "pgcrypto";

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create table public.users (
  id uuid primary key references auth.users(id) on delete cascade,
  email text unique,
  full_name text,
  avatar_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.shops (
  id uuid primary key default gen_random_uuid(),
  owner_user_id uuid not null references public.users(id) on delete cascade,
  name text not null check (char_length(name) between 2 and 120),
  phone text,
  address text,
  logo_url text,
  settings jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz
);

create table public.customers (
  id uuid primary key default gen_random_uuid(),
  shop_id uuid not null references public.shops(id) on delete cascade,
  name text not null check (char_length(name) between 2 and 120),
  whatsapp_number text not null check (whatsapp_number ~ '^\+?[1-9][0-9]{7,14}$'),
  consent_given boolean not null default false,
  consent_at timestamptz,
  loyalty_points integer not null default 0 check (loyalty_points >= 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (shop_id, whatsapp_number)
);

create table public.loyalty_transactions (
  id uuid primary key default gen_random_uuid(),
  customer_id uuid not null references public.customers(id) on delete cascade,
  shop_id uuid not null references public.shops(id) on delete cascade,
  points integer not null check (points > 0),
  transaction_type text not null check (transaction_type in ('add', 'deduct')),
  reason text not null check (char_length(reason) between 2 and 180),
  created_by uuid references public.users(id) on delete set null,
  created_at timestamptz not null default now()
);

create table public.campaigns (
  id uuid primary key default gen_random_uuid(),
  shop_id uuid not null references public.shops(id) on delete cascade,
  template_key text not null check (template_key in ('durga_puja', 'diwali', 'eid', 'christmas', 'new_year')),
  title text not null check (char_length(title) between 2 and 140),
  message text not null check (char_length(message) between 2 and 1000),
  target text not null default 'all' check (target in ('all', 'loyalty_members')),
  status text not null default 'draft' check (status in ('draft', 'sending', 'sent', 'partial', 'failed')),
  sent_count integer not null default 0 check (sent_count >= 0),
  failed_count integer not null default 0 check (failed_count >= 0),
  created_by uuid references public.users(id) on delete set null,
  sent_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.campaign_logs (
  id uuid primary key default gen_random_uuid(),
  campaign_id uuid not null references public.campaigns(id) on delete cascade,
  customer_id uuid references public.customers(id) on delete set null,
  whatsapp_number text not null,
  status text not null check (status in ('sent', 'failed')),
  error_message text,
  sent_at timestamptz,
  created_at timestamptz not null default now()
);

create table public.whatsapp_sessions (
  id uuid primary key default gen_random_uuid(),
  shop_id uuid not null unique references public.shops(id) on delete cascade,
  instance_name text not null unique check (instance_name ~ '^[a-zA-Z0-9_-]{3,80}$'),
  status text not null default 'not_connected',
  qr_payload jsonb,
  connected_at timestamptz,
  disconnected_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index idx_shops_owner on public.shops(owner_user_id) where deleted_at is null;
create index idx_customers_shop_created on public.customers(shop_id, created_at desc);
create index idx_customers_shop_name on public.customers using gin (to_tsvector('simple', name));
create index idx_loyalty_customer_created on public.loyalty_transactions(customer_id, created_at desc);
create index idx_campaigns_shop_created on public.campaigns(shop_id, created_at desc);
create index idx_campaign_logs_campaign on public.campaign_logs(campaign_id, created_at desc);

create trigger users_updated_at before update on public.users for each row execute function public.set_updated_at();
create trigger shops_updated_at before update on public.shops for each row execute function public.set_updated_at();
create trigger customers_updated_at before update on public.customers for each row execute function public.set_updated_at();
create trigger campaigns_updated_at before update on public.campaigns for each row execute function public.set_updated_at();
create trigger whatsapp_sessions_updated_at before update on public.whatsapp_sessions for each row execute function public.set_updated_at();

alter table public.users enable row level security;
alter table public.shops enable row level security;
alter table public.customers enable row level security;
alter table public.loyalty_transactions enable row level security;
alter table public.campaigns enable row level security;
alter table public.campaign_logs enable row level security;
alter table public.whatsapp_sessions enable row level security;

create policy "Users can read own profile" on public.users for select using (auth.uid() = id);
create policy "Users can update own profile" on public.users for update using (auth.uid() = id) with check (auth.uid() = id);

create policy "Owners can manage own shops" on public.shops for all
using (owner_user_id = auth.uid())
with check (owner_user_id = auth.uid());
create policy "Public can read active shops for QR registration" on public.shops for select
using (deleted_at is null);

create policy "Owners can manage own customers" on public.customers for all
using (exists (select 1 from public.shops s where s.id = shop_id and s.owner_user_id = auth.uid()))
with check (exists (select 1 from public.shops s where s.id = shop_id and s.owner_user_id = auth.uid()));
create policy "Public can register customers" on public.customers for insert
with check (consent_given = true);

create policy "Owners can read own loyalty transactions" on public.loyalty_transactions for select
using (exists (select 1 from public.shops s where s.id = shop_id and s.owner_user_id = auth.uid()));
create policy "Owners can insert own loyalty transactions" on public.loyalty_transactions for insert
with check (exists (select 1 from public.shops s where s.id = shop_id and s.owner_user_id = auth.uid()));

create policy "Owners can manage own campaigns" on public.campaigns for all
using (exists (select 1 from public.shops s where s.id = shop_id and s.owner_user_id = auth.uid()))
with check (exists (select 1 from public.shops s where s.id = shop_id and s.owner_user_id = auth.uid()));

create policy "Owners can read own campaign logs" on public.campaign_logs for select
using (exists (
  select 1 from public.campaigns c
  join public.shops s on s.id = c.shop_id
  where c.id = campaign_id and s.owner_user_id = auth.uid()
));

create policy "Owners can manage own whatsapp sessions" on public.whatsapp_sessions for all
using (exists (select 1 from public.shops s where s.id = shop_id and s.owner_user_id = auth.uid()))
with check (exists (select 1 from public.shops s where s.id = shop_id and s.owner_user_id = auth.uid()));
