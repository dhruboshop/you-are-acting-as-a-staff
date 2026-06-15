create table if not exists public.whatsapp_connections (
  id uuid primary key default gen_random_uuid(),
  shop_id uuid not null unique references public.shops(id) on delete cascade,
  instance_name text not null unique check (instance_name ~ '^[a-zA-Z0-9_-]{3,80}$'),
  phone_number text check (phone_number is null or phone_number ~ '^\+?[1-9][0-9]{7,14}$'),
  status text not null default 'not_connected' check (status in ('not_connected', 'connecting', 'connected', 'open', 'close', 'disconnected', 'deleted', 'failed', 'unknown')),
  connected_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_whatsapp_connections_shop on public.whatsapp_connections(shop_id);
create index if not exists idx_whatsapp_connections_status on public.whatsapp_connections(status);

drop trigger if exists whatsapp_connections_updated_at on public.whatsapp_connections;
create trigger whatsapp_connections_updated_at
before update on public.whatsapp_connections
for each row execute function public.set_updated_at();

alter table public.whatsapp_connections enable row level security;

drop policy if exists "Owners can manage own whatsapp connections" on public.whatsapp_connections;
create policy "Owners can manage own whatsapp connections" on public.whatsapp_connections for all
using (exists (select 1 from public.shops s where s.id = shop_id and s.owner_user_id = auth.uid()))
with check (exists (select 1 from public.shops s where s.id = shop_id and s.owner_user_id = auth.uid()));

do $$
begin
  if to_regclass('public.whatsapp_sessions') is not null then
    insert into public.whatsapp_connections (shop_id, instance_name, status, connected_at, created_at, updated_at)
    select
      shop_id,
      instance_name,
      case
        when status in ('not_connected', 'connecting', 'connected', 'open', 'close', 'disconnected', 'deleted', 'failed', 'unknown') then status
        else 'unknown'
      end,
      connected_at,
      created_at,
      updated_at
    from public.whatsapp_sessions
    on conflict (shop_id) do update set
      instance_name = excluded.instance_name,
      status = excluded.status,
      connected_at = excluded.connected_at,
      updated_at = now();
  end if;

  if to_regclass('public.whatsapp_instances') is not null then
    insert into public.whatsapp_connections (shop_id, instance_name, phone_number, status, connected_at, created_at, updated_at)
    select
      shop_id,
      evolution_instance_id,
      case when whatsapp_phone ~ '^\+?[1-9][0-9]{7,14}$' then whatsapp_phone else null end,
      case
        when connection_status in ('not_connected', 'connecting', 'connected', 'open', 'close', 'disconnected', 'deleted', 'failed', 'unknown') then connection_status
        when whatsapp_connected then 'connected'
        else 'not_connected'
      end,
      case when whatsapp_connected then coalesce(last_connection_check, updated_at) else null end,
      created_at,
      updated_at
    from public.whatsapp_instances
    on conflict (shop_id) do update set
      instance_name = excluded.instance_name,
      phone_number = coalesce(excluded.phone_number, public.whatsapp_connections.phone_number),
      status = excluded.status,
      connected_at = coalesce(excluded.connected_at, public.whatsapp_connections.connected_at),
      updated_at = now();
  end if;
end $$;

drop table if exists public.whatsapp_instances;
drop table if exists public.whatsapp_sessions;
