"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { getShops, updateShop } from "@/lib/api";
import { cn } from "@/lib/utils";

const themes = [
  { id: "luxury", name: "Luxury", gradient: "from-slate-950 to-indigo-950" },
  { id: "restaurant", name: "Restaurant", gradient: "from-red-900 to-orange-700" },
  { id: "beauty", name: "Beauty", gradient: "from-fuchsia-950 to-pink-700" },
  { id: "retail", name: "Retail", gradient: "from-blue-950 to-blue-600" }
];

export default function ThemePage() {
  const router = useRouter();
  const [selected, setSelected] = useState("luxury");
  const [error, setError] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  async function saveTheme() {
    setError("");
    setIsSaving(true);
    try {
      const activeShopId = localStorage.getItem("lp_active_shop_id");
      const shops = activeShopId ? [] : (await getShops()).shops;
      const shopId = activeShopId ?? shops[0]?.id;
      if (!shopId) {
        router.push("/onboarding/shop");
        return;
      }
      await updateShop(shopId, { settings: { themeKey: selected } });
      localStorage.setItem("lp_active_shop_id", shopId);
      router.push("/onboarding/whatsapp");
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Could not save theme");
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <main className="mx-auto flex min-h-screen max-w-md flex-col bg-background px-5 py-6">
      <div className="h-1 rounded-full bg-muted">
        <div className="h-1 w-2/3 rounded-full bg-primary" />
      </div>
      <div className="mt-8">
        <p className="text-sm font-medium text-primary">Step 2 of 3</p>
        <h1 className="mt-2 text-3xl font-bold">Choose your style</h1>
        <p className="mt-2 text-muted-foreground">Your dashboard and QR card will feel like your business.</p>
      </div>
      <div className="mt-8 grid grid-cols-2 gap-3">
        {themes.map((theme) => (
          <Card key={theme.id} role="button" onClick={() => setSelected(theme.id)} className={cn("overflow-hidden", selected === theme.id && "ring-2 ring-primary")}>
            <div className={cn("h-24 bg-gradient-to-br", theme.gradient)}>
              {selected === theme.id ? <Check className="ml-auto mr-3 pt-3 text-white" /> : null}
            </div>
            <div className="p-3 font-semibold">{theme.name}</div>
          </Card>
        ))}
      </div>
      <div className="mt-auto safe-bottom pt-8">
        {error ? <p className="mb-3 text-sm text-destructive">{error}</p> : null}
        <Button
          className="w-full"
          size="lg"
          onClick={saveTheme}
          disabled={isSaving}
        >
          {isSaving ? "Saving..." : "Continue"}
        </Button>
      </div>
    </main>
  );
}
