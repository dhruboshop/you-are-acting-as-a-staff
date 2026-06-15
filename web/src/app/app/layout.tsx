import { redirect } from "next/navigation";
import { tryFetchMerchantShops } from "@/lib/merchant-server";
import { createServerSupabase } from "@/lib/supabase-server";

export const dynamic = "force-dynamic";

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

  const { shops, error } = await tryFetchMerchantShops(supabase, session);
  if (error) {
    redirect("/login?error=api_unavailable");
  }

  if (shops.length === 0) {
    redirect("/onboarding/shop");
  }

  return children;
}
