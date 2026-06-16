"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { AlertCircle, CheckCircle2, Loader2, RefreshCw, Smartphone, Unplug } from "lucide-react";
import { QRCodeSVG } from "qrcode.react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  connectWhatsApp,
  disconnectWhatsApp,
  getShops,
  getWhatsAppStatus,
  type WhatsAppConnection,
  type WhatsAppConnectionStatus
} from "@/lib/api";

const connectedStatuses: WhatsAppConnectionStatus[] = ["open", "connected"];
const terminalStatuses: WhatsAppConnectionStatus[] = ["deleted", "failed"];
const qrTextMaxLength = 2953;

function readableStatus(status: WhatsAppConnectionStatus) {
  switch (status) {
    case "open":
    case "connected":
      return "Connected";
    case "connecting":
      return "Waiting for WhatsApp";
    case "close":
      return "Connection closed";
    case "disconnected":
      return "Disconnected";
    case "deleted":
      return "Instance deleted";
    case "failed":
      return "Connection failed";
    case "unknown":
      return "Status unknown";
    default:
      return "Not connected";
  }
}

type QrRenderValue =
  | { kind: "image"; src: string }
  | { kind: "text"; value: string };

function normalizeImageSource(value: string) {
  const trimmed = value.trim();
  if (trimmed.startsWith("data:image/")) return trimmed;
  if (/^[A-Za-z0-9+/=]+$/.test(trimmed) && trimmed.length > 500) {
    return `data:image/png;base64,${trimmed}`;
  }
  return null;
}

function isPairingCode(value: string | null) {
  return Boolean(value && value.trim().length > 0 && value.trim().length <= 80);
}

function extractQrValue(value: unknown): QrRenderValue | null {
  if (typeof value === "string" && value.trim()) {
    const imageSource = normalizeImageSource(value);
    if (imageSource) return { kind: "image", src: imageSource };
    return value.length <= qrTextMaxLength ? { kind: "text", value } : null;
  }
  if (!value || typeof value !== "object" || Array.isArray(value)) return null;
  const object = value as Record<string, unknown>;
  const imageCandidates = [object.qrcode, object.qr, object.base64];
  for (const candidate of imageCandidates) {
    if (typeof candidate !== "string" || !candidate.trim()) continue;
    const imageSource = normalizeImageSource(candidate);
    if (imageSource) return { kind: "image", src: imageSource };
    if (candidate.length <= qrTextMaxLength) return { kind: "text", value: candidate };
  }
  const codeCandidates = [object.pairingCode, object.pairing_code, object.code];
  const code = codeCandidates.find((candidate): candidate is string => typeof candidate === "string" && isPairingCode(candidate));
  return code ? { kind: "text", value: code } : null;
}

function readRetryableEvolutionError(value: unknown) {
  if (!value || typeof value !== "object" || Array.isArray(value)) return null;
  const object = value as Record<string, unknown>;
  return object.available === false && typeof object.error === "string" ? object.error : null;
}

