import { describe, it, expect } from "vitest";
import {
  canPerformFinancialOperation,
  contactSchema,
  ratesSchema,
  contactsSchema,
} from "@/lib/bank";
describe("Banking demonstration integrity", () => {
  it("never permits real financial operations in the demo", () => {
    expect(canPerformFinancialOperation()).toBe(false);
  });
  it("requires genuine email formatting or leaves contact email unpublished", () => {
    expect(contactsSchema.safeParse({ email: "", phone: "", hours: "" }).success).toBe(true);
    expect(contactsSchema.safeParse({ email: "not-an-email", phone: "", hours: "" }).success).toBe(
      false,
    );
  });
  it("rejects malformed inquiries and accepts complete general inquiries", () => {
    expect(
      contactSchema.safeParse({
        name: "Test visitor",
        email: "visitor@example.com",
        topic: "General inquiry",
        message: "A general demonstration question.",
      }).success,
    ).toBe(true);
    expect(
      contactSchema.safeParse({
        name: "",
        email: "invalid",
        topic: "General inquiry",
        message: "short",
      }).success,
    ).toBe(false);
  });
  it("rejects unsolicited hidden-field submissions", () => {
    expect(
      contactSchema.safeParse({
        name: "Test",
        email: "visitor@example.com",
        topic: "General inquiry",
        message: "A legitimate length of message",
        website: "spam.example.com",
      }).success,
    ).toBe(false);
  });
  it("requires four configurable rates with an APR or APY denomination", () => {
    const r = {
      title: "Savings",
      value: "4.25",
      unit: "% APY",
      description: "Illustrative",
      path: "/personal-banking",
    };
    expect(ratesSchema.safeParse([r, r, r, r]).success).toBe(true);
    expect(ratesSchema.safeParse([r]).success).toBe(false);
    expect(ratesSchema.safeParse([{ ...r, value: "Guaranteed" }, r, r, r]).success).toBe(false);
  });
});
