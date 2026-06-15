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
  const registrationUrl = shop ? `${env.appUrl}/register/${shop.id}` : `${env.appUrl}/auth/route`;

  useEffect(() => {
    getShops().then(({ shops }) => setShop(shops[0] ?? null));
  }, []);

  async function shareQr() {
    if (navigator.share) {
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
          <h2 className="mt-3 text-xl font-bold">{shop?.name ?? "Loading shop..."}</h2>
          <div className="mt-5 flex justify-center">
            <QRCodeSVG value={registrationUrl} size={230} />
          </div>
          <p className="mt-4 text-sm text-muted-foreground">Scan for birthday and festival offers</p>
        </Card>
        <div className="mt-6 grid grid-cols-2 gap-3">
          <Button variant="secondary">
            <Download className="h-5 w-5" />
            Download
          </Button>
          <Button variant="secondary" onClick={() => window.print()}>
            <Printer className="h-5 w-5" />
            Print
          </Button>
          <Button variant="whatsapp" onClick={shareQr}>
            <Share2 className="h-5 w-5" />
            Share
          </Button>
          <Button variant="secondary">
            <Maximize2 className="h-5 w-5" />
            Fullscreen
          </Button>
        </div>
      </section>
    </AppShell>
  );
}
