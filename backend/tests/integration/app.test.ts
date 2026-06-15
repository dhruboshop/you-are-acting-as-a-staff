import request from "supertest";
import { beforeEach, describe, expect, it, vi } from "vitest";

const dbMocks = vi.hoisted(() => ({
  query: vi.fn(async () => []),
  queryOne: vi.fn(async () => null),
  poolQuery: vi.fn(async () => ({ rows: [{ "?column?": 1 }] })),
  poolEnd: vi.fn()
}));

vi.mock("../../src/db/pool.js", () => ({
  pool: {
    query: dbMocks.poolQuery,
    end: dbMocks.poolEnd
  },
  query: dbMocks.query,
  queryOne: dbMocks.queryOne
}));

vi.mock("@supabase/supabase-js", () => ({
  createClient: vi.fn(() => ({
    auth: {
      getUser: vi.fn(async (token: string) => {
        if (token !== "valid-token") {
          return { data: { user: null }, error: { message: "invalid" } };
        }
        return {
          data: {
            user: {
              id: "00000000-0000-4000-8000-000000000001",
              email: "owner@example.com",
              user_metadata: {},
              app_metadata: {}
            }
          },
          error: null
        };
      })
    }
  }))
}));

const { createApp } = await import("../../src/app.js");

describe("app", () => {
  beforeEach(() => {
    dbMocks.query.mockReset();
    dbMocks.queryOne.mockReset();
    dbMocks.poolQuery.mockReset();
    dbMocks.poolQuery.mockResolvedValue({ rows: [{ "?column?": 1 }] });
    global.fetch = vi.fn();
  });

  it("serves health checks", async () => {
    const response = await request(createApp()).get("/health");
    expect(response.status).toBe(200);
    expect(response.body.status).toBe("ok");
  });

  it("protects authenticated routes", async () => {
    const response = await request(createApp()).get("/api/shops");
    expect(response.status).toBe(401);
  });

  it("returns onboarding route for merchants without a shop", async () => {
    dbMocks.queryOne
      .mockResolvedValueOnce({ id: "00000000-0000-4000-8000-000000000001" })
      .mockResolvedValueOnce(null);

    const response = await request(createApp())
      .get("/api/auth/onboarding")
      .set("Authorization", "Bearer valid-token");

    expect(response.status).toBe(200);
    expect(response.body.nextRoute).toBe("/onboarding/shop");
    expect(response.body.onboardingComplete).toBe(false);
    expect(response.body.shop).toBeNull();
  });

  it("returns WhatsApp onboarding route for merchants with an unconnected shop", async () => {
    const shopId = crypto.randomUUID();
    dbMocks.queryOne
      .mockResolvedValueOnce({ id: "00000000-0000-4000-8000-000000000001" })
      .mockResolvedValueOnce({
        id: shopId,
        name: "Radha Jewels",
        phone: "+919876543210",
        address: "Kolkata",
        merchant_status: "TRIAL",
        trial_ends_at: new Date().toISOString(),
        whatsapp_status: "not_connected",
        whatsapp_instance_name: null
      });

    const response = await request(createApp())
      .get("/api/auth/onboarding")
      .set("Authorization", "Bearer valid-token");

    expect(response.status).toBe(200);
    expect(response.body.nextRoute).toBe("/onboarding/whatsapp");
    expect(response.body.onboardingComplete).toBe(false);
    expect(response.body.shop.id).toBe(shopId);
  });

  it("returns dashboard route for merchants with connected WhatsApp", async () => {
    const shopId = crypto.randomUUID();
    dbMocks.queryOne
      .mockResolvedValueOnce({ id: "00000000-0000-4000-8000-000000000001" })
      .mockResolvedValueOnce({
        id: shopId,
        name: "Radha Jewels",
        phone: "+919876543210",
        address: "Kolkata",
        merchant_status: "TRIAL",
        trial_ends_at: new Date().toISOString(),
        whatsapp_status: "open",
        whatsapp_instance_name: `shop_${shopId.replaceAll("-", "_")}`
      });

    const response = await request(createApp())
      .get("/api/auth/onboarding")
      .set("Authorization", "Bearer valid-token");

    expect(response.status).toBe(200);
    expect(response.body.nextRoute).toBe("/app/dashboard");
    expect(response.body.onboardingComplete).toBe(true);
    expect(response.body.whatsapp.connected).toBe(true);
  });

  it("validates public customer registration", async () => {
    const response = await request(createApp())
      .post(`/api/public/shops/${crypto.randomUUID()}/customers`)
      .send({ name: "A", whatsappNumber: "bad", consent: false });
    expect(response.status).toBe(400);
    expect(response.body.success).toBe(false);
  });

  it("creates a WhatsApp connection and returns pairing details", async () => {
    const shopId = crypto.randomUUID();
    dbMocks.queryOne
      .mockResolvedValueOnce({ id: "00000000-0000-4000-8000-000000000001" })
      .mockResolvedValueOnce({ id: shopId })
      .mockResolvedValueOnce({
        id: crypto.randomUUID(),
        shop_id: shopId,
        instance_name: `shop_${shopId.replaceAll("-", "_")}`,
        phone_number: null,
        status: "connecting",
        connected_at: null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      });
    vi.mocked(global.fetch)
      .mockResolvedValueOnce(new Response(JSON.stringify({ instance: { instanceName: "created" } }), { status: 201 }))
      .mockResolvedValueOnce(new Response(JSON.stringify({ pairingCode: "12345678" }), { status: 200 }));

    const response = await request(createApp())
      .post("/api/whatsapp/connect")
      .set("Authorization", "Bearer valid-token")
      .send({ shopId });

    expect(response.status).toBe(201);
    expect(response.body.pairingCode).toBe("12345678");
    expect(response.body.connection.status).toBe("connecting");
    expect(vi.mocked(global.fetch).mock.calls[0]?.[0]).toBe("http://localhost:8081/instance/create");
  });

  it("rejects invalid WhatsApp connect payloads", async () => {
    const response = await request(createApp())
      .post("/api/whatsapp/connect")
      .set("Authorization", "Bearer valid-token")
      .send({ shopId: "not-a-uuid" });

    expect(response.status).toBe(400);
    expect(response.body.error).toBe("Validation failed");
  });

  it("blocks WhatsApp connect for shops owned by another merchant", async () => {
    dbMocks.queryOne
      .mockResolvedValueOnce({ id: "00000000-0000-4000-8000-000000000001" })
      .mockResolvedValueOnce(null);

    const response = await request(createApp())
      .post("/api/whatsapp/connect")
      .set("Authorization", "Bearer valid-token")
      .send({ shopId: crypto.randomUUID() });

    expect(response.status).toBe(404);
    expect(response.body.error).toBe("Shop not found");
    expect(vi.mocked(global.fetch)).not.toHaveBeenCalled();
  });

  it("returns a graceful error when Evolution is offline", async () => {
    const shopId = crypto.randomUUID();
    dbMocks.queryOne
      .mockResolvedValueOnce({ id: "00000000-0000-4000-8000-000000000001" })
      .mockResolvedValueOnce({ id: shopId });
    vi.mocked(global.fetch).mockRejectedValue(new Error("connect ECONNREFUSED"));

    const response = await request(createApp())
      .post("/api/whatsapp/connect")
      .set("Authorization", "Bearer valid-token")
      .send({ shopId });

    expect(response.status).toBe(502);
    expect(response.body.success).toBe(false);
    expect(response.body.error).toBe("Evolution API is unreachable");
    expect(vi.mocked(global.fetch)).toHaveBeenCalledTimes(3);
  });

  it("sanitizes HTML 502 responses from Evolution", async () => {
    const shopId = crypto.randomUUID();
    dbMocks.queryOne
      .mockResolvedValueOnce({ id: "00000000-0000-4000-8000-000000000001" })
      .mockResolvedValueOnce({ id: shopId });
    vi.mocked(global.fetch).mockResolvedValue(
      new Response("<!DOCTYPE html><title>502</title>", {
        status: 502,
        headers: { "content-type": "text/html" }
      })
    );

    const response = await request(createApp())
      .post("/api/whatsapp/connect")
      .set("Authorization", "Bearer valid-token")
      .send({ shopId });

    expect(response.status).toBe(502);
    expect(response.body.success).toBe(false);
    expect(response.body.error).toBe("Evolution API returned an HTML error page with status 502. Check the Evolution service health and Render logs.");
    expect(response.body.error).not.toContain("<!DOCTYPE");
    expect(response.body.details.body).toBeUndefined();
    expect(response.body.details.bodyPreview).toBeUndefined();
    expect(response.body.details.path).toBe("/instance/create");
    expect(vi.mocked(global.fetch)).toHaveBeenCalledTimes(3);
  });

  it("surfaces Evolution authentication failures without retrying", async () => {
    const shopId = crypto.randomUUID();
    dbMocks.queryOne
      .mockResolvedValueOnce({ id: "00000000-0000-4000-8000-000000000001" })
      .mockResolvedValueOnce({ id: shopId });
    vi.mocked(global.fetch).mockResolvedValueOnce(new Response(JSON.stringify({ message: "Unauthorized" }), { status: 401 }));

    const response = await request(createApp())
      .post("/api/whatsapp/connect")
      .set("Authorization", "Bearer valid-token")
      .send({ shopId });

    expect(response.status).toBe(401);
    expect(response.body.success).toBe(false);
    expect(response.body.error).toBe("Unauthorized");
    expect(vi.mocked(global.fetch)).toHaveBeenCalledTimes(1);
  });

  it("returns current WhatsApp connection status", async () => {
    const shopId = crypto.randomUUID();
    const instanceName = `shop_${shopId.replaceAll("-", "_")}`;
    dbMocks.queryOne
      .mockResolvedValueOnce({ id: "00000000-0000-4000-8000-000000000001" })
      .mockResolvedValueOnce({ id: shopId })
      .mockResolvedValueOnce({ instance_name: instanceName, status: "connecting" })
      .mockResolvedValueOnce({ instance_name: instanceName, status: "open", connected_at: new Date().toISOString() });
    vi.mocked(global.fetch).mockResolvedValueOnce(new Response(JSON.stringify({ instance: { state: "open" } }), { status: 200 }));

    const response = await request(createApp())
      .get(`/api/whatsapp/status?shopId=${shopId}`)
      .set("Authorization", "Bearer valid-token");

    expect(response.status).toBe(200);
    expect(response.body.status).toBe("open");
  });

  it("returns not_connected when no WhatsApp connection row exists", async () => {
    const shopId = crypto.randomUUID();
    dbMocks.queryOne
      .mockResolvedValueOnce({ id: "00000000-0000-4000-8000-000000000001" })
      .mockResolvedValueOnce({ id: shopId })
      .mockResolvedValueOnce(null);

    const response = await request(createApp())
      .get(`/api/whatsapp/status?shopId=${shopId}`)
      .set("Authorization", "Bearer valid-token");

    expect(response.status).toBe(200);
    expect(response.body.status).toBe("not_connected");
    expect(response.body.connection).toBeNull();
    expect(vi.mocked(global.fetch)).not.toHaveBeenCalled();
  });

  it("disconnects a WhatsApp connection", async () => {
    const shopId = crypto.randomUUID();
    const instanceName = `shop_${shopId.replaceAll("-", "_")}`;
    dbMocks.queryOne
      .mockResolvedValueOnce({ id: "00000000-0000-4000-8000-000000000001" })
      .mockResolvedValueOnce({ id: shopId })
      .mockResolvedValueOnce({ instance_name: instanceName, status: "open" })
      .mockResolvedValueOnce({ instance_name: instanceName, status: "disconnected", connected_at: null });
    vi.mocked(global.fetch).mockResolvedValueOnce(new Response(JSON.stringify({ success: true }), { status: 200 }));

    const response = await request(createApp())
      .post("/api/whatsapp/disconnect")
      .set("Authorization", "Bearer valid-token")
      .send({ shopId });

    expect(response.status).toBe(200);
    expect(response.body.status).toBe("disconnected");
    expect(vi.mocked(global.fetch).mock.calls[0]?.[0]).toBe(`http://localhost:8081/instance/logout/${instanceName}`);
  });

  it("returns 404 when disconnect is requested without a connection row", async () => {
    const shopId = crypto.randomUUID();
    dbMocks.queryOne
      .mockResolvedValueOnce({ id: "00000000-0000-4000-8000-000000000001" })
      .mockResolvedValueOnce({ id: shopId })
      .mockResolvedValueOnce(null);

    const response = await request(createApp())
      .post("/api/whatsapp/disconnect")
      .set("Authorization", "Bearer valid-token")
      .send({ shopId });

    expect(response.status).toBe(404);
    expect(response.body.error).toBe("WhatsApp connection not found");
    expect(vi.mocked(global.fetch)).not.toHaveBeenCalled();
  });
});
