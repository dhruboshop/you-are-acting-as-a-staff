"use client";

import { env } from "./env";
import { createBrowserSupabase } from "./supabase";

export async function apiFetch<T>(path: string, init: RequestInit = {}): Promise<T> {
  const supabase = createBrowserSupabase();
  const session = supabase ? (await supabase.auth.getSession()).data.session : null;
  const response = await fetch(`${env.apiBaseUrl}${path}`, {
    ...init,
    headers: {
      "content-type": "application/json",
      ...(session?.access_token ? { authorization: `Bearer ${session.access_token}` } : {}),
      ...(init.headers ?? {})
    }
  });
  const body = await response.json().catch(() => ({}));
  if (!response.ok) {
    const message = body.error ?? body.message ?? "Request failed";
    if (response.status === 401 && typeof message === "string" && message.toLowerCase().includes("token")) {
      await supabase?.auth.signOut();
      if (typeof window !== "undefined") {
        window.location.href = "/login?error=session_expired";
      }
    }
    throw new Error(message);
  }
  return body as T;
}

export type Shop = {
  id: string;
  name: string;
  phone?: string;
  address?: string;
  logo_url?: string;
  settings?: Record<string, unknown>;
  merchant_status?: "TRIAL" | "ACTIVE" | "EXPIRED" | "BLOCKED";
  trial_ends_at?: string | null;
  total_customers?: number;
  total_campaigns?: number;
  total_loyalty_members?: number;
};

export type Customer = {
  id: string;
  shop_id: string;
  name: string;
  whatsapp_number: string;
  birthday?: string | null;
  anniversary?: string | null;
  feedback_rating?: number | null;
  feedback_text?: string | null;
  created_at: string;
};

export type WhatsAppConnectionStatus =
  | "not_connected"
  | "connecting"
  | "connected"
  | "open"
  | "close"
  | "disconnected"
  | "deleted"
  | "failed"
  | "unknown";

export type WhatsAppConnection = {
  id: string;
  shop_id: string;
  instance_name: string;
  phone_number: string | null;
  status: WhatsAppConnectionStatus;
  connected_at: string | null;
  created_at: string;
  updated_at: string;
};

export async function getShops() {
  return apiFetch<{ shops: Shop[] }>("/api/shops");
}

export async function createShop(input: { name: string; phone?: string; address?: string; settings?: Record<string, unknown> }) {
  return apiFetch<{ shop: Shop }>("/api/shops", {
    method: "POST",
    body: JSON.stringify(input)
  });
}

export async function updateShop(id: string, input: { name?: string; phone?: string; address?: string; settings?: Record<string, unknown> }) {
  return apiFetch<{ shop: Shop }>(`/api/shops/${encodeURIComponent(id)}`, {
    method: "PATCH",
    body: JSON.stringify(input)
  });
}

export async function getCustomers(input: { shopId: string; search?: string; page?: number; pageSize?: number }) {
  const params = new URLSearchParams({
    page: String(input.page ?? 1),
    pageSize: String(input.pageSize ?? 20)
  });
  if (input.search) params.set("search", input.search);
  return apiFetch<{ customers: Customer[]; page: number; pageSize: number; total: number }>(
    `/api/customers/shops/${encodeURIComponent(input.shopId)}?${params.toString()}`
  );
}

export async function connectWhatsApp(input: { shopId: string }) {
  return apiFetch<{
    connection: WhatsAppConnection;
    pairingCode: string | null;
    qrCode: unknown;
    evolution: unknown;
  }>("/api/whatsapp/connect", {
    method: "POST",
    body: JSON.stringify(input)
  });
}

export async function getWhatsAppStatus(shopId: string) {
  return apiFetch<{
    status: WhatsAppConnectionStatus;
    connection: WhatsAppConnection | null;
    evolution?: unknown;
  }>(`/api/whatsapp/status?shopId=${encodeURIComponent(shopId)}`);
}

export async function disconnectWhatsApp(input: { shopId: string; deleteInstance?: boolean }) {
  return apiFetch<{
    status: WhatsAppConnectionStatus;
    connection: WhatsAppConnection;
  }>("/api/whatsapp/disconnect", {
    method: "POST",
    body: JSON.stringify(input)
  });
}
