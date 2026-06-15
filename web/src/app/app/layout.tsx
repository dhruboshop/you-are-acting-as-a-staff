import { redirect } from "next/navigation";
import { fetchMerchantShops } from "@/lib/merchant-server";
import { createServerSupabase } from "@/lib/supabase-server";

export default async function ProtectedAppLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createServerSupabase();
  if (!supabase) {
    redirect("/login?error=auth_config");
  }

  const {
    data: { session }
  } = await supabase.auth.getSession();

  if (!session) {
    redirect("/login");
  }

  const shops = await fetchMerchantShops(session.access_token);
  if (shops.length === 0) {
    redirect("/onboarding/shop");
  }

  return children;
}
