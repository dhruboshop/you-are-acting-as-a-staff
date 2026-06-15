"use client";

import { CalendarHeart, MessageCircle, Send, Smartphone, Users } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { AppShell } from "@/components/app/app-shell";
import { StatCard } from "@/components/app/stat-card";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { getCustomers, getShops, getWhatsAppStatus, type Customer, type Shop, type WhatsAppConnectionStatus } from "@/lib/api";

function statusLabel(status: Shop["merchant_status"]) {
  if (status === "ACTIVE") return "Active";
  if (status === "EXPIRED") return "Trial expired";
  if (status === "BLOCKED") return "Blocked";
  return "Trial";
}

export default function DashboardPage() {
  const [shop, setShop] = useState<Shop | null>(null);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [totalCustomers, setTotalCustomers] = useState(0);
  const [whatsAppStatus, setWhatsAppStatus] = useState<WhatsAppConnectionStatus>("unknown");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    getShops()
      .then(async ({ shops }) => {
        if (!isMounted) return;
        const activeShop = shops[0] ?? null;
        setShop(activeShop);
        if (!activeShop?.id) return;
        localStorage.setItem("lp_active_shop_id", activeShop.id);
        const [customerResult, whatsAppResult] = await Promise.all([
          getCustomers({ shopId: activeShop.id, pageSize: 3 }),
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
  }, []);

  return (
    <AppShell active="Home">
      <section className="px-5 py-6">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-sm text-muted-foreground">Good morning</p>
            <h1 className="text-3xl font-bold">{shop?.name ?? "LoyaltyPilot"}</h1>
          </div>
          <div className="flex flex-col items-end gap-2">
            <div className={`rounded-full px-3 py-1 text-xs font-semibold ${whatsAppStatus === "connected" || whatsAppStatus === "open" ? "bg-[#DCF8C6] text-[#128C4A]" : "bg-amber-100 text-amber-700"}`}>
              {whatsAppStatus === "connected" || whatsAppStatus === "open" ? "WhatsApp connected" : "WhatsApp not connected"}
            </div>
            <div className="rounded-full bg-muted px-3 py-1 text-xs font-semibold text-muted-foreground">{statusLabel(shop?.merchant_status)}</div>
            <Link href="/logout" className="text-xs font-semibold text-muted-foreground underline">
              Logout
            </Link>
          </div>
        </div>
        {error ? (
          <Card className="mt-5 border-destructive/30 bg-destructive/10 p-4 text-sm text-destructive">
            <p>{error}</p>
            <Button asChild className="mt-3" size="sm" variant="secondary">
              <Link href="/login">Login again</Link>
            </Button>
          </Card>
        ) : null}
        {!isLoading && !shop ? (
          <Card className="mt-5 p-4 text-sm text-muted-foreground">
            No shop is connected to this account yet. Create your shop to generate a customer QR.
          </Card>
        ) : null}
        {shop?.merchant_status === "EXPIRED" || shop?.merchant_status === "BLOCKED" ? (
          <Card className="mt-5 border-destructive/30 bg-destructive/10 p-4 text-sm text-destructive">
            Campaign sending is paused for this shop. Customer QR and customer list still work.
          </Card>
        ) : null}
        <div className="mt-6 grid grid-cols-2 gap-3">
          <StatCard label="Total Customers" value={String(shop?.total_customers ?? totalCustomers)} icon={Users} />
          <StatCard label="New Customers" value={String(totalCustomers)} icon={Users} />
          <StatCard label="Birthdays Today" value="0" icon={CalendarHeart} />
          <StatCard label="Campaigns Sent" value={String(shop?.total_campaigns ?? 0)} icon={Send} />
        </div>
        <div className="mt-6 grid grid-cols-2 gap-3">
          {shop ? (
            <>
              <Button asChild>
                <Link href="/app/qr">Show QR</Link>
              </Button>
              <Button asChild variant="secondary">
                <Link href="/app/campaigns">Send Campaign</Link>
              </Button>
              <Button asChild variant="secondary">
                <Link href="/app/customers">Customers</Link>
              </Button>
              <Button asChild variant="secondary">
                <Link href="/onboarding/whatsapp">
                  <Smartphone className="h-5 w-5" />
                  WhatsApp
                </Link>
              </Button>
            </>
          ) : (
            <>
              <Button asChild>
                <Link href="/onboarding/shop">Create Shop</Link>
              </Button>
              <Button asChild variant="secondary">
                <Link href="/login">Login again</Link>
              </Button>
            </>
          )}
        </div>
        <h2 className="mt-8 text-lg font-semibold">Recent Customers</h2>
        <div className="mt-3 space-y-3">
          {customers.length === 0 ? (
            <Card className="p-4 text-sm text-muted-foreground">
              No customers yet. Share your QR code with the first customer to start collecting registrations.
            </Card>
          ) : null}
          {customers.map((customer) => (
            <Card key={customer.id} className="flex items-center gap-3 p-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-full bg-primary text-sm font-bold text-primary-foreground">
                {customer.name.slice(0, 2).toUpperCase()}
              </div>
              <div className="min-w-0 flex-1">
                <p className="font-semibold">{customer.name}</p>
                <p className="truncate text-sm text-muted-foreground">{customer.whatsapp_number}</p>
              </div>
              <MessageCircle className="h-5 w-5 text-[#25D366]" />
            </Card>
          ))}
        </div>
      </section>
    </AppShell>
  );
}
