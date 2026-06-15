"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function ShopSetupPage() {
  const router = useRouter();
  const [name, setName] = useState("Radha Jewels");
  const [phone, setPhone] = useState("+919876543210");
  const [city, setCity] = useState("Mumbai");

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
        onSubmit={(event) => {
          event.preventDefault();
          localStorage.setItem("lp_shop", JSON.stringify({ name, phone, city }));
          router.push("/onboarding/theme");
        }}
      >
        <Input value={name} onChange={(event) => setName(event.target.value)} placeholder="Business name" required />
        <Input value={phone} onChange={(event) => setPhone(event.target.value)} placeholder="WhatsApp number" required />
        <Input value={city} onChange={(event) => setCity(event.target.value)} placeholder="City" required />
        <Button className="mt-4 w-full" size="lg" type="submit">
          Continue
        </Button>
      </form>
    </main>
  );
}
