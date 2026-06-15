"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Chrome, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { createBrowserSupabase } from "@/lib/supabase";

export default function LoginPage() {
  const router = useRouter();
  const [isSigningIn, setIsSigningIn] = useState(false);
  const [configError, setConfigError] = useState(false);

  useEffect(() => {
    const supabase = createBrowserSupabase();
    if (!supabase) {
      setConfigError(true);
      return;
    }

    const error = new URLSearchParams(window.location.search).get("error");
    const shouldCheckExistingSession = !error || error === "session_missing" || error === "session_expired";
    if (!shouldCheckExistingSession) {
      return;
    }

    supabase.auth.getSession().then(({ data }) => {
      if (data.session) {
        router.replace("/auth/route");
      }
    });
  }, [router]);

  async function signIn() {
    const supabase = createBrowserSupabase();
    if (!supabase) {
      setConfigError(true);
      return;
    }
    const origin = window.location.origin;
    setIsSigningIn(true);
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${origin}/auth/callback`,
        queryParams: {
          access_type: "offline",
          prompt: "select_account"
        }
      }
    });
  }

  return (
    <main className="mx-auto flex min-h-screen max-w-md flex-col bg-background px-5 py-8">
      <div className="flex flex-1 flex-col justify-end">
        <div className="mb-10 flex justify-center">
          <div className="flex h-20 w-20 items-center justify-center rounded-3xl bg-primary text-primary-foreground shadow-lg">
            <Sparkles className="h-10 w-10" />
          </div>
        </div>
        <h1 className="text-center text-4xl font-bold tracking-tight">LoyaltyPilot</h1>
        <p className="mt-3 text-center text-lg text-muted-foreground">
          WhatsApp-first customer growth for local shops.
        </p>
        <Card className="mt-8 p-4">
          <div className="grid grid-cols-3 gap-2 text-center text-xs text-muted-foreground">
            <span>No app install</span>
            <span>QR customers</span>
            <span>WhatsApp campaigns</span>
          </div>
        </Card>
      </div>
      <div className="safe-bottom mt-8 space-y-3">
        {configError ? (
          <Card className="border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive">
            Supabase Google OAuth is not configured. Set `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY`.
          </Card>
        ) : null}
        <Button className="w-full" size="lg" onClick={signIn} disabled={isSigningIn || configError}>
          <Chrome className="h-5 w-5" />
          {isSigningIn ? "Opening Google..." : "Continue with Google"}
        </Button>
      </div>
    </main>
  );
}
