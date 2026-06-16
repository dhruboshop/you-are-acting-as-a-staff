"use client";

import { CalendarClock, Gift, Send, Smartphone, Wand2 } from "lucide-react";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
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

const campaignTypes = ["Birthday", "Anniversary", "Festival", "Win Back", "Welcome", "Custom"] as const;
const rewards = ["Coupon", "Discount", "Free Item", "Custom Gift"] as const;
const audiences = ["All customers", "Birthday customers", "VIP customers", "Inactive customers"] as const;
const schedules = ["Now", "Later", "Automatic"] as const;
const templateKeyByType = {
  Birthday: "birthday",
  Anniversary: "anniversary",
  Festival: "festival",
  "Win Back": "winback",
  Welcome: "festival",
  Custom: "festival"
} as const;

function defaultMessage(type: string, reward: string) {
  if (type === "Birthday") return `Hi {{customerName}}, happy birthday from {{shopName}}. Your ${reward.toLowerCase()} is waiting for you.`;
  if (type === "Anniversary") return `Hi {{customerName}}, happy anniversary from {{shopName}}. Celebrate with a ${reward.toLowerCase()} from us.`;
  if (type === "Win Back") return `Hi {{customerName}}, we miss you at {{shopName}}. Come back this week for a ${reward.toLowerCase()}.`;
  if (type === "Welcome") return `Hi {{customerName}}, welcome to {{shopName}} rewards. We are happy to have you with us.`;
  return `Hi {{customerName}}, {{shopName}} has a festive ${reward.toLowerCase()} for you. Visit us soon.`;
}

