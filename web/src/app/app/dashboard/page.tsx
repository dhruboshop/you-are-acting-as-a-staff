"use client";

import { AlertTriangle, CalendarHeart, Gift, MessageCircle, Send, Smartphone, Sparkles, Users } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { AppShell } from "@/components/app/app-shell";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { getCustomers, getShops, getWhatsAppStatus, type Customer, type Shop, type WhatsAppConnectionStatus } from "@/lib/api";

function statusLabel(status: Shop["merchant_status"]) {
  if (status === "ACTIVE") return "Active";
  if (status === "EXPIRED") return "Trial expired";
  if (status === "BLOCKED") return "Blocked";
  return "Trial";
}

function monthDay(value?: string | null) {
  if (!value) return "";
  return value.slice(5, 10);
}

function isToday(value?: string | null) {
  return monthDay(value) === new Date().toISOString().slice(5, 10);
}

function upcoming(customers: Customer[], field: "birthday" | "anniversary") {
  const today = new Date();
  const currentYear = today.getFullYear();
  return customers
    .filter((customer) => customer[field])
    .map((customer) => {
      const [, month, day] = String(customer[field]).slice(0, 10).split("-").map(Number);
      const date = new Date(currentYear, (month ?? 1) - 1, day ?? 1);
      if (date < today) date.setFullYear(currentYear + 1);
      return { customer, date };
    })
    .sort((a, b) => a.date.getTime() - b.date.getTime())
    .slice(0, 3);
}

