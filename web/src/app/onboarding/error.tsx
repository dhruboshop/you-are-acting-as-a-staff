"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

export default function OnboardingError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error("Onboarding route crashed", {
      message: error.message,
      digest: error.digest
    });
  }, [error]);

  return (
    <main className="mx-auto flex min-h-screen max-w-md flex-col justify-center bg-background px-5 py-6">
      <Card className="p-5">
        <h1 className="text-2xl font-bold">Something went wrong</h1>
        <p className="mt-2 text-sm text-muted-foreground">The onboarding screen hit a browser error. Try again, or log in again if it repeats.</p>
        <div className="mt-5 grid gap-3">
          <Button onClick={reset}>Try again</Button>
          <Button variant="secondary" onClick={() => window.location.assign("/logout")}>
            Login again
          </Button>
        </div>
      </Card>
    </main>
  );
}
