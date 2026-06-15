"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle2, RefreshCw } from "lucide-react";
import { QRCodeSVG } from "qrcode.react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { connectWhatsApp, getShops } from "@/lib/api";

export default function WhatsAppConnectPage() {
  const router = useRouter();
  const [connected, setConnected] = useState(false);
  const [useQr, setUseQr] = useState(false);
  const [error, setError] = useState("");
  const [isConnecting, setIsConnecting] = useState(false);
  const [instanceName, setInstanceName] = useState("loyaltypilot");

  useEffect(() => {
    const activeShopId = localStorage.getItem("lp_active_shop_id");
    if (activeShopId) {
      setInstanceName(`lp_${activeShopId.replaceAll("-", "").slice(0, 18)}`);
    }
  }, []);

  async function startConnection() {
    setError("");
    setIsConnecting(true);
    try {
      let shopId = localStorage.getItem("lp_active_shop_id");
      if (!shopId) {
        const shops = (await getShops()).shops;
        shopId = shops[0]?.id ?? null;
      }
      if (!shopId) {
        router.push("/onboarding/shop");
        return;
      }
      await connectWhatsApp({ shopId, instanceName });
      localStorage.setItem("lp_active_shop_id", shopId);
      localStorage.setItem("lp_whatsapp_instance", instanceName);
      setConnected(true);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Could not connect WhatsApp");
    } finally {
      setIsConnecting(false);
    }
  }

  if (connected) {
    return (
      <main className="mx-auto flex min-h-screen max-w-md flex-col items-center justify-center bg-background px-5 text-center">
        <CheckCircle2 className="h-24 w-24 text-[#10B981]" />
        <h1 className="mt-6 text-3xl font-bold">WhatsApp connected</h1>
        <p className="mt-2 text-muted-foreground">You can now collect customers and send campaigns.</p>
        <Button className="mt-8 w-full" size="lg" onClick={() => router.push("/app/dashboard")}>
          Continue to Dashboard
        </Button>
      </main>
    );
  }

  return (
    <main className="mx-auto flex min-h-screen max-w-md flex-col bg-background px-5 py-6">
      <div className="h-1 rounded-full bg-muted">
        <div className="h-1 w-full rounded-full bg-primary" />
      </div>
      <div className="mt-8">
        <p className="text-sm font-medium text-primary">Step 3 of 3</p>
        <h1 className="mt-2 text-3xl font-bold">Connect WhatsApp</h1>
        <p className="mt-2 text-muted-foreground">Pairing code is fastest. QR is available if you prefer scanning.</p>
      </div>
      <Card className="mt-8 p-6 text-center">
        {useQr ? (
          <div className="flex justify-center">
            <QRCodeSVG value={`evolution://${instanceName}`} size={216} />
          </div>
        ) : (
          <>
            <p className="text-sm font-medium text-muted-foreground">Pairing Code</p>
            <p className="mt-3 select-all text-5xl font-bold tracking-widest">482-913</p>
            <p className="mt-3 text-xs text-muted-foreground">Instance: {instanceName}</p>
          </>
        )}
      </Card>
      <div className="safe-bottom mt-auto space-y-3 pt-8">
        {error ? <p className="text-sm text-destructive">{error}</p> : null}
        <Button className="w-full" size="lg" onClick={startConnection} disabled={isConnecting}>
          <RefreshCw className="h-5 w-5" />
          {isConnecting ? "Creating instance..." : "Create WhatsApp Instance"}
        </Button>
        <Button variant="secondary" className="w-full" onClick={() => setUseQr((value) => !value)}>
          {useQr ? "Use Pairing Code" : "Use QR Instead"}
        </Button>
      </div>
    </main>
  );
}
