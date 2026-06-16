"use client";

import { CalendarHeart, HeartHandshake, QrCode, Search } from "lucide-react";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { AppShell } from "@/components/app/app-shell";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { getCustomers, getShops, type Customer } from "@/lib/api";

function formatDayMonth(value?: string | null) {
  if (!value) return "Not added";
  const [, month, day] = value.slice(0, 10).split("-").map(Number);
  if (!month || !day) return "Not added";
  return new Date(2000, month - 1, day).toLocaleDateString("en-IN", { day: "numeric", month: "long" });
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
            <p className="text-sm font-semibold text-primary">Remember every customer moment</p>
            <h1 className="mt-1 text-3xl font-bold">Customers</h1>
          </div>
          <span className="rounded-full bg-primary/10 px-3 py-1 text-sm font-semibold text-primary">{total}</span>
        </div>
        <p className="mt-2 text-muted-foreground">Names, WhatsApp numbers, birthdays, and anniversaries collected from your shop QR.</p>

        <div className="relative mt-5">
          <Search className="absolute left-3 top-3.5 h-5 w-5 text-muted-foreground" />
          <Input className="pl-10" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search by name or WhatsApp" />
        </div>

        {error ? <Card className="mt-4 border-destructive/30 bg-destructive/10 p-4 text-sm text-destructive">{error}</Card> : null}

        <div className="mt-5 space-y-3">
          {!error && visibleCustomers.length === 0 ? (
            <Card className="p-5">
              <QrCode className="h-9 w-9 text-primary" />
              <h2 className="mt-3 font-semibold">No customers yet</h2>
              <p className="mt-2 text-sm text-muted-foreground">Share your QR code at the counter to get started.</p>
              <Button asChild className="mt-4 w-full">
                <Link href="/app/qr">Open QR Code</Link>
              </Button>
            </Card>
          ) : null}

          {visibleCustomers.map((customer) => (
            <Card key={customer.id} className="p-4">
              <div className="flex items-start gap-3">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-primary/10 font-bold text-primary">
                  {customer.name.slice(0, 2).toUpperCase()}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="font-semibold">{customer.name}</p>
                  <p className="mt-1 text-sm text-muted-foreground">{customer.whatsapp_number}</p>
                  <div className="mt-4 space-y-2 text-sm">
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <CalendarHeart className="h-4 w-4 text-primary" />
                      <span>Birthday: {formatDayMonth(customer.birthday)}</span>
                    </div>
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <HeartHandshake className="h-4 w-4 text-primary" />
                      <span>Anniversary: {formatDayMonth(customer.anniversary)}</span>
                    </div>
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
