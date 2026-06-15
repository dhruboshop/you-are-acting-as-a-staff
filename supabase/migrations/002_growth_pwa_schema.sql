alter table public.shops
  add column if not exists theme_key text not null default 'luxury',
  add column if not exists city text,
  add column if not exists category text;

alter table public.customers
  add column if not exists birthday date,
  add column if not exists anniversary date,
  add column if not exists feedback_rating int check (feedback_rating between 1 and 5),
  add column if not exists feedback_text text;

create table if not exists public.whatsapp_instances (
  id uuid primary key default gen_random_uuid(),
  shop_id uuid not null unique references public.shops(id) on delete cascade,
  evolution_instance_id text not null unique,
  whatsapp_phone text,
  whatsapp_connected boolean not null default false,
  connection_status text not null default 'not_connected',
  last_connection_check timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.message_templates (
  id uuid primary key default gen_random_uuid(),
  shop_id uuid not null references public.shops(id) on delete cascade,
  campaign_type text not null check (campaign_type in ('birthday', 'anniversary', 'festival', 'feedback', 'promotional')),
  title text not null,
  body text not null,
  approved boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.message_variants (
  id uuid primary key default gen_random_uuid(),
  template_id uuid references public.message_templates(id) on delete cascade,
  shop_id uuid not null references public.shops(id) on delete cascade,
  campaign_type text not null,
  tone text not null,
  body text not null,
  approved boolean not null default false,
  created_at timestamptz not null default now()
);

create table if not exists public.campaign_messages (
  id uuid primary key default gen_random_uuid(),
  campaign_id uuid not null references public.campaigns(id) on delete cascade,
  customer_id uuid references public.customers(id) on delete set null,
  whatsapp_number text not null,
  message text not null,
  status text not null default 'queued' check (status in ('queued', 'processing', 'sent', 'failed')),
  error_message text,
  scheduled_at timestamptz,
  started_at timestamptz,
  completed_at timestamptz,
  sent_at timestamptz,
  created_at timestamptz not null default now()
);

create table if not exists public.campaign_queue (
  id uuid primary key default gen_random_uuid(),
  campaign_id uuid not null references public.campaigns(id) on delete cascade,
  campaign_message_id uuid references public.campaign_messages(id) on delete cascade,
  shop_id uuid not null references public.shops(id) on delete cascade,
  status text not null default 'queued' check (status in ('queued', 'processing', 'sent', 'failed')),
  dispatch_window text not null default '15-45',
  scheduled_at timestamptz not null default now(),
  started_at timestamptz,
  completed_at timestamptz,
  attempts int not null default 0,
  last_error text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_customers_shop_birthday on public.customers(shop_id, birthday);
create index if not exists idx_customers_shop_anniversary on public.customers(shop_id, anniversary);
create index if not exists idx_whatsapp_instances_shop on public.whatsapp_instances(shop_id);
create index if not exists idx_campaign_messages_campaign_status on public.campaign_messages(campaign_id, status);
create index if not exists idx_campaign_queue_status_scheduled on public.campaign_queue(status, scheduled_at);
create index if not exists idx_message_templates_shop_type on public.message_templates(shop_id, campaign_type);

alter table public.whatsapp_instances enable row level security;
alter table public.message_templates enable row level security;
alter table public.message_variants enable row level security;
alter table public.campaign_messages enable row level security;
alter table public.campaign_queue enable row level security;

create policy "Owners can manage own whatsapp instances" on public.whatsapp_instances for all
using (exists (select 1 from public.shops s where s.id = shop_id and s.owner_user_id = auth.uid()))
with check (exists (select 1 from public.shops s where s.id = shop_id and s.owner_user_id = auth.uid()));

create policy "Owners can manage own message templates" on public.message_templates for all
using (exists (select 1 from public.shops s where s.id = shop_id and s.owner_user_id = auth.uid()))
with check (exists (select 1 from public.shops s where s.id = shop_id and s.owner_user_id = auth.uid()));

create policy "Owners can manage own message variants" on public.message_variants for all
using (exists (select 1 from public.shops s where s.id = shop_id and s.owner_user_id = auth.uid()))
with check (exists (select 1 from public.shops s where s.id = shop_id and s.owner_user_id = auth.uid()));

create policy "Owners can manage own campaign messages" on public.campaign_messages for all
using (exists (
  select 1 from public.campaigns c join public.shops s on s.id = c.shop_id
  where c.id = campaign_id and s.owner_user_id = auth.uid()
));

create policy "Owners can manage own campaign queue" on public.campaign_queue for all
using (exists (select 1 from public.shops s where s.id = shop_id and s.owner_user_id = auth.uid()))
with check (exists (select 1 from public.shops s where s.id = shop_id and s.owner_user_id = auth.uid()));
