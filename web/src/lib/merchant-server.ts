import type { Session, SupabaseClient } from "@supabase/supabase-js";

export type MerchantShop = {
  id: string;
  name: string;
  phone?: string | null;
  address?: string | null;
  settings?: Record<string, unknown>;
  total_customers?: number;
  total_campaigns?: number;
  total_sent_campaigns?: number;
  total_scheduled_campaigns?: number;
  total_loyalty_members?: number;
};

export async function ensureMerchantProfile(supabase: SupabaseClient, session: Session) {
  const user = session.user;
  const { error } = await supabase.from("users").upsert({
    id: user.id,
    email: user.email ?? null,
    full_name: user.user_metadata?.full_name ?? user.user_metadata?.name ?? null,
    avatar_url: user.user_metadata?.avatar_url ?? null
  });

  if (error) {
    throw new Error(error.message);
  }
}

export async function fetchMerchantShops(supabase: SupabaseClient, session: Session): Promise<MerchantShop[]> {
  await ensureMerchantProfile(supabase, session);
  const { data, error } = await supabase
    .from("shops")
    .select("id,name,phone,address,settings")
    .is("deleted_at", null)
    .order("created_at", { ascending: false });

  if (error) {
    throw new Error(error.message);
  }

  return (data ?? []).map((shop) => ({
    ...shop,
    total_customers: 0,
    total_campaigns: 0,
    total_sent_campaigns: 0,
    total_scheduled_campaigns: 0,
    total_loyalty_members: 0
  }));
}

export async function tryFetchMerchantShops(supabase: SupabaseClient, session: Session) {
  try {
    const shops = await fetchMerchantShops(supabase, session);
    return { shops, error: null as string | null };
  } catch (caught) {
    const message = caught instanceof Error ? caught.message : "Unable to load merchant shops";
    return { shops: [] as MerchantShop[], error: message };
  }
}
