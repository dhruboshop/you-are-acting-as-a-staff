"use client";

import { CalendarHeart, CheckCircle2, ClipboardList, Gift, HeartHandshake, MessageCircle, Printer, Smartphone, Users } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { AppShell } from "@/components/app/app-shell";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { getCustomers, getShops, getWhatsAppStatus, type Customer, type Shop, type WhatsAppConnectionStatus } from "@/lib/api";

function formatDayMonth(value?: string | null) {
  if (!value) return "";
  const [, month, day] = value.slice(0, 10).split("-").map(Number);
  if (!month || !day) return "";
  return new Date(2000, month - 1, day).toLocaleDateString("en-IN", { day: "numeric", month: "long" });
}

function upcomingInDays(customers: Customer[], field: "birthday" | "anniversary", daysAhead = 7) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const end = new Date(today);
  end.setDate(today.getDate() + daysAhead);
  return customers
    .filter((customer) => customer[field])
    .map((customer) => {
      const [, month, day] = String(customer[field]).slice(0, 10).split("-").map(Number);
      const date = new Date(today.getFullYear(), (month ?? 1) - 1, day ?? 1);
      if (date < today) date.setFullYear(today.getFullYear() + 1);
      return { customer, date };
    })
    .filter(({ date }) => date <= end)
    .sort((a, b) => a.date.getTime() - b.date.getTime())
    .slice(0, 5);
}

function SummaryCard({ label, value, icon: Icon }: { label: string; value: number; icon: typeof Users }) {
  return (
    <Card className="p-4">
      <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-2xl bg-primary/10 text-primary">
        <Icon className="h-5 w-5" />
      </div>
      <p className="text-2xl font-bold">{value}</p>
      <p className="mt-1 text-xs font-medium text-muted-foreground">{label}</p>
    </Card>
  );
}

function MomentList({ title, icon: Icon, items, field }: { title: string; icon: typeof CalendarHeart; items: ReturnType<typeof upcomingInDays>; field: "birthday" | "anniversary" }) {
  if (!items.length) return null;
  return (
    <Card className="p-4">
      <div className="flex items-center gap-2">
        <Icon className="h-5 w-5 text-primary" />
        <h2 className="font-semibold">{title}</h2>
      </div>
      <div className="mt-3 space-y-3">
        {items.map(({ customer }) => (
          <div key={customer.id} className="flex items-center justify-between gap-3 rounded-2xl bg-muted/60 p-3">
            <div>
              <p className="font-medium">{customer.name}</p>
              <p className="text-sm text-muted-foreground">{formatDayMonth(customer[field])}</p>
            </div>
            <Button asChild size="sm" variant="secondary">
              <Link href="/app/campaigns">Create Wish</Link>
            </Button>
          </div>
        ))}
      </div>
    </Card>
  );
}

