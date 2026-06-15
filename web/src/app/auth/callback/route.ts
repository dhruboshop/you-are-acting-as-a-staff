import { NextResponse } from "next/server";
import { createServerSupabase } from "@/lib/supabase-server";

export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get("code");
  const next = requestUrl.searchParams.get("next") ?? "/auth/route";
  const supabase = await createServerSupabase();

  if (!supabase || !code) {
    return NextResponse.redirect(new URL("/login?error=auth_config", requestUrl.origin));
  }

  const { error } = await supabase.auth.exchangeCodeForSession(code);
  if (error) {
    return NextResponse.redirect(new URL("/login?error=oauth", requestUrl.origin));
  }

  return NextResponse.redirect(new URL(next, requestUrl.origin));
}
