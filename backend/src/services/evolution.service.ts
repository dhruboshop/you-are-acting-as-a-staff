import { getEvolutionConfig } from "../config/env.js";
import { HttpError } from "../utils/http.js";

export type EvolutionConnectionStatus =
  | "not_connected"
  | "connecting"
  | "connected"
  | "open"
  | "close"
  | "disconnected"
  | "deleted"
  | "failed"
  | "unknown";

type JsonObject = Record<string, unknown>;
const evolutionTimeoutMs = 15_000;
const maxTransientAttempts = 2;

export interface EvolutionInstanceResult {
  instanceName: string;
  raw: JsonObject;
}

export interface EvolutionPairingCodeResult {
  instanceName: string;
  pairingCode?: string;
  qrCode?: unknown;
  raw: JsonObject;
}

export interface EvolutionConnectionStatusResult {
  instanceName: string;
  status: EvolutionConnectionStatus;
  phoneNumber?: string;
  raw: JsonObject;
}

function createInstanceName(shopId: string) {
  return `shop_${shopId.replaceAll("-", "_")}`;
}

function toObject(value: unknown): JsonObject {
  return value && typeof value === "object" && !Array.isArray(value) ? (value as JsonObject) : {};
}

function readNestedString(source: JsonObject, path: string[]) {
  let current: unknown = source;
  for (const key of path) {
    const object = toObject(current);
    current = object[key];
  }
  return typeof current === "string" && current.trim().length > 0 ? current.trim() : undefined;
}

function normalizeStatus(value: string | undefined): EvolutionConnectionStatus {
  switch (value?.toLowerCase()) {
    case "open":
      return "open";
    case "connected":
      return "connected";
    case "connecting":
      return "connecting";
    case "close":
      return "close";
    case "disconnected":
      return "disconnected";
    case "deleted":
      return "deleted";
    case "failed":
      return "failed";
    case "not_connected":
      return "not_connected";
    default:
      return "unknown";
  }
}

function normalizePhoneNumber(value: string | undefined) {
  if (!value) return undefined;
  const withoutSuffix = value.split("@")[0];
  if (!withoutSuffix) return undefined;
  const normalized = withoutSuffix.startsWith("+")
    ? `+${withoutSuffix.slice(1).replace(/\D/g, "")}`
    : withoutSuffix.replace(/\D/g, "");
  return /^\+?[1-9]\d{7,14}$/.test(normalized) ? normalized : undefined;
}

function isTransientStatus(status: number) {
  return status === 408 || status === 409 || status === 425 || status === 429 || status >= 500;
}

async function waitForRetry(attempt: number) {
  await new Promise((resolve) => setTimeout(resolve, attempt * 150));
}

async function fetchWithTimeout(url: string, init: RequestInit) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), evolutionTimeoutMs);
  try {
    return await fetch(url, { ...init, signal: controller.signal });
  } finally {
    clearTimeout(timeout);
  }
}

async function evolutionFetch<T extends JsonObject>(path: string, init: RequestInit = {}): Promise<T> {
  let apiUrl: string;
  let apiKey: string;
  try {
    ({ apiUrl, apiKey } = getEvolutionConfig());
  } catch {
    throw new HttpError(500, "Evolution API is not configured");
  }
  const baseUrl = apiUrl.replace(/\/+$/, "");
  const url = `${baseUrl}${path}`;
  let response: Response | undefined;
  let networkError: unknown;

  const request = {
    ...init,
    headers: {
      "Content-Type": "application/json",
      apikey: apiKey,
      ...(init.headers ?? {})
    }
  };

  for (let attempt = 1; attempt <= maxTransientAttempts; attempt += 1) {
    try {
      response = await fetchWithTimeout(url, request);
      if (!isTransientStatus(response.status) || attempt === maxTransientAttempts) {
        break;
      }
    } catch (error) {
      networkError = error;
      if (attempt === maxTransientAttempts) {
        break;
      }
    }
    await waitForRetry(attempt);
  }

  if (!response) {
    throw new HttpError(502, "Evolution API is unreachable", {
      cause: networkError instanceof Error ? networkError.message : "Unknown network error"
    });
  }

  const rawBody = await response.text();
  let body: JsonObject = {};
  if (rawBody) {
    try {
      body = toObject(JSON.parse(rawBody) as unknown);
    } catch {
      body = { message: rawBody };
    }
  }

  if (!response.ok) {
    const message =
      readNestedString(body, ["message"]) ??
      readNestedString(body, ["error"]) ??
      `Evolution API request failed with status ${response.status}`;
    throw new HttpError(response.status >= 500 ? 502 : response.status, message, body);
  }

  return body as T;
}

export async function createInstance(shopId: string): Promise<EvolutionInstanceResult> {
  const instanceName = createInstanceName(shopId);
  const raw = await evolutionFetch("/instance/create", {
    method: "POST",
    body: JSON.stringify({
      instanceName,
      qrcode: true,
      integration: "WHATSAPP-BAILEYS"
    })
  });
  return { instanceName, raw };
}

export async function getPairingCode(instanceName: string): Promise<EvolutionPairingCodeResult> {
  const encoded = encodeURIComponent(instanceName);
  const raw = await evolutionFetch(`/instance/connect/${encoded}`);
  return {
    instanceName,
    pairingCode:
      readNestedString(raw, ["pairingCode"]) ??
      readNestedString(raw, ["pairing_code"]) ??
      readNestedString(raw, ["code"]),
    qrCode: raw.qrcode ?? raw.qr ?? raw.base64,
    raw
  };
}

export async function getConnectionStatus(instanceName: string): Promise<EvolutionConnectionStatusResult> {
  const encoded = encodeURIComponent(instanceName);
  const raw = await evolutionFetch(`/instance/connectionState/${encoded}`);
  const state =
    readNestedString(raw, ["instance", "state"]) ??
    readNestedString(raw, ["state"]) ??
    readNestedString(raw, ["status"]);
  const phoneNumber =
    readNestedString(raw, ["instance", "owner"]) ??
    readNestedString(raw, ["owner"]) ??
    readNestedString(raw, ["phone"]);
  return {
    instanceName,
    status: normalizeStatus(state),
    phoneNumber: normalizePhoneNumber(phoneNumber),
    raw
  };
}

export async function disconnectInstance(instanceName: string): Promise<JsonObject> {
  return evolutionFetch(`/instance/logout/${encodeURIComponent(instanceName)}`, { method: "DELETE" });
}

export async function deleteInstance(instanceName: string): Promise<JsonObject> {
  return evolutionFetch(`/instance/delete/${encodeURIComponent(instanceName)}`, { method: "DELETE" });
}

export async function sendText(instanceName: string, number: string, text: string): Promise<JsonObject> {
  return evolutionFetch(`/message/sendText/${encodeURIComponent(instanceName)}`, {
    method: "POST",
    body: JSON.stringify({ number, text })
  });
}