export default function DashboardPage() {
  const router = useRouter();
  const [shop, setShop] = useState<Shop | null>(null);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [totalCustomers, setTotalCustomers] = useState(0);
  const [whatsAppStatus, setWhatsAppStatus] = useState<WhatsAppConnectionStatus>("unknown");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  async function logout() {
    await fetch("/logout", { method: "POST" });
    window.location.assign("/login");
  }

  useEffect(() => {
    let isMounted = true;
    getShops()
      .then(async ({ shops }) => {
        if (!isMounted) return;
        const activeShop = shops[0] ?? null;
        setShop(activeShop);
        if (!activeShop?.id) {
          router.replace("/onboarding/shop");
          return;
        }
        localStorage.setItem("lp_active_shop_id", activeShop.id);
        const [customerResult, whatsAppResult] = await Promise.all([
          getCustomers({ shopId: activeShop.id, pageSize: 100 }),
          getWhatsAppStatus(activeShop.id).catch(() => ({ status: "unknown" as WhatsAppConnectionStatus }))
        ]);
        if (!isMounted) return;
        setCustomers(customerResult.customers);
        setTotalCustomers(customerResult.total);
        setWhatsAppStatus(whatsAppResult.status);
      })
      .catch((caught) => {
        if (!isMounted) return;
        setError(caught instanceof Error ? caught.message : "Could not load dashboard");
      })
      .finally(() => {
        if (isMounted) setIsLoading(false);
      });
    return () => {
      isMounted = false;
    };
  }, [router]);

  const connected = whatsAppStatus === "connected" || whatsAppStatus === "open";
  const upcomingBirthdays = useMemo(() => upcomingInDays(customers, "birthday"), [customers]);
  const upcomingAnniversaries = useMemo(() => upcomingInDays(customers, "anniversary"), [customers]);
  const birthdayCount = customers.filter((customer) => Boolean(customer.birthday)).length;
  const anniversaryCount = customers.filter((customer) => Boolean(customer.anniversary)).length;
  const sentCampaignCount = Number(shop?.total_sent_campaigns ?? 0);
  const hasNextActions = upcomingBirthdays.length > 0 || upcomingAnniversaries.length > 0;
  const setupSteps = [
    { title: "Connect WhatsApp", done: connected, href: "/onboarding/whatsapp", text: "Connect WhatsApp to start sending wishes and offers." },
    { title: "Print Your QR", done: connected && totalCustomers > 0, href: "/app/qr", text: "Place the QR at your counter so customers can join." },
    { title: "Add Your First Customer", done: totalCustomers > 0, href: "/app/customers", text: "Ask one customer to scan the QR or add them manually." }
  ];

  return (
    <AppShell active="Home">
      <section className="px-5 py-6">
        <div className="rounded-3xl bg-primary p-5 text-primary-foreground shadow-sm">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-sm opacity-85">Never Forget A Customer Again.</p>
              <h1 className="mt-1 text-3xl font-bold">{shop?.name ?? "Zappy"}</h1>
              <p className="mt-2 max-w-72 text-sm opacity-85">Turn first-time customers into repeat customers with WhatsApp wishes and rewards.</p>
            </div>
            <button type="button" onClick={logout} className="text-xs font-semibold underline opacity-80">
              Logout
            </button>
          </div>
        </div>

        {error ? <Card className="mt-5 border-destructive/30 bg-destructive/10 p-4 text-sm text-destructive">{error}</Card> : null}
        {!isLoading && !shop ? <Card className="mt-5 p-4 text-sm text-muted-foreground">Taking you to shop setup...</Card> : null}

        <div className="mt-6">
          <h2 className="text-lg font-semibold">Next Actions</h2>
          <div className="mt-3 space-y-3">
            {!connected || totalCustomers === 0 ? (
              <Card className="p-4">
                <div className="space-y-3">
                  {setupSteps.map((step) => (
                    <div key={step.title} className="flex items-start gap-3 rounded-2xl bg-muted/60 p-3">
                      <CheckCircle2 className={`mt-0.5 h-5 w-5 ${step.done ? "text-[#10B981]" : "text-muted-foreground"}`} />
                      <div className="min-w-0 flex-1">
                        <p className="font-semibold">{step.title}</p>
                        <p className="mt-1 text-sm text-muted-foreground">{step.text}</p>
                      </div>
                      {!step.done ? (
                        <Button asChild size="sm" variant="secondary">
                          <Link href={step.href}>Open</Link>
                        </Button>
                      ) : null}
                    </div>
                  ))}
                </div>
              </Card>
            ) : null}
            <MomentList title="Upcoming Birthdays" icon={CalendarHeart} items={upcomingBirthdays} field="birthday" />
            <MomentList title="Upcoming Anniversaries" icon={HeartHandshake} items={upcomingAnniversaries} field="anniversary" />
            {!hasNextActions && connected && totalCustomers > 0 ? (
              <Card className="p-4 text-sm text-muted-foreground">Everything is set up. You will see upcoming birthdays, anniversaries, and festival reminders here as your customer list grows.</Card>
            ) : null}
          </div>
        </div>

        <Card className="mt-6 p-4">
          <div className="flex items-center gap-3">
            <Smartphone className={`h-6 w-6 ${connected ? "text-[#10B981]" : "text-amber-600"}`} />
            <div className="min-w-0 flex-1">
              <h2 className="font-semibold">WhatsApp Status</h2>
              <p className="mt-1 text-sm text-muted-foreground">{connected ? "Connected. Zappy can send approved wishes and offers." : "Disconnected. Reconnect before sending campaigns."}</p>
            </div>
            {!connected ? (
              <Button asChild size="sm">
                <Link href="/onboarding/whatsapp">Reconnect</Link>
              </Button>
            ) : null}
          </div>
        </Card>

        <h2 className="mt-6 text-lg font-semibold">Customer Summary</h2>
        <div className="mt-3 grid grid-cols-2 gap-3">
          <SummaryCard label="Total Customers" value={totalCustomers} icon={Users} />
          <SummaryCard label="Birthdays On Record" value={birthdayCount} icon={CalendarHeart} />
          <SummaryCard label="Anniversaries On Record" value={anniversaryCount} icon={HeartHandshake} />
          <SummaryCard label="Campaigns Sent" value={sentCampaignCount} icon={MessageCircle} />
          <SummaryCard label="Scheduled Campaigns" value={Number(shop?.total_scheduled_campaigns ?? 0)} icon={ClipboardList} />
        </div>

        <div className="mt-6 grid grid-cols-2 gap-3">
          <Button asChild>
            <Link href="/app/qr"><Printer className="h-4 w-4" />Print QR</Link>
          </Button>
          <Button asChild variant="secondary">
            <Link href="/app/campaigns"><Gift className="h-4 w-4" />Create Campaign</Link>
          </Button>
        </div>
      </section>
    </AppShell>
  );
}
