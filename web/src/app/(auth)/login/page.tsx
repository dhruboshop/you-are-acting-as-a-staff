"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { Chrome, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { createBrowserSupabase } from "@/lib/supabase";

export default function LoginPage() {
  const router = useRouter();

  async function signIn() {
    const supabase = createBrowserSupabase();
    if (!supabase) {
      router.push("/onboarding/shop");
      return;
    }
    const origin = window.location.origin;
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: `${origin}/onboarding/shop` }
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
        <Button className="w-full" size="lg" onClick={signIn}>
          <Chrome className="h-5 w-5" />
          Continue with Google
        </Button>
        <Button asChild variant="secondary" className="w-full">
          <Link href="/onboarding/shop">Preview Demo</Link>
        </Button>
      </div>
    </main>
  );
}
