"use client";

import { CalendarClock, Gift, MessageSquareText, Send, Smartphone, Wand2, Users } from "lucide-react";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { AppShell } from "@/components/app/app-shell";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { createCampaign, getCustomers, getShops, getWhatsAppStatus, sendCampaign, type Customer, type Shop, type WhatsAppConnectionStatus } from "@/lib/api";
import { festivals } from "@/lib/demo-data";

const campaignTypes = ["Birthday", "Anniversary", "Festival"] as const;
const rewards = ["Greeting Only", "100 Rupee Coupon", "200 Rupee Coupon", "10 Percent Discount", "20 Percent Discount", "Free Item", "Custom Gift"] as const;
const messageSources = ["AI Generated", "Manual Message"] as const;
const schedules = ["Send Now", "Schedule"] as const;
const templateKeyByType = {
  Birthday: "birthday",
  Anniversary: "anniversary",
  Festival: "festival"
} as const;

function defaultMessage(type: string, reward: string, festival: string) {
  const rewardLine = reward === "Greeting Only" ? "" : ` Your ${reward.toLowerCase()} is waiting for you.`;
  if (type === "Birthday") return `Hi {{customerName}}, happy birthday from {{shopName}}.${rewardLine}`;
  if (type === "Anniversary") return `Hi {{customerName}}, happy anniversary from {{shopName}}.${rewardLine}`;
  return `Hi {{customerName}}, {{shopName}} wishes you a joyful ${festival}.${rewardLine}`;
}

function audienceOptions(type: (typeof campaignTypes)[number], customers: Customer[]) {
  const all = customers.length;
  const birthday = customers.filter((customer) => Boolean(customer.birthday)).length;
  const anniversary = customers.filter((customer) => Boolean(customer.anniversary)).length;
  if (type === "Birthday") return [{ label: "Birthday Customers", count: birthday }];
  if (type === "Anniversary") return [{ label: "Anniversary Customers", count: anniversary }];
  return [{ label: "All Customers", count: all }];
}

