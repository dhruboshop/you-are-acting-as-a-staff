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
const evolutionTimeoutMs = 45_000;
const maxTransientAttempts = 5;
const upstreamPreviewLength = 280;
const productionRetryDelaysMs = [1_500, 4_000, 8_000, 12_000];

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

export function createInstanceName(shopId: string) {
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

function isHtmlResponse(value: string) {
  return /<!doctype html|<html|<title>|<\/[a-z][\s\S]*>/i.test(value);
}

function compactBodyPreview(value: string) {
  return value.replace(/\s+/g, " ").trim().slice(0, upstreamPreviewLength);
}

function upstreamFailureMessage(status: number, body: JsonObject, rawBody: string) {
  const directMessage = readNestedString(body, ["message"]) ?? readNestedString(body, ["error"]);
  if (directMessage && !isHtmlResponse(directMessage)) {
    return directMessage;
  }
  if (rawBody && isHtmlResponse(rawBody)) {
    return `WhatsApp service is temporarily unavailable while the connection server starts. Please wait a moment and try again.`;
  }
  return `Evolution API request failed with status ${status}`;
}

function upstreamFailureDetails(status: number, path: string, body: JsonObject, rawBody: string) {
  return {
    upstream: "evolution-api",
    status,
    path,
    body: rawBody && isHtmlResponse(rawBody) ? undefined : body,
    bodyPreview: rawBody && !isHtmlResponse(rawBody) ? compactBodyPreview(rawBody) : undefined,
    contentType: typeof body.contentType === "string" ? body.contentType : undefined
  };
}

function findNestedString(source: unknown, keys: string[]): string | undefined {
  if (typeof source === "string" && source.trim()) return source.trim();
  if (!source || typeof source !== "object") return undefined;
  if (Array.isArray(source)) {
    for (const item of source) {
      const result = findNestedString(item, keys);
      if (result) return result;
    }
    return undefined;
  }
  const object = source as JsonObject;
  for (const key of keys) {
    const value = object[key];
    if (typeof value === "string" && value.trim()) return value.trim();
  }
  for (const value of Object.values(object)) {
    const result = findNestedString(value, keys);
    if (result) return result;
  }
  return undefined;
}

function looksLikeBase64Image(value: string | undefined) {
  if (!value) return false;
  return value.startsWith("data:image/") || (/^[A-Za-z0-9+/=]+$/.test(value) && value.length > 500);
}

function normalizePairingCode(value: string | undefined) {
  if (!value || looksLikeBase64Image(value)) return undefined;
  const trimmed = value.trim();
  return trimmed.length <= 80 ? trimmed : undefined;
}

function normalizeQrCode(value: unknown) {
  if (typeof value !== "string" || !value.trim()) return undefined;
  if (looksLikeBase64Image(value)) return value.trim();
  return value.length <= 2953 ? value.trim() : undefined;
}

export function normalizeEvolutionStatus(value: string | undefined): EvolutionConnectionStatus {
  const normalized = value?.toLowerCase().replace(/\s+/g, "_").replace(/-/g, "_");
  switch (normalized) {
    case "open":
    case "online":
      return "open";
    case "connected":
    case "connection_open":
      return "connected";
    case "connecting":
    case "qrcode":
    case "qr":
    case "pairing":
    case "pairing_code":
      return "connecting";
    case "close":
    case "closed":
    case "not_connection":
    case "not_connected":
      return "close";
    case "disconnected":
      return "disconnected";
    case "deleted":
      return "deleted";
    case "failed":
      return "failed";
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
  if (process.env.NODE_ENV === "test") return;
  const delay = productionRetryDelaysMs[Math.max(0, attempt - 1)] ?? productionRetryDelaysMs.at(-1) ?? 5_000;
  await new Promise((resolve) => setTimeout(resolve, delay));
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
  const contentType = response.headers.get("content-type") ?? undefined;
  let body: JsonObject = {};
  if (rawBody) {
    try {
      const parsed = JSON.parse(rawBody) as unknown;
      body = parsed && typeof parsed === "object" ? parsed as JsonObject : {};
    } catch {
      body = { message: isHtmlResponse(rawBody) ? undefined : compactBodyPreview(rawBody), contentType };
    }
  }

  if (!response.ok) {
    throw new HttpError(
      response.status >= 500 ? 502 : response.status,
      upstreamFailureMessage(response.status, body, rawBody),
      upstreamFailureDetails(response.status, path, body, rawBody)
    );
  }

  return body as T;
}

export function isTemporaryEvolutionFailure(error: unknown) {
  return error instanceof HttpError && (error.status === 502 || error.status === 503 || error.status === 504);
}

export async function createInstance(shopId: string): Promise<EvolutionInstanceResult> {
  const instanceName = createInstanceName(shopId);
  let raw: JsonObject;
  try {
    raw = await evolutionFetch("/instance/create", {
      method: "POST",
      body: JSON.stringify({
        instanceName,
        qrcode: true,
        integration: "WHATSAPP-BAILEYS"
      })
    });
  } catch (error) {
    if (error instanceof HttpError && [400, 403, 409].includes(error.status)) {
      const details = toObject(error.details);
      const body = toObject(details.body);
      const message = `${error.message} ${JSON.stringify(body)}`.toLowerCase();
      if (message.includes("already") || message.includes("exist")) {
        raw = { instanceName, reused: true, upstreamMessage: error.message };
      } else {
        throw error;
      }
    } else {
      throw error;
    }
  }
  return { instanceName, raw };
}

export async function getPairingCode(instanceName: string): Promise<EvolutionPairingCodeResult> {
  const encoded = encodeURIComponent(instanceName);
  const raw = await evolutionFetch(`/instance/connect/${encoded}`);
  return {
    instanceName,
    pairingCode:
      normalizePairingCode(readNestedString(raw, ["pairingCode"])) ??
      normalizePairingCode(readNestedString(raw, ["pairing_code"])) ??
      normalizePairingCode(readNestedString(raw, ["code"])) ??
      normalizePairingCode(findNestedString(raw, ["pairingCode", "pairing_code", "code"])),
    qrCode:
      normalizeQrCode(raw.qrcode) ??
      normalizeQrCode(raw.qr) ??
      normalizeQrCode(raw.base64) ??
      normalizeQrCode(findNestedString(raw, ["qrcode", "qr", "base64", "code"])),
    raw
  };
}

export async function getConnectionStatus(instanceName: string): Promise<EvolutionConnectionStatusResult> {
  const encoded = encodeURIComponent(instanceName);
  const raw = await evolutionFetch(`/instance/connectionState/${encoded}`);
  const state =
    readNestedString(raw, ["instance", "state"]) ??
    readNestedString(raw, ["instance", "status"]) ??
    readNestedString(raw, ["instance", "connectionStatus"]) ??
    readNestedString(raw, ["instance", "connection", "state"]) ??
    readNestedString(raw, ["instance", "connection", "status"]) ??
    readNestedString(raw, ["state"]) ??
    readNestedString(raw, ["status"]) ??
    readNestedString(raw, ["connectionStatus"]);
  const phoneNumber =
    readNestedString(raw, ["instance", "owner"]) ??
    readNestedString(raw, ["instance", "ownerJid"]) ??
    readNestedString(raw, ["instance", "profilePictureUrl"]) ??
    readNestedString(raw, ["owner"]) ??
    readNestedString(raw, ["ownerJid"]) ??
    readNestedString(raw, ["phone"]);
  const status = normalizeEvolutionStatus(state);
  if (status !== "unknown") {
    return {
      instanceName,
      status,
      phoneNumber: normalizePhoneNumber(phoneNumber),
      raw
    };
  }

  const fallback = await fetchInstanceStatus(instanceName).catch(() => null);
  if (fallback) return fallback;

  return {
    instanceName,
    status,
    phoneNumber: normalizePhoneNumber(phoneNumber),
    raw
  };
}

export async function fetchInstanceStatus(instanceName: string): Promise<EvolutionConnectionStatusResult> {
  const encoded = encodeURIComponent(instanceName);
  const raw = await evolutionFetch(`/instance/fetchInstances?instanceName=${encoded}`);
  const rows = Array.isArray(raw) ? raw : Array.isArray(raw.instances) ? raw.instances : Array.isArray(raw.data) ? raw.data : [raw];
  const match = rows
    .map((row) => toObject(row))
    .find((row) => {
      const rowName =
        readNestedString(row, ["name"]) ??
        readNestedString(row, ["instanceName"]) ??
        readNestedString(row, ["instance", "instanceName"]) ??
        readNestedString(row, ["instance", "name"]);
      return rowName === instanceName;
    }) ?? toObject(rows[0]);

  const state =
    readNestedString(match, ["connectionStatus"]) ??
    readNestedString(match, ["status"]) ??
    readNestedString(match, ["state"]) ??
    readNestedString(match, ["instance", "state"]) ??
    readNestedString(match, ["instance", "status"]) ??
    readNestedString(match, ["instance", "connectionStatus"]);
  const phoneNumber =
    readNestedString(match, ["owner"]) ??
    readNestedString(match, ["ownerJid"]) ??
    readNestedString(match, ["number"]) ??
    readNestedString(match, ["profileName"]) ??
    readNestedString(match, ["instance", "owner"]) ??
    readNestedString(match, ["instance", "ownerJid"]);

  return {
    instanceName,
    status: normalizeEvolutionStatus(state),
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
