import { describe, it, expect } from "vitest";
import { buildPayPalPayload, validateSubmission } from "./index.js";

const baseSubmission = {
  eventName: "Test Event 2027",
  organizationName: "Acme Corp",
  primaryContactName: "Jane Doe",
  contactEmail: "jane@acme.com",
  contactPhone: "555-1234",
  sponsorPackage: "Bronze",
  billingContactEmail: "ap@acme.com",
  sponsorWebsite: "https://acme.com",
  logoUrl: "",
  notes: "",
  companyWebsite: "",
};

describe("buildPayPalPayload", () => {
  it("uses eventName in memo and line-item name", () => {
    const payload = buildPayPalPayload(baseSubmission, "250.00");

    expect(payload.detail.memo).toBe("Test Event 2027 Bronze sponsor invoice");
    expect(payload.items[0].name).toBe("Test Event 2027 Bronze Sponsorship");
  });

  it("uses packageAmount as unit_amount value", () => {
    const payload = buildPayPalPayload(baseSubmission, "250.00");

    expect(payload.items[0].unit_amount.value).toBe("250.00");
  });
});

describe("validateSubmission", () => {
  it("returns eventName error when eventName is empty", () => {
    const errors = validateSubmission({ ...baseSubmission, eventName: "" });

    expect(errors).toContain("eventName");
  });

  it("returns no errors for a valid submission", () => {
    const errors = validateSubmission(baseSubmission);

    expect(errors).toHaveLength(0);
  });
});
