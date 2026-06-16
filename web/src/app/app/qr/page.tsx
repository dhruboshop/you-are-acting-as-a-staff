"use client";

import { Download, Printer, Share2 } from "lucide-react";
import { QRCodeSVG } from "qrcode.react";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { AppShell } from "@/components/app/app-shell";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { getShops, type Shop } from "@/lib/api";
import { env } from "@/lib/env";

const displayTypes = [
  { key: "counter", label: "Counter Display", className: "aspect-[4/5]" },
  { key: "table", label: "Table Display", className: "aspect-square" },
  { key: "poster", label: "Poster Version", className: "aspect-[3/4]" }
] as const;

type DisplayKey = (typeof displayTypes)[number]["key"];

export default function QrPage() {
  const qrContainerRef = useRef<HTMLDivElement | null>(null);
  const [shop, setShop] = useState<Shop | null>(null);
  const [display, setDisplay] = useState<DisplayKey>("counter");
  const [appOrigin, setAppOrigin] = useState(env.appUrl);
  const [error, setError] = useState("");
  const registrationUrl = shop && appOrigin ? `${appOrigin}/register/${shop.id}` : "";
  const activeDisplay = displayTypes.find((item) => item.key === display) ?? displayTypes[0];

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
      await navigator.share({ title: shop?.name ?? "Zappy", text: `Join rewards at ${shop?.name ?? "our shop"}`, url: registrationUrl });
    }
  }

  function downloadPng() {
    if (!qrContainerRef.current || !registrationUrl) return;
    const svg = qrContainerRef.current.querySelector("svg");
    if (!svg) return;
    const source = new XMLSerializer().serializeToString(svg);
    const image = new Image();
    const canvas = document.createElement("canvas");
    canvas.width = 1024;
    canvas.height = 1024;
    image.onload = () => {
      const context = canvas.getContext("2d");
      if (!context) return;
      context.fillStyle = "#ffffff";
      context.fillRect(0, 0, canvas.width, canvas.height);
      context.drawImage(image, 160, 160, 704, 704);
      const link = document.createElement("a");
      link.download = `${shop?.name ?? "zappy"}-qr.png`.toLowerCase().replace(/[^a-z0-9]+/g, "-");
      link.href = canvas.toDataURL("image/png");
      link.click();
    };
    image.src = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(source)}`;
  }

  return (
    <AppShell active="QR">
      <section className="px-5 py-6">
        <p className="text-sm font-semibold text-primary">Print once, collect customers daily</p>
        <h1 className="mt-1 text-3xl font-bold">QR Displays</h1>
        <p className="mt-2 text-muted-foreground">Customers scan once to join your rewards list. This QR does not track visits.</p>

        <div className="mt-5 grid grid-cols-3 gap-2">
          {displayTypes.map((item) => (
            <button key={item.key} onClick={() => setDisplay(item.key)} className={`rounded-xl border px-2 py-3 text-xs font-semibold ${display === item.key ? "border-primary bg-primary text-primary-foreground" : "border-border bg-card"}`}>
              {item.label}
            </button>
          ))}
        </div>

        <Card className={`mt-6 flex ${activeDisplay.className} flex-col justify-between overflow-hidden rounded-3xl border-2 border-primary/20 p-6 text-center`}>
          <div>
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-primary text-xl font-bold text-primary-foreground">Z</div>
            <h2 className="mt-4 text-2xl font-bold">{shop?.name ?? "Your Shop"}</h2>
            <p className="mt-2 text-3xl font-black leading-tight">Scan and Join Rewards</p>
          </div>

          {error ? <p className="text-sm text-destructive">{error}</p> : null}
          {registrationUrl ? (
            <div ref={qrContainerRef} className="mx-auto rounded-3xl bg-white p-4 shadow-sm">
              <QRCodeSVG value={registrationUrl} size={220} />
            </div>
          ) : (
            <div className="space-y-3">
              <p className="text-sm text-muted-foreground">Create a shop first, then this page will generate your customer registration QR.</p>
              <Button asChild>
                <Link href="/onboarding/shop">Create Shop</Link>
              </Button>
            </div>
          )}

          <div>
            <div className="mx-auto grid max-w-xs grid-cols-3 gap-2 text-xs font-semibold text-primary">
              <span>Birthday Wishes</span>
              <span>Festival Offers</span>
              <span>Special Rewards</span>
            </div>
            <p className="mt-4 text-xs text-muted-foreground">Powered by Zappy</p>
          </div>
        </Card>

        <div className="mt-6 grid grid-cols-2 gap-3">
          <Button variant="secondary" disabled={!registrationUrl} onClick={downloadPng}>
            <Download className="h-5 w-5" />
            PNG
          </Button>
          <Button variant="secondary" onClick={() => window.print()} disabled={!registrationUrl}>
            <Printer className="h-5 w-5" />
            PDF / Print
          </Button>
          <Button variant="whatsapp" onClick={shareQr} disabled={!registrationUrl}>
            <Share2 className="h-5 w-5" />
            Share
          </Button>
          <Button variant="secondary" onClick={() => window.print()} disabled={!registrationUrl}>
            <Printer className="h-5 w-5" />
            Print-Friendly
          </Button>
        </div>
      </section>
    </AppShell>
  );
}