export default function WhatsAppConnectPage() {
  const router = useRouter();
  const pollTimerRef = useRef<number | null>(null);
  const [shopId, setShopId] = useState<string | null>(null);
  const [connection, setConnection] = useState<WhatsAppConnection | null>(null);
  const [status, setStatus] = useState<WhatsAppConnectionStatus>("not_connected");
  const [pairingCode, setPairingCode] = useState<string | null>(null);
  const [qrCode, setQrCode] = useState<unknown>(null);
  const [showQr, setShowQr] = useState(false);
  const [error, setError] = useState("");
  const [isLoadingShop, setIsLoadingShop] = useState(true);
  const [isConnecting, setIsConnecting] = useState(false);
  const [isDisconnecting, setIsDisconnecting] = useState(false);
  const [isPollingStatus, setIsPollingStatus] = useState(false);

  const isConnected = connectedStatuses.includes(status);
  const isPolling = isPollingStatus;
  const qrValue = useMemo(() => extractQrValue(qrCode), [qrCode]);
  const visiblePairingCode = isPairingCode(pairingCode) ? pairingCode : null;

  const stopPolling = useCallback(() => {
    if (pollTimerRef.current) {
      window.clearInterval(pollTimerRef.current);
      pollTimerRef.current = null;
    }
    setIsPollingStatus(false);
  }, []);

  const refreshStatus = useCallback(async (currentShopId: string) => {
    try {
      const result = await getWhatsAppStatus(currentShopId);
      setStatus(result.status);
      setConnection(result.connection);
      setError(readRetryableEvolutionError(result.evolution) ?? "");
      if (connectedStatuses.includes(result.status)) {
        stopPolling();
        window.setTimeout(() => router.replace("/app/dashboard"), 800);
      } else if (terminalStatuses.includes(result.status)) {
        stopPolling();
      }
      return result.status;
    } catch (caught) {
      const message = caught instanceof Error ? caught.message : "Could not refresh WhatsApp status";
      setError(message);
      throw new Error(message);
    }
  }, [router, stopPolling]);

  const startPolling = useCallback((currentShopId: string) => {
    stopPolling();
    setIsPollingStatus(true);
    pollTimerRef.current = window.setInterval(() => {
      refreshStatus(currentShopId).catch((caught) => {
        setError(caught instanceof Error ? caught.message : "Could not refresh WhatsApp status");
        stopPolling();
      });
    }, 5000);
  }, [refreshStatus, stopPolling]);

  useEffect(() => {
    let active = true;

    async function loadShopAndStatus() {
      setIsLoadingShop(true);
      setError("");
      try {
        let activeShopId = localStorage.getItem("lp_active_shop_id");
        if (!activeShopId) {
          const shops = (await getShops()).shops;
          activeShopId = shops[0]?.id ?? null;
        }
        if (!active || !activeShopId) {
          router.push("/onboarding/shop");
          return;
        }
        localStorage.setItem("lp_active_shop_id", activeShopId);
        setShopId(activeShopId);
        const currentStatus = await refreshStatus(activeShopId);
        if (currentStatus === "connecting") {
          startPolling(activeShopId);
        }
      } catch (caught) {
        if (active) {
          setError(caught instanceof Error ? caught.message : "Could not load WhatsApp connection");
        }
      } finally {
        if (active) {
          setIsLoadingShop(false);
        }
      }
    }

    loadShopAndStatus();
    return () => {
      active = false;
      stopPolling();
    };
  }, [refreshStatus, router, startPolling, stopPolling]);

  async function startConnection() {
    if (!shopId) {
      router.push("/onboarding/shop");
      return;
    }
    setError("");
    setIsConnecting(true);
    try {
      const result = await connectWhatsApp({ shopId });
      setConnection(result.connection);
      setStatus(result.connection.status);
      setPairingCode(isPairingCode(result.pairingCode) ? result.pairingCode : null);
      setQrCode(result.qrCode);
      setShowQr(Boolean(extractQrValue(result.qrCode)));
      setError(result.retryable && result.error ? result.error : "");
      startPolling(shopId);
    } catch (caught) {
      setStatus("failed");
      setError(caught instanceof Error ? caught.message : "Could not create WhatsApp pairing code");
    } finally {
      setIsConnecting(false);
    }
  }

  async function disconnectCurrentInstance() {
    if (!shopId) return;
    setError("");
    setIsDisconnecting(true);
    try {
      const result = await disconnectWhatsApp({ shopId });
      stopPolling();
      setConnection(result.connection);
      setStatus(result.status);
      setPairingCode(null);
      setQrCode(null);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Could not disconnect WhatsApp");
    } finally {
      setIsDisconnecting(false);
    }
  }

  return (
    <main className="mx-auto flex min-h-screen max-w-md flex-col bg-background px-5 py-6">
      <div className="h-1 rounded-full bg-muted">
        <div className="h-1 w-full rounded-full bg-primary" />
      </div>

      <div className="mt-8">
        <p className="text-sm font-medium text-primary">Step 3 of 3</p>
        <h1 className="mt-2 text-3xl font-bold">Connect WhatsApp</h1>
        <p className="mt-2 text-muted-foreground">Generate a pairing code, link WhatsApp, and continue when the connection is live.</p>
      </div>

      <Card className="mt-8 p-6">
        {isLoadingShop ? (
          <div className="flex min-h-64 flex-col items-center justify-center text-center">
            <Loader2 className="h-10 w-10 animate-spin text-primary" />
            <p className="mt-4 font-medium">Checking WhatsApp status</p>
          </div>
        ) : isConnected ? (
          <div className="flex min-h-64 flex-col items-center justify-center text-center">
            <CheckCircle2 className="h-20 w-20 text-[#10B981]" />
            <h2 className="mt-5 text-2xl font-bold">WhatsApp connected</h2>
            <p className="mt-2 text-sm text-muted-foreground">
              {connection?.phone_number ? `Connected number: ${connection.phone_number}` : "You can now collect customers and send campaigns."}
            </p>
          </div>
        ) : visiblePairingCode || qrValue ? (
          <div className="min-h-64 text-center">
            <div className="mb-5 flex items-center justify-center gap-2 text-sm font-medium text-muted-foreground">
              {isPolling ? <Loader2 className="h-4 w-4 animate-spin" /> : <Smartphone className="h-4 w-4" />}
              {readableStatus(status)}
            </div>
            {showQr && qrValue ? (
              <div className="flex justify-center">
                {qrValue.kind === "image" ? (
                  // Evolution returns a data URL/base64 QR image; Next Image cannot optimize this source.
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={qrValue.src} alt="WhatsApp pairing QR code" className="h-[216px] w-[216px] rounded-md object-contain" />
                ) : (
                  <QRCodeSVG value={qrValue.value} size={216} />
                )}
              </div>
            ) : (
              <>
                <p className="text-sm font-medium text-muted-foreground">Pairing Code</p>
                {visiblePairingCode ? (
                  <p className="mt-3 select-all break-words text-5xl font-bold tracking-widest">{visiblePairingCode}</p>
                ) : (
                  <p className="mt-3 text-sm text-muted-foreground">Use the QR code to connect WhatsApp.</p>
                )}
              </>
            )}
            <p className="mt-4 break-all text-xs text-muted-foreground">Instance: {connection?.instance_name ?? "pending"}</p>
          </div>
        ) : (
          <div className="flex min-h-64 flex-col items-center justify-center text-center">
            <Smartphone className="h-20 w-20 text-primary" />
            <h2 className="mt-5 text-2xl font-bold">Ready to pair</h2>
            <p className="mt-2 text-sm text-muted-foreground">Tap below to create a secure Evolution instance for this shop.</p>
          </div>
        )}
      </Card>

      {error ? (
        <div className="mt-4 flex gap-2 rounded-md border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive">
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
          <p>{error}</p>
        </div>
      ) : null}

      <div className="safe-bottom mt-auto space-y-3 pt-8">
        {isConnected ? (
          <>
            <Button className="w-full" size="lg" onClick={() => router.push("/app/dashboard")}>
              Continue to Dashboard
            </Button>
            <Button variant="secondary" className="w-full" onClick={disconnectCurrentInstance} disabled={isDisconnecting}>
              <Unplug className="h-5 w-5" />
              {isDisconnecting ? "Disconnecting..." : "Disconnect WhatsApp"}
            </Button>
          </>
        ) : (
          <>
            <Button className="w-full" size="lg" onClick={startConnection} disabled={isConnecting || isLoadingShop}>
              {isConnecting ? <Loader2 className="h-5 w-5 animate-spin" /> : <RefreshCw className="h-5 w-5" />}
              {visiblePairingCode || qrValue ? "Regenerate Pairing Code" : "Generate Pairing Code"}
            </Button>
            {qrValue ? (
              <Button variant="secondary" className="w-full" onClick={() => setShowQr((value) => !value)}>
                {showQr ? "Show Pairing Code" : "Show QR Code"}
              </Button>
            ) : null}
            {shopId ? (
              <Button
                variant="secondary"
                className="w-full"
                onClick={() => {
                  void refreshStatus(shopId).catch(() => undefined);
                }}
                disabled={isLoadingShop}
              >
                Check Status
              </Button>
            ) : null}
          </>
        )}
      </div>
    </main>
  );
}
