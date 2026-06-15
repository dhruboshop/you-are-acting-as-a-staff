import { redirect } from "next/navigation";
import { createServerSupabase } from "@/lib/supabase-server";

export default async function HomePage() {
  const supabase = await createServerSupabase();
  if (supabase) {
    const {
      data: { session }
    } = await supabase.auth.getSession();
    if (session) {
      redirect("/auth/route");
    }
  }

  redirect("/login");
}
