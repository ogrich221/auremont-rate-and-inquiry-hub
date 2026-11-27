import { describe, it, expect } from "vitest";
import {
  canAccessAdministration,
  customerSchema,
  statusSchema,
  reviewSchema,
  csvCell,
  maskReference,
} from "@/lib/admin-model";
describe("Central administration safeguards", () => {
  it("restricts access to the single designated administrator with admin role", () => {
    expect(canAccessAdministration(true, true, "aal1")).toBe(true);
    expect(canAccessAdministration(true, true, "aal2")).toBe(true);
    expect(canAccessAdministration(false, true, "aal1")).toBe(false);
    expect(canAccessAdministration(true, false, "aal1")).toBe(false);
  });
  it("never accepts plaintext customer passwords or PINs", () => {
    const customer = {
      first_name: "Demo",
      last_name: "Customer",
      email: "demo@example.com",
      account_type: "Personal",
      currency: "USD",
    };
    expect(customerSchema.safeParse(customer).success).toBe(true);
    expect(customerSchema.safeParse({ ...customer, password: "secret-password" }).success).toBe(
      false,
    );
    expect(customerSchema.safeParse({ ...customer, pin: "1234" }).success).toBe(false);
  });
  it("requires a documented suspension reason", () => {
    const action = {
      id: "00000000-0000-4000-8000-000000000001",
      version: 1,
      status: "Suspended",
      reason: "Customer requested pause",
      checks: false,
      archive: false,
    };
    expect(statusSchema.safeParse(action).success).toBe(true);
    expect(statusSchema.safeParse({ ...action, reason: "" }).success).toBe(false);
  });
  it("requires completed checks before reactivation", () => {
    const action = {
      id: "00000000-0000-4000-8000-000000000001",
      version: 1,
      status: "Active",
      reason: "Demonstration review complete",
      checks: false,
      archive: false,
    };
    expect(statusSchema.safeParse(action).success).toBe(false);
    expect(statusSchema.safeParse({ ...action, checks: true }).success).toBe(true);
  });
  it("only archives a closed record and retains its identity", () => {
    const action = {
      id: "00000000-0000-4000-8000-000000000001",
      version: 1,
      status: "Closed",
      reason: "Demo record retention",
      checks: true,
      archive: true,
    };
    expect(statusSchema.safeParse(action).success).toBe(true);
    expect(statusSchema.safeParse({ ...action, status: "Active" }).success).toBe(false);
  });
  it("requires a rejection reason and checks for approval", () => {
    const review = {
      id: "00000000-0000-4000-8000-000000000001",
      decision: "Rejected",
      reason: "Incomplete demo application",
      checks: false,
    };
    expect(reviewSchema.safeParse(review).success).toBe(true);
    expect(reviewSchema.safeParse({ ...review, reason: "" }).success).toBe(false);
    expect(reviewSchema.safeParse({ ...review, decision: "Approved" }).success).toBe(false);
    expect(reviewSchema.safeParse({ ...review, decision: "Approved", checks: true }).success).toBe(
      true,
    );
  });
  it("masks account references in administration", () => {
    expect(maskReference("DEMO-1234567890")).toBe("•••• 567890");
  });
  it("neutralizes spreadsheet formulas in private CSV exports", () => {
    expect(csvCell('=HYPERLINK("https://example.com")')).toBe(
      '"\'=HYPERLINK(""https://example.com"")"',
    );
    expect(csvCell("Alice")).toBe('"Alice"');
  });

  it("validates administrative credit and debit creation with date, time, and narration", async () => {
    const { createTransactionSchema } = await import("@/lib/admin-model");
    const validCredit = {
      customer_id: "00000000-0000-4000-8000-000000000001",
      type: "Credit",
      amount: 25000,
      currency: "USD",
      occurred_at: "2026-11-27T10:30",
      narration: "Private Wealth Dividend Credit",
      status: "Completed",
    };
    expect(createTransactionSchema.safeParse(validCredit).success).toBe(true);

    const validDebit = {
      customer_id: "00000000-0000-4000-8000-000000000001",
      type: "Debit",
      amount: 5000,
      currency: "GBP",
      occurred_at: "2026-11-26T15:45",
      narration: "Private Retainer Debit",
      status: "Completed",
    };
    expect(createTransactionSchema.safeParse(validDebit).success).toBe(true);

    // Negative or zero amount fails
    expect(createTransactionSchema.safeParse({ ...validCredit, amount: -100 }).success).toBe(false);
    expect(createTransactionSchema.safeParse({ ...validCredit, amount: 0 }).success).toBe(false);

    // Empty narration fails
    expect(createTransactionSchema.safeParse({ ...validCredit, narration: "" }).success).toBe(false);

    // Empty date fails
    expect(createTransactionSchema.safeParse({ ...validCredit, occurred_at: "" }).success).toBe(false);
  });

  it("validates editing transaction date, time, narration, and execution status", async () => {
    const { updateTransactionSchema } = await import("@/lib/admin-model");
    const validUpdate = {
      id: "00000000-0000-4000-8000-000000000001",
      occurred_at: "2026-11-20T12:00",
      narration: "Updated Q4 Retainer Settlement",
      amount: 15000,
      status: "Completed",
    };
    expect(updateTransactionSchema.safeParse(validUpdate).success).toBe(true);

    // Empty narration fails
    expect(updateTransactionSchema.safeParse({ ...validUpdate, narration: "   " }).success).toBe(false);

    // Invalid amount fails
    expect(updateTransactionSchema.safeParse({ ...validUpdate, amount: -50 }).success).toBe(false);
  });
});
