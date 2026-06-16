"use client";

import { Gift, MessageCircle, Search, Star } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { AppShell } from "@/components/app/app-shell";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { getCustomers, getShops, type Customer } from "@/lib/api";

function prettyDate(value?: string | null) {
  if (!value) return "Not added";
  return new Date(value).toLocaleDateString(undefined, { day: "numeric", month: "short" });
}

function daysUntilMonthDay(value?: string | null) {
  if (!value) return null;
  const today = new Date();
  const [, month, day] = value.slice(0, 10).split("-").map(Number);
  const target = new Date(today.getFullYear(), (month ?? 1) - 1, day ?? 1);
  if (target < today) target.setFullYear(today.getFullYear() + 1);
  return Math.ceil((target.getTime() - today.getTime()) / 86_400_000);
}

function tagsFor(customer: Customer) {
  const points = Number(customer.loyalty_points ?? 0);
  const birthdaySoon = Number(daysUntilMonthDay(customer.birthday) ?? 999) <= 14;
  const createdAt = new Date(customer.created_at).getTime();
  const isNew = Date.now() - createdAt < 14 * 86_400_000;
  return [
    points >= 100 ? "VIP" : null,
    isNew ? "New" : null,
    birthdaySoon ? "Birthday Soon" : null,
    points === 0 && !isNew ? "Inactive" : null
  ].filter(Boolean) as string[];
}

export default function CustomersPage() {
  const [query, setQuery] = useState("");
  const [shopId, setShopId] = useState("");
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [total, setTotal] = useState(0);
  const [error, setError] = useState("");
  const visibleCustomers = useMemo(() => customers, [customers]);

  useEffect(() => {
    getShops()
      .then(({ shops }) => {
        const activeShopId = shops[0]?.id ?? "";
        setShopId(activeShopId);
      })
      .catch((caught) => setError(caught instanceof Error ? caught.message : "Could not load shop"));
  }, []);

  useEffect(() => {
    if (!shopId) return;
    const timer = window.setTimeout(() => {
      getCustomers({ shopId, search: query, pageSize: 50 })
        .then((result) => {
          setCustomers(result.customers);
          setTotal(result.total);
          setError("");
        })
        .catch((caught) => setError(caught instanceof Error ? caught.message : "Could not load customers"));
    }, 250);
    return () => window.clearTimeout(timer);
  }, [query, shopId]);

  return (
    <AppShell active="Customers">
      <section className="px-5 py-6">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-sm font-semibold text-primary">Zappy customers</p>
            <h1 className="mt-1 text-3xl font-bold">Customers</h1>
          </div>
          <span className="rounded-full bg-primary/10 px-3 py-1 text-sm font-semibold text-primary">{total}</span>
        </div>
        <div className="relative mt-5">
          <Search className="absolute left-3 top-3.5 h-5 w-5 text-muted-foreground" />
          <Input className="pl-10" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search by name or WhatsApp" />
        </div>
        {error ? <Card className="mt-4 border-destructive/30 bg-destructive/10 p-4 text-sm text-destructive">{error}</Card> : null}
        <div className="mt-4 flex gap-2 overflow-x-auto pb-1">
          {["All", "VIP", "Birthday Soon", "New", "Inactive"].map((filter) => (
            <button key={filter} className="shrink-0 rounded-full border border-border bg-card px-3 py-2 text-sm">
              {filter}
            </button>
          ))}
        </div>
        <div className="mt-5 space-y-3">
          {!error && visibleCustomers.length === 0 ? (
            <Card className="p-4 text-sm text-muted-foreground">No customers yet. Ask a customer to scan your QR and join Zappy rewards.</Card>
          ) : null}
          {visibleCustomers.map((customer) => (
            <Card key={customer.id} className="p-4">
              <div className="flex items-start gap-3">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-primary/10 font-bold text-primary">
                  {customer.name.slice(0, 2).toUpperCase()}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <p className="font-semibold">{customer.name}</p>
                      <p className="text-sm text-muted-foreground">{customer.whatsapp_number}</p>
                    </div>
                    <span className="rounded-full bg-accent/20 px-2 py-1 text-xs font-semibold">
                      {customer.loyalty_points ?? 0} pts
                    </span>
                  </div>
                  <div className="mt-3 grid grid-cols-2 gap-2 text-xs text-muted-foreground">
                    <span>Birthday: {prettyDate(customer.birthday)}</span>
                    <span>Anniversary: {prettyDate(customer.anniversary)}</span>
                    <span>Last visit: {prettyDate(customer.created_at)}</span>
                    <span>Feedback: {customer.feedback_rating ?? "-"} star</span>
                  </div>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {tagsFor(customer).map((tag) => (
                      <span key={tag} className="rounded-full bg-muted px-2 py-1 text-xs font-semibold text-muted-foreground">{tag}</span>
                    ))}
                  </div>
                  <div className="mt-4 grid grid-cols-3 gap-2">
                    <Button size="sm" variant="secondary"><MessageCircle className="h-4 w-4" />Message</Button>
                    <Button size="sm" variant="secondary"><Gift className="h-4 w-4" />Reward</Button>
                    <Button size="sm" variant="secondary"><Star className="h-4 w-4" />Details</Button>
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </section>
    </AppShell>
  );
}
