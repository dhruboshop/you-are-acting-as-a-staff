"use client";

import { Bot, CalendarHeart, Gift, RefreshCw, Sparkles } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { AppShell } from "@/components/app/app-shell";
import { Card } from "@/components/ui/card";
import { getShops, updateShop, type Shop } from "@/lib/api";

type AutomationKey = "birthday" | "anniversary" | "festival" | "winback";

const automations: Array<{ key: AutomationKey; title: string; description: string; icon: typeof Bot }> = [
  { key: "birthday", title: "Birthday Automation", description: "Send birthday wishes when WhatsApp is connected.", icon: CalendarHeart },
  { key: "anniversary", title: "Anniversary Automation", description: "Greet couples and families on important dates.", icon: Sparkles },
  { key: "festival", title: "Festival Reminder Automation", description: "Prepare approval-first drafts before festivals.", icon: Gift },
  { key: "winback", title: "Win Back Automation", description: "Remind inactive customers to visit again.", icon: RefreshCw }
];

function readAutomationSettings(shop: Shop | null): Record<AutomationKey, boolean> {
  const settings = shop?.settings ?? {};
  const automationSettings = typeof settings.automations === "object" && settings.automations ? settings.automations as Partial<Record<AutomationKey, boolean>> : {};
  return {
    birthday: automationSettings.birthday ?? false,
    anniversary: automationSettings.anniversary ?? false,
    festival: automationSettings.festival ?? false,
    winback: automationSettings.winback ?? false
  };
}

export default function AutomationsPage() {
  const [shop, setShop] = useState<Shop | null>(null);
  const [settings, setSettings] = useState<Record<AutomationKey, boolean>>({ birthday: false, anniversary: false, festival: false, winback: false });
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
      setSuccess("Automation settings saved.");
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
        <p className="text-sm font-semibold text-primary">Zappy assistant</p>
        <h1 className="mt-1 text-3xl font-bold">Automations</h1>
        <p className="mt-2 text-muted-foreground">Simple reminders that stay safe when WhatsApp, Groq, or Render is unavailable.</p>
        <Card className="mt-5 bg-primary p-5 text-primary-foreground">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/15">
              <Bot className="h-6 w-6" />
            </div>
            <div>
              <p className="text-2xl font-bold">{enabledCount}/4 active</p>
              <p className="text-sm opacity-85">No background workers. Zappy saves your choices and degrades safely.</p>
            </div>
          </div>
        </Card>
        {error ? <Card className="mt-4 border-destructive/30 bg-destructive/10 p-4 text-sm text-destructive">{error}</Card> : null}
        {success ? <Card className="mt-4 border-[#10B981]/30 bg-[#10B981]/10 p-4 text-sm text-[#047857]">{success}</Card> : null}
        <div className="mt-5 space-y-3">
          {automations.map((automation) => {
            const Icon = automation.icon;
            const enabled = settings[automation.key];
            return (
              <Card key={automation.key} className="p-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                    <Icon className="h-5 w-5" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="font-semibold">{automation.title}</p>
                    <p className="mt-1 text-sm text-muted-foreground">{automation.description}</p>
                  </div>
                  <button
                    type="button"
                    disabled={isSaving || !shop}
                    onClick={() => void toggle(automation.key)}
                    className={`h-8 w-14 rounded-full p-1 transition-colors ${enabled ? "bg-primary" : "bg-muted"}`}
                    aria-label={`Toggle ${automation.title}`}
                  >
                    <span className={`block h-6 w-6 rounded-full bg-white shadow-sm transition-transform ${enabled ? "translate-x-6" : "translate-x-0"}`} />
                  </button>
                </div>
              </Card>
            );
          })}
        </div>
      </section>
    </AppShell>
  );
}
