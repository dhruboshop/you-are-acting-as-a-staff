import { redirect } from "next/navigation";
import { createServerSupabase } from "@/lib/supabase-server";

export default async function OnboardingLayout({ children }: { children: React.ReactNode }) {
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

  return children;
}
