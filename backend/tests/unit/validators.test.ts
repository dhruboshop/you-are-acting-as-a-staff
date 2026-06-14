import { describe, expect, it } from "vitest";
import { customerCreateSchema, loyaltySchema, shopCreateSchema } from "../../src/validators/schemas.js";
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
});
