"use client";

import { CalendarClock, Gift, MessageSquareText, Send, Wand2 } from "lucide-react";
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
          getCustomers({ shopId: activeShop.id, pageSize: 100 })
        ]);
        setWhatsAppStatus(status.status);
        setCustomers(customerResult.customers);
      })
      .catch((caught) => setError(caught instanceof Error ? caught.message : "Could not load shop"));
  }, []);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const storedDate = localStorage.getItem("zappy_campaign_scheduled_date");
      const storedTime = localStorage.getItem("zappy_campaign_scheduled_time");
      if (storedDate) setScheduledDate(storedDate);
      if (storedTime) setScheduledTime(storedTime);
    }
  }, []);

  useEffect(() => {
    if (scheduledDate) {
      localStorage.setItem("zappy_campaign_scheduled_date", scheduledDate);
    } else {
      localStorage.removeItem("zappy_campaign_scheduled_date");
    }
  }, [scheduledDate]);

  useEffect(() => {
    if (scheduledTime) {
      localStorage.setItem("zappy_campaign_scheduled_time", scheduledTime);
    } else {
      localStorage.removeItem("zappy_campaign_scheduled_time");
    }
  }, [scheduledTime]);

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
        setSuccess(`Your WhatsApp message is ready and sent to ${result.sent} customer${result.sent === 1 ? "" : "s"}.`);
      } else {
        setSuccess("Your scheduled WhatsApp campaign is ready.");
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

        {success ? <Card className="mt-5 border-[#10B981]/30 bg-[#10B981]/10 p-4 text-sm text-[#047857]">{success}</Card> : null}
        {shop && !canSend ? (
          <div className="mt-4 -mx-5 bg-[#FFFBEB] border-b border-[#FDE68A] px-5 py-[10px] text-[14px] text-[#92400E] flex justify-between items-center">
            <span>WhatsApp not connected — you can build your campaign and send it once connected.</span>
            <Link href="/onboarding/whatsapp" className="shrink-0 font-semibold text-primary ml-2 hover:underline">
              Connect WhatsApp →
            </Link>
          </div>
        ) : null}

        <div className="mt-5">
          <p className="text-[13px] text-[#6B7280]">
            Step {step} of 5 — {step === 1 ? "Choose Campaign Type" : step === 2 ? "Choose Audience" : step === 3 ? "Choose Reward" : step === 4 ? "Choose Message" : "Schedule"}
          </p>
          <div className="mt-2 h-[4px] w-full rounded-[2px] bg-[#E5E7EB] overflow-hidden">
            <div className="h-full bg-primary transition-all duration-300" style={{ width: `${(step / 5) * 100}%` }} />
          </div>
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
                    {item.count === 0 ? (
                      <p className="mt-2 text-[13px] text-[#6B7280]">
                        No dates saved yet. You can still create this campaign.
                      </p>
                    ) : null}
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
                <div className="mt-4 space-y-2 text-left">
                  <div className="grid grid-cols-2 gap-3">
                    <Input type="date" value={scheduledDate} onChange={(event) => setScheduledDate(event.target.value)} />
                    <Input type="time" value={scheduledTime} onChange={(event) => setScheduledTime(event.target.value)} />
                  </div>
                  <p className="text-[12px] text-[#6B7280]">
                    Scheduled in <strong>India Standard Time (IST - UTC+5:30)</strong>
                  </p>
                </div>
              ) : null}
              <div className="mt-4 rounded-[20px] bg-[#F9FAFB] p-5 border border-[#E5E7EB] text-left space-y-4 shadow-sm">
                <div>
                  <p className="text-[11px] uppercase tracking-wider text-[#6B7280] font-bold">Who receives it</p>
                  <p className="mt-1 text-[15px] font-medium text-[#111827]">
                    {recipientCount} {type.toLowerCase()} customer{recipientCount === 1 ? "" : "s"}
                  </p>
                </div>
                <hr className="border-t border-[#E5E7EB]" />
                <div>
                  <p className="text-[11px] uppercase tracking-wider text-[#6B7280] font-bold">What they get</p>
                  <p className="mt-1 text-[15px] font-medium text-[#111827]">
                    {reward === "Greeting Only" ? "Greeting Only" : `Greeting & ${reward}`}
                  </p>
                </div>
                <hr className="border-t border-[#E5E7EB]" />
                <div>
                  <p className="text-[11px] uppercase tracking-wider text-[#6B7280] font-bold">When it sends</p>
                  <p className="mt-1 text-[15px] font-medium text-[#111827]">
                    {schedule === "Send Now" ? "After your approval (Send Now)" : `Scheduled for ${scheduledDate} at ${scheduledTime} (IST)`}
                  </p>
                </div>
                <hr className="border-t border-[#E5E7EB]" />
                <div>
                  <p className="text-[11px] uppercase tracking-wider text-[#6B7280] font-bold mb-2">Message Preview</p>
                  <div className="relative rounded-2xl bg-[#E2F9D3] border border-[#d1ebc4] p-3 text-sm text-[#303030] shadow-sm max-w-[280px]">
                    <p className="whitespace-pre-wrap pr-10">{preview}</p>
                    <span className="absolute bottom-1 right-2 text-[9px] text-[#808080]">
                      {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                </div>
              </div>
            </>
          ) : null}
          {error ? (
            <div className="mt-4 rounded-[12px] border border-[#FECACA] bg-[#FEF2F2] p-[12px_16px] text-sm text-[#991B1B]">
              {error}
            </div>
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
