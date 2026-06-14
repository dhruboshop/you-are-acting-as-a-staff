import request from "supertest";
import { describe, expect, it, vi } from "vitest";

vi.mock("../../src/db/pool.js", () => ({
  pool: {
    query: vi.fn(async () => ({ rows: [{ "?column?": 1 }] })),
    end: vi.fn()
  },
  query: vi.fn(async () => []),
  queryOne: vi.fn(async () => null)
}));

const { createApp } = await import("../../src/app.js");

describe("app", () => {
  it("serves health checks", async () => {
    const response = await request(createApp()).get("/health");
    expect(response.status).toBe(200);
    expect(response.body.status).toBe("ok");
  });

  it("protects authenticated routes", async () => {
    const response = await request(createApp()).get("/api/shops");
    expect(response.status).toBe(401);
  });

  it("validates public customer registration", async () => {
    const response = await request(createApp())
      .post(`/api/public/shops/${crypto.randomUUID()}/customers`)
      .send({ name: "A", whatsappNumber: "bad", consent: false });
    expect(response.status).toBe(400);
  });
});
