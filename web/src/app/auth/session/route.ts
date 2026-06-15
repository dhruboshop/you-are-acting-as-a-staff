import { NextResponse } from "next/server";
import { createServerSupabase } from "@/lib/supabase-server";

export const dynamic = "force-dynamic";

export async function GET() {
  const supabase = await createServerSupabase();
  if (!supabase) {
    return NextResponse.json({ success: false, error: "Supabase is not configured" }, { status: 500 });
  }

  const {
    data: { session }
  } = await supabase.auth.getSession();

  if (!session?.access_token) {
    return NextResponse.json({ success: false, error: "Google session required" }, { status: 401 });
  }

  return NextResponse.json({
    success: true,
    accessToken: session.access_token,
    expiresAt: session.expires_at ?? null
  });
}
