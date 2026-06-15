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
    throw new Error(body.error ?? body.message ?? "Request failed");
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
  const supabase = createBrowserSupabase();
  const session = supabase ? (await supabase.auth.getSession()).data.session : null;
  if (!supabase || !session) {
    throw new Error("Google session required");
  }

  const { data, error } = await supabase
    .from("shops")
    .select("id,name,phone,address,logo_url,settings,merchant_status,trial_ends_at")
    .is("deleted_at", null)
    .order("created_at", { ascending: false });

  if (error) {
    throw new Error(error.message);
  }

  return {
    shops: (data ?? []).map((shop) => ({
      ...shop,
      total_customers: 0,
      total_campaigns: 0,
      total_loyalty_members: 0
    })) as Shop[]
  };
}

export async function createShop(input: { name: string; phone?: string; address?: string; settings?: Record<string, unknown> }) {
  const supabase = createBrowserSupabase();
  const session = supabase ? (await supabase.auth.getSession()).data.session : null;
  if (!supabase || !session) {
    throw new Error("Google session required");
  }

  const { error: profileError } = await supabase.from("users").upsert({
    id: session.user.id,
    email: session.user.email ?? null,
    full_name: session.user.user_metadata?.full_name ?? session.user.user_metadata?.name ?? null,
    avatar_url: session.user.user_metadata?.avatar_url ?? null
  });

  if (profileError) {
    throw new Error(profileError.message);
  }

  const { data, error } = await supabase
    .from("shops")
    .insert({
      owner_user_id: session.user.id,
      name: input.name,
      phone: input.phone ?? null,
      address: input.address ?? null,
      settings: input.settings ?? {}
    })
    .select("id,name,phone,address,logo_url,settings,merchant_status,trial_ends_at")
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return { shop: { ...data, total_customers: 0, total_campaigns: 0, total_loyalty_members: 0 } as Shop };
}

export async function updateShop(id: string, input: { name?: string; phone?: string; address?: string; settings?: Record<string, unknown> }) {
  const supabase = createBrowserSupabase();
  const session = supabase ? (await supabase.auth.getSession()).data.session : null;
  if (!supabase || !session) {
    throw new Error("Google session required");
  }

  const { data, error } = await supabase
    .from("shops")
    .update(input)
    .eq("id", id)
    .eq("owner_user_id", session.user.id)
    .select("id,name,phone,address,logo_url,settings,merchant_status,trial_ends_at")
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return { shop: { ...data, total_customers: 0, total_campaigns: 0, total_loyalty_members: 0 } as Shop };
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
