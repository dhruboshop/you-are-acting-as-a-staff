import { redirect } from "next/navigation";
import { fetchServerOnboardingStatus } from "@/lib/onboarding-server";
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

  let nextRoute: "/onboarding/shop" | "/onboarding/whatsapp" | "/app/dashboard";
  let onboardingComplete = false;
  try {
    const status = await fetchServerOnboardingStatus(session);
    nextRoute = status.nextRoute;
    onboardingComplete = status.onboardingComplete;
  } catch (error) {
    const message = error instanceof Error ? encodeURIComponent(error.message) : "unknown";
    redirect(`/login?error=onboarding_unavailable&detail=${message}`);
  }
  if (!onboardingComplete) {
    redirect(nextRoute);
  }

  return children;
}
