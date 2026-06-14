import { getEvolutionConfig } from "../config/env.js";
import { HttpError } from "../utils/http.js";

type EvolutionResponse<T> = T & { error?: string; message?: string };

async function evolutionFetch<T>(path: string, init: RequestInit = {}): Promise<EvolutionResponse<T>> {
  const { apiUrl, apiKey } = getEvolutionConfig();
  const response = await fetch(`${apiUrl}${path}`, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      apikey: apiKey,
      ...(init.headers ?? {})
    }
  });
  const body = (await response.json().catch(() => ({}))) as EvolutionResponse<T>;
  if (!response.ok) throw new HttpError(response.status, body.message ?? "Evolution API request failed", body);
  return body;
}

export async function createInstance(instanceName: string) {
  return evolutionFetch<{ instance?: unknown; qrcode?: unknown }>("/instance/create", {
    method: "POST",
    body: JSON.stringify({ instanceName, qrcode: true, integration: "WHATSAPP-BAILEYS" })
  });
}

export async function disconnectInstance(instanceName: string) {
  return evolutionFetch(`/instance/logout/${encodeURIComponent(instanceName)}`, { method: "DELETE" });
}

export async function connectionState(instanceName: string) {
  return evolutionFetch<{ instance?: { state?: string } }>(`/instance/connectionState/${encodeURIComponent(instanceName)}`);
}

export async function sendText(instanceName: string, number: string, text: string) {
  return evolutionFetch(`/message/sendText/${encodeURIComponent(instanceName)}`, {
    method: "POST",
    body: JSON.stringify({ number, text })
  });
}
