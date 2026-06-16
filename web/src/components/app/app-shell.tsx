import Link from "next/link";
import { BarChart3, Bot, Megaphone, QrCode, Users } from "lucide-react";
import { cn } from "@/lib/utils";

const tabs = [
  { href: "/app/dashboard", label: "Home", icon: BarChart3 },
  { href: "/app/qr", label: "QR", icon: QrCode },
  { href: "/app/customers", label: "Customers", icon: Users },
  { href: "/app/campaigns", label: "Campaigns", icon: Megaphone },
  { href: "/app/automations", label: "Auto", icon: Bot }
];

export function AppShell({ active, children }: { active: string; children: React.ReactNode }) {
  return (
    <main className="mx-auto flex min-h-screen w-full max-w-md flex-col bg-background">
      <div className="flex-1 pb-24">{children}</div>
      <nav className="safe-bottom fixed inset-x-0 bottom-0 z-20 mx-auto max-w-md border-t border-border bg-card/95 backdrop-blur">
        <div className="grid h-16 grid-cols-5">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const selected = active === tab.label;
            return (
              <Link key={tab.href} href={tab.href} className={cn("flex flex-col items-center justify-center gap-1 text-xs", selected ? "text-primary" : "text-muted-foreground")}>
                <Icon className="h-5 w-5" />
                <span>{tab.label}</span>
              </Link>
            );
          })}
        </div>
      </nav>
    </main>
  );
}
