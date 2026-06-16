"use client";

import { Bot, CalendarHeart, Gift, HeartHandshake, MessageCircle } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { AppShell } from "@/components/app/app-shell";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { getShops, updateShop, type Shop } from "@/lib/api";

type AutomationKey = "birthday" | "anniversary" | "festival" | "welcome";

const automations: Array<{
  key: AutomationKey;
  title: string;
  trigger: string;
  sendTime: string;
  approval: string;
  preview: string;
  icon: typeof Bot;
}> = [
  {
    key: "birthday",
    title: "Birthday Wishes",
    trigger: "Customer Birthday",
    sendTime: "09:00 AM",
    approval: "Saved as your birthday greeting setup",
    preview: "Happy birthday, {name}! Warm wishes from {shop}.",
    icon: CalendarHeart
  },
  {
    key: "anniversary",
    title: "Anniversary Greetings",
    trigger: "Customer Anniversary",
    sendTime: "09:00 AM",
    approval: "Saved as your anniversary greeting setup",
    preview: "Happy anniversary, {name}! {shop} sends warm wishes.",
    icon: HeartHandshake
  },
  {
    key: "festival",
    title: "Festival Drafts",
    trigger: "Upcoming Indian Festival",
    sendTime: "Create draft only",
    approval: "Approval required before any festival send",
    preview: "{shop} wishes you a joyful festival season.",
    icon: Gift
  },
  {
    key: "welcome",
    title: "Welcome Message",
    trigger: "New Customer Joins",
    sendTime: "Immediately after registration",
    approval: "Saved as your welcome greeting setup",
    preview: "Welcome to {shop} rewards, {name}.",
    icon: MessageCircle
  }
];

function readAutomationSettings(shop: Shop | null): Record<AutomationKey, boolean> {
  const settings = shop?.settings ?? {};
  const automationSettings = typeof settings.automations === "object" && settings.automations ? settings.automations as Partial<Record<AutomationKey, boolean>> : {};
  return {
    birthday: automationSettings.birthday ?? false,
    anniversary: automationSettings.anniversary ?? false,
    festival: automationSettings.festival ?? false,
    welcome: automationSettings.welcome ?? false
  };
}

export default function AutomationsPage() {
  const [shop, setShop] = useState<Shop | null>(null);
  const [settings, setSettings] = useState<Record<AutomationKey, boolean>>({ birthday: false, anniversary: false, festival: false, welcome: false });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const enabledCount = useMemo(() => Object.values(settings).filter(Boolean).length, [settings]);

  useEffect(() => {
    getShops()
      .then(({ shops }) => {
        const activeShop = shops[0] ?? null;
        setShop(activeShop);
        setSettings(readAutomationSettings(activeShop));
      })
      .catch((caught) => setError(caught instanceof Error ? caught.message : "Could not load automations"));
  }, []);

  async function toggle(key: AutomationKey) {
    if (!shop) return;
    const next = { ...settings, [key]: !settings[key] };
    setSettings(next);
    setError("");
    setSuccess("");
    setIsSaving(true);
    try {
      const updated = await updateShop(shop.id, {
        settings: {
          ...(shop.settings ?? {}),
          automations: next
        }
      });
      setShop(updated.shop);
      setSuccess("Automation setup saved.");
    } catch (caught) {
      setSettings(readAutomationSettings(shop));
      setError(caught instanceof Error ? caught.message : "Could not save automation");
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <AppShell active="Auto">
      <section className="px-5 py-6">
        <p className="text-sm font-semibold text-primary">Remember Every Customer Moment</p>
        <h1 className="mt-1 text-3xl font-bold">Automations</h1>
        <p className="mt-2 text-muted-foreground">Set up simple customer greetings. Festival campaigns always stay as drafts until you approve them.</p>
        <p className="mt-2 text-[14px] text-[#6B7280]">These send automatically when WhatsApp is connected and customer dates are saved.</p>

        {!enabledCount ? (
          <Card className="mt-4 p-4">
            <h2 className="font-semibold">No automation setup saved</h2>
            <p className="mt-2 text-sm text-muted-foreground">Set up birthday wishes so customers feel remembered.</p>
            <Button className="mt-4 w-full" onClick={() => void toggle("birthday")} disabled={isSaving || !shop}>Save Birthday Setup</Button>
          </Card>
        ) : null}

        {error ? <Card className="mt-4 border-destructive/30 bg-destructive/10 p-4 text-sm text-destructive">{error}</Card> : null}
        {success ? <Card className="mt-4 border-[#10B981]/30 bg-[#10B981]/10 p-4 text-sm text-[#047857]">{success}</Card> : null}

        <div className="mt-5 space-y-3">
          {automations.map((automation) => {
            const Icon = automation.icon;
            const enabled = settings[automation.key];
            return (
              <Card key={automation.key} className="p-4">
                <div className="flex items-start gap-3">
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                    <Icon className="h-5 w-5" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="font-semibold">{automation.title}</p>
                        <p className="mt-1 text-[13px] text-[#6B7280]">
                          {automation.key === "birthday" ? "Sends on the customer's birthday" :
                           automation.key === "anniversary" ? "Sends on the customer's anniversary" :
                           automation.key === "festival" ? "Creates a draft for your approval" :
                           "Sends when a new customer joins"}
                        </p>
                      </div>
                      <button
                        type="button"
                        disabled={isSaving || !shop}
                        onClick={() => void toggle(automation.key)}
                        className={`h-8 w-14 rounded-full p-1 transition-colors ${enabled ? "bg-primary" : "bg-muted"}`}
                        aria-label={`Save setup for ${automation.title}`}
                      >
                        <span className={`block h-6 w-6 rounded-full bg-white shadow-sm transition-transform ${enabled ? "translate-x-6" : "translate-x-0"}`} />
                      </button>
                    </div>
                    <div className="mt-3 space-y-1 text-sm text-muted-foreground">
                      <p>Trigger: {automation.trigger}</p>
                      <p>Send Time: {automation.sendTime}</p>
                      <p>Reward: Greeting Only</p>
                      <p>{automation.approval}</p>
                    </div>
                    <div 
                      className="mt-3 bg-white border border-[#E5E7EB] text-[14px] text-[#374151]"
                      style={{
                        borderRadius: "12px 12px 12px 0",
                        padding: "12px 16px",
                        lineHeight: 1.6
                      }}
                    >
                      {(() => {
                        const shopName = shop?.name ?? "your shop";
                        const replaced = automation.preview.replace(/{shop}/g, shopName);
                        const parts = replaced.split("{name}");
                        return parts.map((part, i) => (
                          <span key={i}>
                            {part}
                            {i < parts.length - 1 && (
                              <span className="italic text-[#6B7280] font-normal">[Customer Name]</span>
                            )}
                          </span>
                        ));
                      })()}
                    </div>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      </section>
    </AppShell>
  );
}