export default function CampaignsPage() {
  const [step, setStep] = useState(1);
  const [type, setType] = useState<(typeof campaignTypes)[number]>("Birthday");
  const [reward, setReward] = useState<(typeof rewards)[number]>("Coupon");
  const [audience, setAudience] = useState<(typeof audiences)[number]>("All customers");
  const [schedule, setSchedule] = useState<(typeof schedules)[number]>("Now");
  const [festival, setFestival] = useState("Diwali");
  const [message, setMessage] = useState(defaultMessage("Birthday", "Coupon"));
  const [variants, setVariants] = useState<string[]>([]);
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

  useEffect(() => {
    setMessage(defaultMessage(type, reward));
  }, [type, reward]);

  const canSend = Boolean(shop && (whatsAppStatus === "connected" || whatsAppStatus === "open"));
  const templateKey = templateKeyByType[type];
  const target = audience === "VIP customers" ? "loyalty_members" : "all";
  const preview = useMemo(() => message.replaceAll("{{customerName}}", "Dhrubo").replaceAll("{{shopName}}", shop?.name ?? "your shop"), [message, shop?.name]);

  function generateVariants() {
    const generated = [
      defaultMessage(type, reward),
      `Dear {{customerName}}, ${shop?.name ?? "{{shopName}}"} has a ${reward.toLowerCase()} for you. Reply or visit us today.`,
      `{{customerName}}, thanks for being with {{shopName}}. Your ${type.toLowerCase()} ${reward.toLowerCase()} is ready.`
    ];
    setVariants(generated);
    setMessage(generated[0]);
  }

  async function approve() {
    if (!shop) {
      setError("Create your shop before sending campaigns.");
      return;
    }
    if (!canSend && schedule === "Now") {
      setError("Connect WhatsApp before sending campaigns.");
      return;
    }
    setError("");
    setSuccess("");
    setIsSending(true);
    try {
      const created = await createCampaign({
        shopId: shop.id,
        templateKey,
        title: `${type}${type === "Festival" ? `: ${festival}` : ""}`,
        message,
        target
      });
      if (schedule === "Now") {
        const result = await sendCampaign(created.campaign.id);
        setSuccess(`Campaign sent to ${result.sent} customer${result.sent === 1 ? "" : "s"}. Failed: ${result.failed}.`);
      } else {
        setSuccess("Campaign draft saved. Automatic and later sends stay approval-first on the free-tier setup.");
      }
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Could not approve campaign");
    } finally {
      setIsSending(false);
    }
  }

  return (
    <AppShell active="Campaigns">
      <section className="px-5 py-6">
        <p className="text-sm font-semibold text-primary">Zappy campaigns</p>
        <h1 className="mt-1 text-3xl font-bold">Send a customer nudge</h1>
        <p className="mt-2 text-muted-foreground">Birthday wishes, anniversary greetings, festival offers, and win-back messages.</p>

        {error ? <Card className="mt-5 border-destructive/30 bg-destructive/10 p-4 text-sm text-destructive">{error}</Card> : null}
        {success ? <Card className="mt-5 border-[#10B981]/30 bg-[#10B981]/10 p-4 text-sm text-[#047857]">{success}</Card> : null}
        {shop && !canSend ? (
          <Card className="mt-5 p-4 text-sm text-muted-foreground">
            <div className="flex gap-3">
              <Smartphone className="h-5 w-5 text-primary" />
              <div>
                <p className="font-semibold text-foreground">Connect WhatsApp before sending</p>
                <p className="mt-1">You can still prepare a draft. Sending unlocks when WhatsApp is connected.</p>
              </div>
            </div>
            <Button asChild className="mt-3 w-full"><Link href="/onboarding/whatsapp">Connect WhatsApp</Link></Button>
          </Card>
        ) : null}

        <div className="mt-5 flex gap-2">
          {[1, 2, 3, 4, 5].map((item) => (
            <div key={item} className={`h-1 flex-1 rounded-full ${item <= step ? "bg-primary" : "bg-muted"}`} />
          ))}
        </div>

        <Card className="mt-5 p-4">
          {step === 1 ? (
            <>
              <h2 className="font-semibold">Step 1 · Choose campaign</h2>
              <div className="mt-4 grid grid-cols-2 gap-2">
                {campaignTypes.map((item) => (
                  <button key={item} onClick={() => setType(item)} className={`rounded-2xl border p-3 text-left text-sm font-semibold ${type === item ? "border-primary bg-primary text-primary-foreground" : "border-border bg-card"}`}>
                    {item}
                  </button>
                ))}
              </div>
              {type === "Festival" ? (
                <div className="mt-4 grid grid-cols-3 gap-2">
                  {festivals.map((item) => (
                    <button key={item} onClick={() => setFestival(item)} className={`rounded-xl border p-2 text-xs font-semibold ${festival === item ? "border-primary bg-primary/10 text-primary" : "border-border"}`}>{item}</button>
                  ))}
                </div>
              ) : null}
            </>
          ) : null}

          {step === 2 ? (
            <>
              <h2 className="font-semibold">Step 2 · Choose reward</h2>
              <div className="mt-4 grid grid-cols-2 gap-2">
                {rewards.map((item) => (
                  <button key={item} onClick={() => setReward(item)} className={`rounded-2xl border p-3 text-left text-sm font-semibold ${reward === item ? "border-primary bg-primary text-primary-foreground" : "border-border bg-card"}`}>
                    <Gift className="mb-2 h-4 w-4" />{item}
                  </button>
                ))}
              </div>
            </>
          ) : null}

          {step === 3 ? (
            <>
              <h2 className="font-semibold">Step 3 · Audience</h2>
              <div className="mt-4 space-y-2">
                {audiences.map((item) => (
                  <button key={item} onClick={() => setAudience(item)} className={`w-full rounded-2xl border p-3 text-left text-sm font-semibold ${audience === item ? "border-primary bg-primary text-primary-foreground" : "border-border bg-card"}`}>
                    {item}
                  </button>
                ))}
              </div>
            </>
          ) : null}

          {step === 4 ? (
            <>
              <h2 className="font-semibold">Step 4 · Schedule</h2>
              <div className="mt-4 grid grid-cols-3 gap-2">
                {schedules.map((item) => (
                  <button key={item} onClick={() => setSchedule(item)} className={`rounded-2xl border p-3 text-sm font-semibold ${schedule === item ? "border-primary bg-primary text-primary-foreground" : "border-border bg-card"}`}>
                    <CalendarClock className="mx-auto mb-2 h-4 w-4" />{item}
                  </button>
                ))}
              </div>
            </>
          ) : null}

          {step === 5 ? (
            <>
              <div className="flex items-center justify-between">
                <h2 className="font-semibold">Step 5 · Preview</h2>
                <Button size="sm" variant="secondary" onClick={generateVariants}><Wand2 className="h-4 w-4" />Generate</Button>
              </div>
              <Textarea className="mt-3" value={message} onChange={(event) => setMessage(event.target.value)} />
              <Card className="mt-3 bg-muted/50 p-3 text-sm">{preview}</Card>
              {variants.length ? (
                <div className="mt-3 space-y-2">
                  {variants.map((variant) => (
                    <button key={variant} onClick={() => setMessage(variant)} className="w-full rounded-2xl border border-border bg-card p-3 text-left text-sm">{variant}</button>
                  ))}
                </div>
              ) : null}
            </>
          ) : null}
        </Card>

        <div className="safe-bottom mt-6 grid grid-cols-2 gap-3">
          <Button variant="secondary" disabled={step === 1 || isSending} onClick={() => setStep((value) => Math.max(1, value - 1))}>Back</Button>
          {step < 5 ? (
            <Button onClick={() => setStep((value) => Math.min(5, value + 1))}>Next</Button>
          ) : (
            <Button onClick={approve} disabled={isSending || (schedule === "Now" && !canSend)}>
              {isSending ? "Sending..." : <><Send className="h-4 w-4" />Approve</>}
            </Button>
          )}
        </div>
      </section>
    </AppShell>
  );
}
