import { describe, expect, it } from "vitest";
import {
  customerCreateSchema,
  campaignSchema,
  loyaltySchema,
  shopCreateSchema,
  whatsappConnectSchema,
  whatsappDisconnectSchema,
  whatsappStatusQuerySchema
} from "../../src/validators/schemas.js";
import { renderTemplate } from "../../src/services/campaignTemplates.js";

describe("validators", () => {
  it("accepts valid shop input", () => {
    const parsed = shopCreateSchema.parse({ name: "Bose Stores", settings: { currency: "INR" } });
    expect(parsed.name).toBe("Bose Stores");
  });

  it("requires customer consent and valid WhatsApp number", () => {
    expect(() => customerCreateSchema.parse({ name: "Anita", whatsappNumber: "123", consent: true })).toThrow();
    expect(() => customerCreateSchema.parse({ name: "Anita", whatsappNumber: "+919876543210", consent: false })).toThrow();
    expect(customerCreateSchema.parse({ name: "Anita", whatsappNumber: "+919876543210", consent: true })).toMatchObject({
      whatsappNumber: "+919876543210"
    });
  });

  it("allows positive loyalty points only", () => {
    expect(() => loyaltySchema.parse({ customerId: crypto.randomUUID(), points: 0, reason: "Purchase" })).toThrow();
    expect(loyaltySchema.parse({ customerId: crypto.randomUUID(), points: 10, reason: "Purchase" }).points).toBe(10);
  });

  it("renders campaign placeholders", () => {
    expect(renderTemplate("Hi {{customerName}} from {{shopName}}", "Bose Stores", "Anita")).toBe("Hi Anita from Bose Stores");
  });

  it("limits campaigns to MVP activation types", () => {
    const base = {
      shopId: crypto.randomUUID(),
      title: "Customer greeting",
      message: "Hi {{customerName}}, visit {{shopName}} soon.",
      target: "all" as const
    };
    expect(campaignSchema.parse({ ...base, templateKey: "birthday" }).templateKey).toBe("birthday");
    expect(campaignSchema.parse({ ...base, templateKey: "anniversary" }).templateKey).toBe("anniversary");
    expect(campaignSchema.parse({ ...base, templateKey: "festival" }).templateKey).toBe("festival");
    expect(campaignSchema.parse({ ...base, templateKey: "winback" }).templateKey).toBe("winback");
    expect(() => campaignSchema.parse({ ...base, templateKey: "promotional" })).toThrow();
  });

  it("validates WhatsApp integration payloads", () => {
    const shopId = crypto.randomUUID();
    expect(whatsappConnectSchema.parse({ shopId })).toEqual({ shopId });
    expect(whatsappStatusQuerySchema.parse({ shopId })).toEqual({ shopId });
    expect(whatsappDisconnectSchema.parse({ shopId })).toEqual({ shopId, deleteInstance: false });
    expect(() => whatsappConnectSchema.parse({ shopId: "bad", instanceName: "ignored" })).toThrow();
  });
});
