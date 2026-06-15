"use client";

import { useEffect, useMemo, useState } from "react";
import { Search } from "lucide-react";
import { AppShell } from "@/components/app/app-shell";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { getCustomers, getShops, type Customer } from "@/lib/api";

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
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold">Customers</h1>
          <span className="rounded-full bg-muted px-3 py-1 text-sm font-semibold">{total}</span>
        </div>
        <div className="relative mt-5">
          <Search className="absolute left-3 top-3.5 h-5 w-5 text-muted-foreground" />
          <Input className="pl-10" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search by name or number" />
        </div>
        {error ? <Card className="mt-4 border-destructive/30 bg-destructive/10 p-4 text-sm text-destructive">{error}</Card> : null}
        <div className="mt-4 flex gap-2 overflow-x-auto pb-1">
          {["All", "This Month", "Birthdays Soon", "Low Rating"].map((filter) => (
            <button key={filter} className="shrink-0 rounded-full border border-border bg-card px-3 py-2 text-sm">
              {filter}
            </button>
          ))}
        </div>
        <div className="mt-5 space-y-3">
          {!error && visibleCustomers.length === 0 ? (
            <Card className="p-4 text-sm text-muted-foreground">No customers yet. Ask a customer to scan your QR and register.</Card>
          ) : null}
          {visibleCustomers.map((customer) => (
            <Card key={customer.id} className="p-4">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="font-semibold">{customer.name}</p>
                  <p className="text-sm text-muted-foreground">{customer.whatsapp_number}</p>
                  <p className="mt-2 text-xs text-muted-foreground">Birthday {customer.birthday}</p>
                </div>
                <span className="rounded-full bg-accent/20 px-2 py-1 text-xs font-semibold">{customer.feedback_rating ?? "-"} ★</span>
              </div>
            </Card>
          ))}
        </div>
      </section>
    </AppShell>
  );
}
