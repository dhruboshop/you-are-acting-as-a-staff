import type { Session } from "@supabase/supabase-js";
import { env } from "./env";

export type ServerOnboardingStatus = {
  shop: { id: string; name: string } | null;
  whatsapp: { status: string; connected: boolean };
  nextRoute: "/onboarding/shop" | "/onboarding/whatsapp" | "/app/dashboard";
  onboardingComplete: boolean;
};

export async function fetchServerOnboardingStatus(session: Session): Promise<ServerOnboardingStatus> {
  if (!env.apiBaseUrl) {
    throw new Error("NEXT_PUBLIC_API_BASE_URL is required");
  }
  const requestUrl = `${env.apiBaseUrl}/api/auth/onboarding`;
  const response = await fetch(requestUrl, {
    headers: {
      authorization: `Bearer ${session.access_token}`
    },
    cache: "no-store"
  });
  const body = await response.json().catch(() => ({}));
  if (!response.ok) {
    console.error("Onboarding status request failed", {
      requestUrl,
      status: response.status,
      body
    });
    throw new Error(body.error ?? body.message ?? `Onboarding request failed with status ${response.status}`);
  }
  return body as ServerOnboardingStatus;
}
