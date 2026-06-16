import Link from "next/link";
import { BarChart3, Bot, Megaphone, QrCode, Users, Clock } from "lucide-react";
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
            const isAutoTab = tab.href === "/app/automations";
            const selected = active === tab.label || (isAutoTab && (active === "Auto" || active === "Automations"));
            return (
              <Link 
                key={tab.href} 
                href={tab.href} 
                className={cn(
                  "flex h-full w-full flex-col items-center justify-center pt-2 pb-3 text-[11px] font-medium transition-colors", 
                  selected ? "text-primary font-semibold" : "text-muted-foreground"
                )}
              >
                {isAutoTab ? (
                  <>
                    <Bot className="h-5 w-5 nav-label-wide" />
                    <Clock className="h-5 w-5 nav-label-narrow" />
                    <span className="nav-label-wide">Automations</span>
                    <span className="nav-label-narrow">Auto</span>
                  </>
                ) : (
                  <>
                    <Icon className="h-5 w-5" />
                    <span>{tab.label}</span>
                  </>
                )}
              </Link>
            );
          })}
        </div>
      </nav>
    </main>
  );
}
