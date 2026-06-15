import { CalendarHeart, CheckCircle2, Clock, MessageCircle, Send, Users, XCircle } from "lucide-react";
import Link from "next/link";
import { AppShell } from "@/components/app/app-shell";
import { StatCard } from "@/components/app/stat-card";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { demoCustomers, demoShop } from "@/lib/demo-data";

export default function DashboardPage() {
  return (
    <AppShell active="Home">
      <section className="px-5 py-6">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-sm text-muted-foreground">Good morning</p>
            <h1 className="text-3xl font-bold">{demoShop.name}</h1>
          </div>
          <div className="rounded-full bg-[#DCF8C6] px-3 py-1 text-xs font-semibold text-[#128C4A]">WhatsApp open</div>
        </div>
        <div className="mt-6 grid grid-cols-2 gap-3">
          <StatCard label="Total Customers" value="248" icon={Users} />
          <StatCard label="New Customers" value="12" icon={CheckCircle2} />
          <StatCard label="Birthdays Today" value="3" icon={CalendarHeart} />
          <StatCard label="Campaigns Sent" value="34" icon={Send} />
          <StatCard label="Messages Queued" value="18" icon={Clock} />
          <StatCard label="Messages Failed" value="2" icon={XCircle} />
        </div>
        <div className="mt-6 grid grid-cols-2 gap-3">
          <Button asChild>
            <Link href="/app/qr">Show QR</Link>
          </Button>
          <Button asChild variant="secondary">
            <Link href="/app/campaigns">Send Campaign</Link>
          </Button>
          <Button asChild variant="secondary">
            <Link href="/app/customers">Customers</Link>
          </Button>
          <Button variant="secondary">Add Customer</Button>
        </div>
        <h2 className="mt-8 text-lg font-semibold">Recent Customers</h2>
        <div className="mt-3 space-y-3">
          {demoCustomers.map((customer) => (
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
