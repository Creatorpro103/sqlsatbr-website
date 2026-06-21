import { describe, it, expect } from "vitest";
import { buildPayPalPayload, validateSubmission, buildGitHubIssueBody } from "./index.js";

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

describe("buildGitHubIssueBody", () => {
  it("includes structured fields parseable by intake-sponsor workflow", () => {
    const body = buildGitHubIssueBody(
      { ...baseSubmission, eventSlug: "test-event-2027", sponsorPackage: "Bronze" },
      "DODBR-BRONZE-20270101120000",
      "250.00",
    );

    expect(body).toContain("### Sponsor Tier\nBronze");
    expect(body).toContain("### Event\ntest-event-2027");
    expect(body).toContain("### Sponsor Name\nAcme Corp");
    expect(body).toContain("### Sponsor Website URL\nhttps://acme.com");
  });

  it("uses _No response_ placeholder when logoUrl is empty", () => {
    const body = buildGitHubIssueBody(
      { ...baseSubmission, eventSlug: "test-event-2027", logoUrl: "" },
      "DODBR-BRONZE-20270101120000",
      "250.00",
    );

    expect(body).toContain("### Logo URL\n_No response_");
  });

  it("includes invoice reference in body without PII", () => {
    const body = buildGitHubIssueBody(
      { ...baseSubmission, eventSlug: "test-event-2027" },
      "DODBR-BRONZE-20270101120000",
      "250.00",
    );

    expect(body).toContain("DODBR-BRONZE-20270101120000");
    expect(body).not.toContain("jane@acme.com");
    expect(body).not.toContain("ap@acme.com");
    expect(body).not.toContain("555-1234");
    expect(body).not.toContain("Jane Doe");
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
