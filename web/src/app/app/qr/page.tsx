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
  { key: "poster", label: "Poster Display", className: "aspect-[3/4]" }
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
        <p className="text-[11px] uppercase tracking-[0.08em] font-semibold text-primary">Print once, collect customers daily</p>
        <h1 className="mt-1 text-[26px] font-bold text-[#111827]">QR Displays</h1>
        <p className="mt-2 text-[15px] text-[#6B7280]">Customers scan once to join your rewards list. This QR does not track visits.</p>

        <div className="mt-5 grid grid-cols-3 gap-2">
          {displayTypes.map((item) => (
            <button key={item.key} onClick={() => setDisplay(item.key)} className={`rounded-xl border px-2 py-3 text-xs font-semibold ${display === item.key ? "border-primary bg-primary text-primary-foreground" : "border-border bg-card"}`}>
              {item.label}
            </button>
          ))}
        </div>

        <Card 
          id="print-qr-card"
          className={`mt-6 flex ${activeDisplay.className} flex-col justify-between overflow-hidden rounded-[24px] border border-black/[0.08] p-8 text-center bg-white shadow-lg`}
        >
          <div className="space-y-3">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-primary text-xl font-bold text-white shadow-md">
              {shop?.name?.slice(0, 1).toUpperCase() ?? "Z"}
            </div>
            <h2 className="text-sm font-bold tracking-widest text-primary uppercase">{shop?.name ?? "Your Shop"}</h2>
            <p className="text-3xl font-black leading-tight text-[#111827]">🎁 Join Our Rewards List</p>
            <p className="text-[14px] text-[#6B7280] max-w-xs mx-auto leading-relaxed">
              Get birthday wishes, festival offers and exclusive updates.
            </p>
          </div>

          {error ? <p className="text-sm text-destructive">{error}</p> : null}
          {registrationUrl ? (
            <div ref={qrContainerRef} className="mx-auto rounded-2xl bg-white p-4 border border-black/[0.04] shadow-inner">
              <QRCodeSVG value={registrationUrl} size={200} />
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
            <div className="mx-auto grid max-w-xs grid-cols-3 gap-2 text-[11px] uppercase tracking-wider font-bold text-primary">
              <span>🎁 Wishes</span>
              <span>📣 Offers</span>
              <span>⭐ Rewards</span>
            </div>
            <p className="mt-4 text-[11px] font-medium text-muted-foreground uppercase tracking-widest">Powered by Zappy</p>
          </div>
        </Card>

        <div className="mt-6 space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <Button variant="secondary" disabled={!registrationUrl} onClick={downloadPng} className="w-full">
              <Download className="h-5 w-5 shrink-0" />
              Download PNG
            </Button>
            <Button variant="secondary" onClick={() => window.print()} disabled={!registrationUrl} className="w-full">
              <Printer className="h-5 w-5 shrink-0" />
              Print Display
            </Button>
          </div>
          <Button variant="whatsapp" onClick={shareQr} disabled={!registrationUrl} className="w-full">
            <Share2 className="h-5 w-5 shrink-0" />
            Share Registration Link
          </Button>
        </div>
      </section>
    </AppShell>
  );
}
