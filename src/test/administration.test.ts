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
});
