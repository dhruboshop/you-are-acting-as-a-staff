import { env } from "./env";

export type MerchantShop = {
  id: string;
  name: string;
  phone?: string | null;
  address?: string | null;
  settings?: Record<string, unknown>;
  total_customers?: number;
  total_campaigns?: number;
  total_loyalty_members?: number;
};

export async function fetchMerchantShops(accessToken: string): Promise<MerchantShop[]> {
  const profileResponse = await fetch(`${env.apiBaseUrl}/api/auth/me`, {
    cache: "no-store",
    headers: { authorization: `Bearer ${accessToken}` }
  });

  if (!profileResponse.ok) {
    throw new Error("Unable to verify Google merchant profile");
  }

  const shopsResponse = await fetch(`${env.apiBaseUrl}/api/shops`, {
    cache: "no-store",
    headers: { authorization: `Bearer ${accessToken}` }
  });

  if (!shopsResponse.ok) {
    throw new Error("Unable to load merchant shops");
  }

  const body = (await shopsResponse.json()) as { shops?: MerchantShop[] };
  return body.shops ?? [];
}
