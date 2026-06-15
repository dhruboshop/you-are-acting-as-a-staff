"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Smartphone, Wand2 } from "lucide-react";
import { AppShell } from "@/components/app/app-shell";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import {
  createCampaign,
  getShops,
  getWhatsAppStatus,
  sendCampaign,
  type Shop,
  type WhatsAppConnectionStatus
} from "@/lib/api";
import { festivals } from "@/lib/demo-data";

const variants = [
  "Hi {{customerName}}, wishing you a joyful festival season from {{shopName}}. Visit us this week for something special.",
  "Dear {{customerName}}, celebrate with {{shopName}}. We have a small festive surprise waiting for you.",
  "{{customerName}}, may this season bring happiness to your home. Thank you for being part of {{shopName}}."
];

const campaignTypes = ["Birthday", "Anniversary", "Festival", "Win-back"];
const templateKeyByType = {
  Birthday: "birthday",
  Anniversary: "anniversary",
  Festival: "festival",
  "Win-back": "winback"
} as const;

export default function CampaignsPage() {
  const [type, setType] = useState("Birthday");
  const [message, setMessage] = useState(variants[0]);
  const [generated, setGenerated] = useState<string[]>([]);
  const [shop, setShop] = useState<Shop | null>(null);
  const [whatsAppStatus, setWhatsAppStatus] = useState<WhatsAppConnectionStatus>("unknown");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isSending, setIsSending] = useState(false);

  useEffect(() => {
    getShops()
      .then(async ({ shops }) => {
        const activeShop = shops[0] ?? null;
        setShop(activeShop);
        if (!activeShop) return;
        const status = await getWhatsAppStatus(activeShop.id).catch(() => ({ status: "unknown" as WhatsAppConnectionStatus }));
        setWhatsAppStatus(status.status);
      })
      .catch((caught) => setError(caught instanceof Error ? caught.message : "Could not load shop"));
  }, []);

  const canQueue = Boolean(shop && (whatsAppStatus === "connected" || whatsAppStatus === "open"));
  const selectedTemplateKey = templateKeyByType[type as keyof typeof templateKeyByType];

  async function approveAndQueue() {
    if (!shop) {
      setError("Create your shop before sending campaigns.");
      return;
    }
    if (!canQueue) {
      setError("Connect WhatsApp before sending campaigns.");
      return;
    }
    setError("");
    setSuccess("");
    setIsSending(true);
    try {
      const created = await createCampaign({
        shopId: shop.id,
        templateKey: selectedTemplateKey,
        title: `${type} Campaign`,
        message
      });
      const result = await sendCampaign(created.campaign.id);
      setSuccess(`Campaign sent to ${result.sent} customer${result.sent === 1 ? "" : "s"}. Failed: ${result.failed}.`);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Could not send campaign");
    } finally {
      setIsSending(false);
    }
  }

  return (
    <AppShell active="Campaigns">
      <section className="px-5 py-6">
        <h1 className="text-3xl font-bold">Campaigns</h1>
        <p className="mt-2 text-muted-foreground">Generate, approve, and queue WhatsApp messages.</p>
        {error ? (
          <Card className="mt-5 border-destructive/30 bg-destructive/10 p-4 text-sm text-destructive">
            <p>{error}</p>
          </Card>
        ) : null}
        {success ? (
          <Card className="mt-5 border-[#10B981]/30 bg-[#10B981]/10 p-4 text-sm text-[#047857]">
            <p>{success}</p>
          </Card>
        ) : null}
        {!shop ? (
          <Card className="mt-5 p-4 text-sm text-muted-foreground">
            Create your shop before sending campaigns.
            <Button asChild className="mt-3 w-full">
              <Link href="/onboarding/shop">Create Shop</Link>
            </Button>
          </Card>
        ) : null}
        {shop && !canQueue ? (
          <Card className="mt-5 p-4 text-sm text-muted-foreground">
            <div className="flex gap-3">
              <Smartphone className="h-5 w-5 text-primary" />
              <div>
                <p className="font-semibold text-foreground">Connect WhatsApp to send campaigns</p>
                <p className="mt-1">You can draft messages now, but queueing is locked until WhatsApp is connected.</p>
              </div>
            </div>
            <Button asChild className="mt-3 w-full">
              <Link href="/onboarding/whatsapp">Connect WhatsApp</Link>
            </Button>
          </Card>
        ) : null}
        <div className="mt-5 flex gap-2 overflow-x-auto pb-1">
          {campaignTypes.map((item) => (
            <button key={item} onClick={() => setType(item)} className={`shrink-0 rounded-full border px-3 py-2 text-sm ${type === item ? "border-primary bg-primary text-primary-foreground" : "border-border bg-card"}`}>
              {item}
            </button>
          ))}
        </div>
        {type === "Festival" ? (
          <div className="mt-4 grid grid-cols-3 gap-2">
            {festivals.map((festival) => (
              <Card key={festival} className="p-3 text-center text-sm font-semibold">{festival}</Card>
            ))}
          </div>
        ) : null}
        <Card className="mt-5 p-4">
          <div className="flex items-center justify-between">
            <h2 className="font-semibold">AI Message</h2>
            <Button size="sm" variant="secondary" onClick={() => setGenerated(variants)}>
              <Wand2 className="h-4 w-4" />
              Generate
            </Button>
          </div>
          <Textarea className="mt-3" value={message} onChange={(event) => setMessage(event.target.value)} />
        </Card>
        {generated.length ? (
          <div className="mt-4 space-y-3">
            {generated.map((variant) => (
              <Card key={variant} role="button" onClick={() => setMessage(variant)} className="p-3 text-sm">
                {variant}
              </Card>
            ))}
          </div>
        ) : null}
        <div className="safe-bottom mt-6 space-y-3">
          <Button className="w-full" disabled={!canQueue || isSending} onClick={approveAndQueue}>
            {isSending ? "Sending..." : "Approve & Send"}
          </Button>
          <Button className="w-full" variant="secondary">Save Template</Button>
        </div>
      </section>
    </AppShell>
  );
}
