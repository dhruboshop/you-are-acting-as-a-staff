"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { createShop } from "@/lib/api";

export default function ShopSetupPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [city, setCity] = useState("");
  const [error, setError] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  return (
    <main className="mx-auto flex min-h-screen max-w-md flex-col bg-background px-5 py-6">
      <div className="h-1 rounded-full bg-muted">
        <div className="h-1 w-1/3 rounded-full bg-primary" />
      </div>
      <div className="mt-8">
        <p className="text-sm font-medium text-primary">Step 1 of 3</p>
        <h1 className="mt-2 text-3xl font-bold">Create your shop</h1>
        <p className="mt-2 text-muted-foreground">This becomes your customer QR and campaign identity.</p>
      </div>
      <form
        className="mt-8 space-y-4"
        onSubmit={async (event) => {
          event.preventDefault();
          setError("");
          setIsSaving(true);
          try {
            const { shop } = await createShop({
              name,
              phone,
              address: city,
              settings: { city }
            });
            localStorage.setItem("lp_active_shop_id", shop.id);
            router.push("/onboarding/theme");
          } catch (caught) {
            setError(caught instanceof Error ? caught.message : "Could not create shop");
          } finally {
            setIsSaving(false);
          }
        }}
      >
        <Input value={name} onChange={(event) => setName(event.target.value)} placeholder="Business name" required />
        <Input value={phone} onChange={(event) => setPhone(event.target.value)} placeholder="WhatsApp number" required />
        <Input value={city} onChange={(event) => setCity(event.target.value)} placeholder="City" required />
        {error ? <p className="text-sm text-destructive">{error}</p> : null}
        <Button className="mt-4 w-full" size="lg" type="submit" disabled={isSaving}>
          {isSaving ? "Creating..." : "Continue"}
        </Button>
      </form>
    </main>
  );
}
