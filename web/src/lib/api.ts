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

export async function getShops() {
  return apiFetch<{ shops: Shop[] }>("/api/shops");
}

export async function createShop(input: { name: string; phone?: string; address?: string; settings?: Record<string, unknown> }) {
  return apiFetch<{ shop: Shop }>("/api/shops", { method: "POST", body: JSON.stringify(input) });
}
