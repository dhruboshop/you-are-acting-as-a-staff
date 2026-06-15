"use client";

import { Download, Maximize2, Printer, Share2 } from "lucide-react";
import { QRCodeSVG } from "qrcode.react";
import { useEffect, useState } from "react";
import { AppShell } from "@/components/app/app-shell";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { getShops, type Shop } from "@/lib/api";
import { env } from "@/lib/env";

export default function QrPage() {
  const [shop, setShop] = useState<Shop | null>(null);
  const [appOrigin, setAppOrigin] = useState(env.appUrl);
  const [error, setError] = useState("");
  const registrationUrl = shop && appOrigin ? `${appOrigin}/register/${shop.id}` : "";

  useEffect(() => {
    if (!env.appUrl && typeof window !== "undefined") {
      setAppOrigin(window.location.origin);
    }
    getShops()
      .then(({ shops }) => setShop(shops[0] ?? null))
      .catch((caught) => setError(caught instanceof Error ? caught.message : "Could not load shop"));
  }, []);

  async function shareQr() {
    if (registrationUrl && navigator.share) {
      await navigator.share({ title: shop?.name ?? "LoyaltyPilot", text: `Register with ${shop?.name ?? "our shop"}`, url: registrationUrl });
    }
  }

  return (
    <AppShell active="QR">
      <section className="px-5 py-6">
        <h1 className="text-3xl font-bold">Your QR Code</h1>
        <p className="mt-2 text-muted-foreground">Place this near the counter so customers can register.</p>
        <Card className="mt-6 p-6 text-center">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-primary text-primary-foreground">LP</div>
          <h2 className="mt-3 text-xl font-bold">{shop?.name ?? "No shop loaded"}</h2>
          {error ? <p className="mt-3 text-sm text-destructive">{error}</p> : null}
          {registrationUrl ? (
            <>
              <div className="mt-5 flex justify-center">
                <QRCodeSVG value={registrationUrl} size={230} />
              </div>
              <p className="mt-4 break-all text-xs text-muted-foreground">{registrationUrl}</p>
              <p className="mt-2 text-sm text-muted-foreground">Scan for birthday and festival offers</p>
            </>
          ) : (
            <p className="mt-5 text-sm text-muted-foreground">Create a shop first, then this page will generate your customer registration QR.</p>
          )}
        </Card>
        <div className="mt-6 grid grid-cols-2 gap-3">
          <Button variant="secondary" disabled={!registrationUrl}>
            <Download className="h-5 w-5" />
            Download
          </Button>
          <Button variant="secondary" onClick={() => window.print()}>
            <Printer className="h-5 w-5" />
            Print
          </Button>
          <Button variant="whatsapp" onClick={shareQr} disabled={!registrationUrl}>
            <Share2 className="h-5 w-5" />
            Share
          </Button>
          <Button variant="secondary" disabled={!registrationUrl}>
            <Maximize2 className="h-5 w-5" />
            Fullscreen
          </Button>
        </div>
      </section>
    </AppShell>
  );
}