export default function CampaignsPage() {
  const [step, setStep] = useState(1);
  const [type, setType] = useState<(typeof campaignTypes)[number]>("Birthday");
  const [reward, setReward] = useState<(typeof rewards)[number]>("Greeting Only");
  const [messageSource, setMessageSource] = useState<(typeof messageSources)[number]>("AI Generated");
  const [schedule, setSchedule] = useState<(typeof schedules)[number]>("Send Now");
  const [scheduledDate, setScheduledDate] = useState("");
  const [scheduledTime, setScheduledTime] = useState("");
  const [festival, setFestival] = useState("Diwali");
  const [message, setMessage] = useState(defaultMessage("Birthday", "Greeting Only", "Diwali"));
  const [variants, setVariants] = useState<string[]>([]);
  const [shop, setShop] = useState<Shop | null>(null);
  const [customers, setCustomers] = useState<Customer[]>([]);
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
        const [status, customerResult] = await Promise.all([
          getWhatsAppStatus(activeShop.id).catch(() => ({ status: "unknown" as WhatsAppConnectionStatus })),
          getCustomers({ shopId: activeShop.id, pageSize: 200 })
        ]);
        setWhatsAppStatus(status.status);
        setCustomers(customerResult.customers);
      })
      .catch((caught) => setError(caught instanceof Error ? caught.message : "Could not load shop"));
  }, []);

  useEffect(() => {
    setMessage(defaultMessage(type, reward, festival));
  }, [type, reward, festival]);

  const canSend = Boolean(shop && (whatsAppStatus === "connected" || whatsAppStatus === "open"));
  const templateKey = templateKeyByType[type];
  const options = useMemo(() => audienceOptions(type, customers), [type, customers]);
  const recipientCount = options[0]?.count ?? 0;
  const preview = useMemo(() => message.replaceAll("{{customerName}}", "Customer").replaceAll("{{shopName}}", shop?.name ?? "your shop"), [message, shop?.name]);

  function generateVariants() {
    const generated = [
      defaultMessage(type, reward, festival),
      `Dear {{customerName}}, ${shop?.name ?? "{{shopName}}"} is remembering your special day.${reward === "Greeting Only" ? "" : ` ${reward} for you.`}`,
      `Hi {{customerName}}, warm wishes from {{shopName}}.${reward === "Greeting Only" ? "" : ` Visit us for your ${reward.toLowerCase()}.`}`
    ];
    setVariants(generated);
    setMessage(generated[0]);
  }

  async function approve() {
    if (!shop) {
      setError("Create your shop before sending campaigns.");
      return;
    }
    if (!canSend && schedule === "Send Now") {
      setError("Connect WhatsApp before sending campaigns.");
      return;
    }
    if (recipientCount === 0) {
      setError("No customers match this campaign yet. Share your QR code first.");
      return;
    }
    const scheduledAt = schedule === "Schedule" ? `${scheduledDate}T${scheduledTime}:00.000Z` : null;
    if (schedule === "Schedule" && (!scheduledDate || !scheduledTime)) {
      setError("Choose both date and time before scheduling.");
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
        target: "all",
        scheduledAt
      });
      if (schedule === "Send Now") {
        const result = await sendCampaign(created.campaign.id);
        setSuccess(`Campaign sent to ${result.sent} customer${result.sent === 1 ? "" : "s"}. Failed: ${result.failed}.`);
      } else {
        setSuccess("Campaign scheduled. Festival campaigns and scheduled sends stay approval-first.");
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
        <p className="text-sm font-semibold text-primary">Birthday wishes, festival offers, WhatsApp rewards</p>
        <h1 className="mt-1 text-3xl font-bold">Create Campaign</h1>
        <p className="mt-2 text-muted-foreground">Choose who receives it, what gets sent, what reward is included, and when it sends.</p>

        {error ? <Card className="mt-5 border-destructive/30 bg-destructive/10 p-4 text-sm text-destructive">{error}</Card> : null}
        {success ? <Card className="mt-5 border-[#10B981]/30 bg-[#10B981]/10 p-4 text-sm text-[#047857]">{success}</Card> : null}
        {shop && !canSend ? (
          <Card className="mt-5 p-4 text-sm text-muted-foreground">
            <div className="flex gap-3">
              <Smartphone className="h-5 w-5 text-primary" />
              <div>
                <p className="font-semibold text-foreground">Connect WhatsApp before sending</p>
                <p className="mt-1">You can prepare a campaign now. Sending unlocks when WhatsApp is connected.</p>
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
              <h2 className="font-semibold">Step 1 · Choose Campaign Type</h2>
              <div className="mt-4 grid grid-cols-3 gap-2">
                {campaignTypes.map((item) => (
                  <button key={item} onClick={() => setType(item)} className={`rounded-2xl border p-3 text-left text-sm font-semibold ${type === item ? "border-primary bg-primary text-primary-foreground" : "border-border bg-card"}`}>
                    {item}
                  </button>
                ))}
              </div>
              {type === "Festival" ? (
                <div className="mt-4 grid grid-cols-2 gap-2">
                  {festivals.map((item) => (
                    <button key={item} onClick={() => setFestival(item)} className={`rounded-xl border p-2 text-xs font-semibold ${festival === item ? "border-primary bg-primary/10 text-primary" : "border-border"}`}>{item}</button>
                  ))}
                </div>
              ) : null}
            </>
          ) : null}

          {step === 2 ? (
            <>
              <h2 className="font-semibold">Step 2 · Choose Audience</h2>
              <div className="mt-4 space-y-2">
                {options.map((item) => (
                  <div key={item.label} className="rounded-2xl border border-primary bg-primary/10 p-3">
                    <div className="flex items-center justify-between gap-3">
                      <span className="font-semibold">{item.label}</span>
                      <span className="rounded-full bg-card px-3 py-1 text-sm font-semibold">{item.count}</span>
                    </div>
                    <p className="mt-1 text-sm text-muted-foreground">Recipient count is based only on saved customer records.</p>
                  </div>
                ))}
              </div>
            </>
          ) : null}

          {step === 3 ? (
            <>
              <h2 className="font-semibold">Step 3 · Choose Reward</h2>
              <div className="mt-4 grid grid-cols-2 gap-2">
                {rewards.map((item) => (
                  <button key={item} onClick={() => setReward(item)} className={`rounded-2xl border p-3 text-left text-sm font-semibold ${reward === item ? "border-primary bg-primary text-primary-foreground" : "border-border bg-card"}`}>
                    <Gift className="mb-2 h-4 w-4" />{item}
                  </button>
                ))}
              </div>
            </>
          ) : null}

          {step === 4 ? (
            <>
              <div className="flex items-center justify-between">
                <h2 className="font-semibold">Step 4 · Choose Message</h2>
                <Button size="sm" variant="secondary" onClick={generateVariants}><Wand2 className="h-4 w-4" />Generate</Button>
              </div>
              <div className="mt-4 grid grid-cols-2 gap-2">
                {messageSources.map((item) => (
                  <button key={item} onClick={() => setMessageSource(item)} className={`rounded-2xl border p-3 text-sm font-semibold ${messageSource === item ? "border-primary bg-primary text-primary-foreground" : "border-border bg-card"}`}>
                    <MessageSquareText className="mx-auto mb-2 h-4 w-4" />{item}
                  </button>
                ))}
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

          {step === 5 ? (
            <>
              <h2 className="font-semibold">Step 5 · Schedule</h2>
              <div className="mt-4 grid grid-cols-2 gap-2">
                {schedules.map((item) => (
                  <button key={item} onClick={() => setSchedule(item)} className={`rounded-2xl border p-3 text-sm font-semibold ${schedule === item ? "border-primary bg-primary text-primary-foreground" : "border-border bg-card"}`}>
                    <CalendarClock className="mx-auto mb-2 h-4 w-4" />{item}
                  </button>
                ))}
              </div>
              {schedule === "Schedule" ? (
                <div className="mt-4 grid grid-cols-2 gap-3">
                  <Input type="date" value={scheduledDate} onChange={(event) => setScheduledDate(event.target.value)} />
                  <Input type="time" value={scheduledTime} onChange={(event) => setScheduledTime(event.target.value)} />
                </div>
              ) : null}
              <Card className="mt-4 p-3 text-sm text-muted-foreground">
                <div className="flex items-center gap-2 font-semibold text-foreground"><Users className="h-4 w-4" />{recipientCount} recipient{recipientCount === 1 ? "" : "s"}</div>
                <p className="mt-2">Reward: {reward}. Send: {schedule === "Send Now" ? "after approval" : "on the selected date and time"}.</p>
              </Card>
            </>
          ) : null}
        </Card>

        <div className="safe-bottom mt-6 grid grid-cols-2 gap-3">
          <Button variant="secondary" disabled={step === 1 || isSending} onClick={() => setStep((value) => Math.max(1, value - 1))}>Back</Button>
          {step < 5 ? (
            <Button onClick={() => setStep((value) => Math.min(5, value + 1))}>Next</Button>
          ) : (
            <Button onClick={approve} disabled={isSending || (schedule === "Send Now" && !canSend)}>
              {isSending ? "Sending..." : <><Send className="h-4 w-4" />Approve</>}
            </Button>
          )}
        </div>
      </section>
    </AppShell>
  );
}
