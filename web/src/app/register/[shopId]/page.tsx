"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import { CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { env } from "@/lib/env";

export default function RegisterPage() {
  const params = useParams<{ shopId: string }>();
  const [done, setDone] = useState(false);
  const [error, setError] = useState("");

  if (done) {
    return (
      <main className="mx-auto flex min-h-screen max-w-md flex-col items-center justify-center bg-background px-5 text-center">
        <CheckCircle2 className="h-24 w-24 text-[#10B981]" />
        <h1 className="mt-6 text-3xl font-bold">You are registered</h1>
        <p className="mt-2 text-muted-foreground">You will receive birthday and festival updates on WhatsApp.</p>
      </main>
    );
  }

  return (
    <main className="mx-auto min-h-screen max-w-md bg-background px-5 py-8">
      <h1 className="text-3xl font-bold">Join this shop</h1>
      <p className="mt-2 text-muted-foreground">Register once to receive useful offers and reminders on WhatsApp.</p>
      <form
        className="mt-8 space-y-4"
        onSubmit={async (event) => {
          event.preventDefault();
          setError("");
          const form = new FormData(event.currentTarget);
          const response = await fetch(`${env.apiBaseUrl}/api/public/shops/${params.shopId}/customers`, {
            method: "POST",
            headers: { "content-type": "application/json" },
            body: JSON.stringify({
              name: form.get("name"),
              whatsappNumber: form.get("whatsapp"),
              birthday: form.get("birthday") || null,
              anniversary: form.get("anniversary") || null,
              feedbackRating: form.get("rating") ? Number(form.get("rating")) : null,
              feedbackText: form.get("feedback") || null,
              consent: true
            })
          });
          if (!response.ok) {
            setError("Could not save your registration. Please check the number and try again.");
            return;
          }
          setDone(true);
        }}
      >
        <Input name="shopId" value={params.shopId} readOnly className="hidden" />
        <Input name="name" placeholder="Your name" required />
        <Input name="whatsapp" placeholder="WhatsApp number" inputMode="tel" required />
        <Input name="birthday" type="date" required />
        <Input name="anniversary" type="date" />
        <Input name="rating" type="number" min="1" max="5" placeholder="Rating 1-5" />
        <Input name="feedback" placeholder="Feedback (optional)" />
        <label className="flex gap-3 text-sm text-muted-foreground">
          <input type="checkbox" required className="mt-1" /> I agree to receive WhatsApp messages from this shop.
        </label>
        {error ? <p className="text-sm text-destructive">{error}</p> : null}
        <Button className="w-full" size="lg" type="submit">Submit</Button>
      </form>
    </main>
  );
}
