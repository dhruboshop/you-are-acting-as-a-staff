"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle2, RefreshCw } from "lucide-react";
import { QRCodeSVG } from "qrcode.react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

export default function WhatsAppConnectPage() {
  const router = useRouter();
  const [connected, setConnected] = useState(false);
  const [useQr, setUseQr] = useState(false);

  useEffect(() => {
    localStorage.setItem("lp_whatsapp_instance", "demo_instance_001");
  }, []);

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
            <QRCodeSVG value="evolution://demo_instance_001" size={216} />
          </div>
        ) : (
          <>
            <p className="text-sm font-medium text-muted-foreground">Pairing Code</p>
            <p className="mt-3 select-all text-5xl font-bold tracking-widest">482-913</p>
          </>
        )}
      </Card>
      <div className="safe-bottom mt-auto space-y-3 pt-8">
        <Button className="w-full" size="lg" onClick={() => setConnected(true)}>
          <RefreshCw className="h-5 w-5" />
          I have connected
        </Button>
        <Button variant="secondary" className="w-full" onClick={() => setUseQr((value) => !value)}>
          {useQr ? "Use Pairing Code" : "Use QR Instead"}
        </Button>
      </div>
    </main>
  );
}