function MetricCard({ label, value, icon: Icon, tone = "default" }: { label: string; value: string; icon: typeof Users; tone?: "default" | "warn" | "good" }) {
  const colors = tone === "warn" ? "bg-amber-50 text-amber-700" : tone === "good" ? "bg-emerald-50 text-emerald-700" : "bg-primary/10 text-primary";
  return (
    <Card className="p-4">
      <div className={`mb-3 flex h-10 w-10 items-center justify-center rounded-2xl ${colors}`}>
        <Icon className="h-5 w-5" />
      </div>
      <p className="text-2xl font-bold">{value}</p>
      <p className="mt-1 text-xs font-medium text-muted-foreground">{label}</p>
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
          getCustomers({ shopId: activeShop.id, pageSize: 50 }),
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
  const birthdaysToday = customers.filter((customer) => isToday(customer.birthday));
  const anniversariesToday = customers.filter((customer) => isToday(customer.anniversary));
  const upcomingBirthdays = useMemo(() => upcoming(customers, "birthday"), [customers]);
  const upcomingAnniversaries = useMemo(() => upcoming(customers, "anniversary"), [customers]);
  const rewardsGiven = customers.reduce((sum, customer) => sum + Number(customer.loyalty_points ?? 0), 0);
  const needsAttention = [!connected, shop?.merchant_status === "EXPIRED" || shop?.merchant_status === "BLOCKED"].filter(Boolean).length;

  return (
    <AppShell active="Home">
      <section className="px-5 py-6">
        <div className="rounded-3xl bg-primary p-5 text-primary-foreground shadow-sm">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-sm opacity-85">Good morning</p>
              <h1 className="mt-1 text-3xl font-bold">{shop?.name ?? "Zappy"}</h1>
              <p className="mt-2 max-w-64 text-sm opacity-85">Keep customers coming back with WhatsApp wishes, rewards, and reminders.</p>
            </div>
            <button type="button" onClick={logout} className="text-xs font-semibold underline opacity-80">
              Logout
            </button>
          </div>
          <div className="mt-4 flex flex-wrap gap-2">
            <span className="rounded-full bg-white/15 px-3 py-1 text-xs font-semibold">{statusLabel(shop?.merchant_status)}</span>
            <span className={`rounded-full px-3 py-1 text-xs font-semibold ${connected ? "bg-[#DCF8C6] text-[#128C4A]" : "bg-amber-100 text-amber-800"}`}>
              {connected ? "WhatsApp connected" : "WhatsApp needs reconnect"}
            </span>
          </div>
        </div>

        {error ? <Card className="mt-5 border-destructive/30 bg-destructive/10 p-4 text-sm text-destructive">{error}</Card> : null}
        {!isLoading && !shop ? <Card className="mt-5 p-4 text-sm text-muted-foreground">Taking you to shop setup...</Card> : null}
        {!connected && shop ? (
          <Card className="mt-5 border-amber-200 bg-amber-50 p-4">
            <div className="flex gap-3">
              <Smartphone className="h-6 w-6 text-amber-700" />
              <div className="min-w-0 flex-1">
                <h2 className="font-semibold text-amber-950">Reconnect WhatsApp</h2>
                <p className="mt-1 text-sm text-amber-800">Campaigns pause safely until your shop WhatsApp is connected again.</p>
                <Button asChild className="mt-3 w-full">
                  <Link href="/onboarding/whatsapp">Reconnect WhatsApp</Link>
                </Button>
              </div>
            </div>
          </Card>
        ) : null}

        <h2 className="mt-6 text-lg font-semibold">Today&apos;s Activity</h2>
        <div className="mt-3 grid grid-cols-2 gap-3">
          <MetricCard label="Birthdays Today" value={String(birthdaysToday.length)} icon={CalendarHeart} tone="good" />
          <MetricCard label="Anniversaries Today" value={String(anniversariesToday.length)} icon={Sparkles} tone="good" />
          <MetricCard label="Total Customers" value={String(totalCustomers)} icon={Users} />
          <MetricCard label="Messages Sent" value={String(shop?.total_campaigns ?? 0)} icon={Send} />
          <MetricCard label="Rewards Given" value={String(rewardsGiven)} icon={Gift} />
          <MetricCard label="Needs Attention" value={String(needsAttention)} icon={AlertTriangle} tone={needsAttention ? "warn" : "good"} />
        </div>

        <div className="mt-6 grid grid-cols-2 gap-3">
          <Button asChild>
            <Link href="/app/campaigns">Send Campaign</Link>
          </Button>
          <Button asChild variant="secondary">
            <Link href="/app/qr">Show QR</Link>
          </Button>
          <Button asChild variant="secondary">
            <Link href="/app/customers">Customers</Link>
          </Button>
          <Button asChild variant="secondary">
            <Link href="/app/automations">Automations</Link>
          </Button>
        </div>

        <h2 className="mt-8 text-lg font-semibold">Recent Activity</h2>
        <div className="mt-3 space-y-3">
          {customers.slice(0, 3).map((customer) => (
            <Card key={customer.id} className="flex items-center gap-3 p-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-primary/10 text-sm font-bold text-primary">
                {customer.name.slice(0, 2).toUpperCase()}
              </div>
              <div className="min-w-0 flex-1">
                <p className="font-semibold">{customer.name}</p>
                <p className="truncate text-sm text-muted-foreground">Joined Zappy rewards</p>
              </div>
              <MessageCircle className="h-5 w-5 text-[#25D366]" />
            </Card>
          ))}
          {customers.length === 0 ? <Card className="p-4 text-sm text-muted-foreground">No customers yet. Share your QR code to start collecting registrations.</Card> : null}
        </div>

        <div className="mt-6 grid gap-3">
          <Card className="p-4">
            <h2 className="font-semibold">Upcoming Birthdays</h2>
            <div className="mt-3 space-y-2">
              {upcomingBirthdays.map(({ customer, date }) => (
                <p key={customer.id} className="text-sm text-muted-foreground">{customer.name} · {date.toLocaleDateString()}</p>
              ))}
              {upcomingBirthdays.length === 0 ? <p className="text-sm text-muted-foreground">No birthdays captured yet.</p> : null}
            </div>
          </Card>
          <Card className="p-4">
            <h2 className="font-semibold">Upcoming Anniversaries</h2>
            <div className="mt-3 space-y-2">
              {upcomingAnniversaries.map(({ customer, date }) => (
                <p key={customer.id} className="text-sm text-muted-foreground">{customer.name} · {date.toLocaleDateString()}</p>
              ))}
              {upcomingAnniversaries.length === 0 ? <p className="text-sm text-muted-foreground">No anniversaries captured yet.</p> : null}
            </div>
          </Card>
          <Card className="p-4">
            <h2 className="font-semibold">Campaign Drafts Ready</h2>
            <p className="mt-2 text-sm text-muted-foreground">Birthday, anniversary, festival, and win-back templates are ready to approve.</p>
          </Card>
        </div>
      </section>
    </AppShell>
  );
}
