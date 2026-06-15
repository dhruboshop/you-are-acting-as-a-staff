import { redirect } from "next/navigation";
import { fetchServerOnboardingStatus } from "@/lib/onboarding-server";
import { createServerSupabase } from "@/lib/supabase-server";

export const dynamic = "force-dynamic";

export default async function MerchantRoutePage() {
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

  let nextRoute: "/onboarding/shop" | "/onboarding/whatsapp" | "/app/dashboard";
  try {
    const status = await fetchServerOnboardingStatus(session);
    nextRoute = status.nextRoute;
  } catch (error) {
    const message = error instanceof Error ? encodeURIComponent(error.message) : "unknown";
    redirect(`/login?error=onboarding_unavailable&detail=${message}`);
  }
  redirect(nextRoute);
}
