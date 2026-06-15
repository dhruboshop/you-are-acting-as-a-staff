grant usage on schema public to anon, authenticated;

grant select, insert, update on public.users to authenticated;
grant select, insert, update, delete on public.shops to authenticated;
grant select, insert, update, delete on public.customers to authenticated;
grant select, insert, update, delete on public.loyalty_transactions to authenticated;
grant select, insert, update, delete on public.campaigns to authenticated;
grant select on public.campaign_logs to authenticated;
grant select, insert, update, delete on public.whatsapp_connections to authenticated;
grant select, insert, update, delete on public.message_templates to authenticated;
grant select, insert, update, delete on public.message_variants to authenticated;
grant select, insert, update, delete on public.campaign_messages to authenticated;
grant select, insert, update, delete on public.campaign_queue to authenticated;

grant select on public.shops to anon;
grant insert on public.customers to anon;

alter table public.users enable row level security;
alter table public.shops enable row level security;
alter table public.customers enable row level security;
alter table public.whatsapp_connections enable row level security;

drop policy if exists "Users can insert own profile" on public.users;
create policy "Users can insert own profile" on public.users for insert
with check (auth.uid() = id);

drop policy if exists "Users can read own profile" on public.users;
create policy "Users can read own profile" on public.users for select
using (auth.uid() = id);

drop policy if exists "Users can update own profile" on public.users;
create policy "Users can update own profile" on public.users for update
using (auth.uid() = id)
with check (auth.uid() = id);

drop policy if exists "Owners can manage own shops" on public.shops;
create policy "Owners can manage own shops" on public.shops for all
using (owner_user_id = auth.uid())
with check (owner_user_id = auth.uid());

drop policy if exists "Public can read active shops for QR registration" on public.shops;
create policy "Public can read active shops for QR registration" on public.shops for select
using (deleted_at is null);

drop policy if exists "Owners can manage own whatsapp connections" on public.whatsapp_connections;
create policy "Owners can manage own whatsapp connections" on public.whatsapp_connections for all
using (exists (select 1 from public.shops s where s.id = shop_id and s.owner_user_id = auth.uid()))
with check (exists (select 1 from public.shops s where s.id = shop_id and s.owner_user_id = auth.uid()));
