import { z } from "zod";
import type { Tables } from "@/integrations/supabase/types";
export type Customer = Tables<"admin_customers">;
export const statuses = ["Pending", "Active", "Suspended", "Restricted", "Closed"] as const;
export const accountTypes = ["Personal", "Business", "Savings", "Wealth"] as const;
export const currencies = ["USD", "EUR", "GBP", "CAD", "CHF"] as const;
const text = (max: number) => z.string().trim().max(max).default("");
const date = z
  .string()
  .refine(
    (v) => !v || (/^\d{4}-\d{2}-\d{2}$/.test(v) && !Number.isNaN(Date.parse(v))),
    "Enter a valid date",
  )
  .default("");
export const customerSchema = z
  .object({
    first_name: z.string().trim().min(1).max(80),
    middle_name: text(80),
    last_name: z.string().trim().min(1).max(80),
    date_of_birth: date.refine(
      (v) => !v || new Date(v) <= new Date(),
      "Date of birth cannot be in the future",
    ),
    nationality: text(80),
    country: text(80),
    address: text(500),
    email: z.string().trim().email().max(255),
    phone: text(40),
    alternative_phone: text(40),
    account_type: z.enum(accountTypes),
    currency: z.enum(currencies),
    opening_date: date,
    notes: text(1000),
  })
  .strict();
export const statusSchema = z
  .object({
    id: z.string().uuid(),
    version: z.number().int().positive(),
    status: z.enum(statuses),
    reason: z.string().trim().min(5).max(1000),
    checks: z.boolean(),
    archive: z.boolean(),
  })
  .superRefine((v, c) => {
    if (v.status === "Active" && !v.checks)
      c.addIssue({ code: "custom", message: "Confirm required checks", path: ["checks"] });
    if (v.archive && v.status !== "Closed")
      c.addIssue({
        code: "custom",
        message: "Close the record before archiving",
        path: ["status"],
      });
  });
export const applicationSchema = customerSchema.pick({
  first_name: true,
  last_name: true,
  email: true,
  phone: true,
  account_type: true,
  currency: true,
});
export const reviewSchema = z
  .object({
    id: z.string().uuid(),
    decision: z.enum(["Information requested", "Approved", "Rejected"]),
    reason: z.string().trim().min(5).max(1000),
    checks: z.boolean(),
  })
  .refine((v) => v.decision !== "Approved" || v.checks, "Confirm required checks before approval");
export const sectionNames = {
  overview: "Overview",
  users: "All Users",
  create: "Create New User",
  applications: "Account Applications",
  accounts: "Account Management",
  transactions: "Transactions",
  notifications: "Notifications",
  reports: "Reports",
  settings: "Settings",
  profile: "Administrator Profile",
  content: "Website Content",
} as const;
export type Section = keyof typeof sectionNames;
export const sectionSchema = z.enum([
  "overview",
  "users",
  "create",
  "applications",
  "accounts",
  "transactions",
  "notifications",
  "reports",
  "settings",
  "profile",
  "content",
]);
export const listSchema = z.object({
  q: z.string().max(100).default(""),
  status: z.enum(["All", ...statuses, "Archived"]).default("All"),
  page: z.number().int().min(1).default(1),
  sort: z.enum(["created_at", "first_name", "status", "account_type"]).default("created_at"),
  asc: z.boolean().default(false),
});
export function maskReference(value: string) {
  return `•••• ${value.slice(-6)}`;
}
export function fullName(c: Pick<Customer, "first_name" | "middle_name" | "last_name">) {
  return [c.first_name, c.middle_name, c.last_name].filter(Boolean).join(" ");
}
export function csvCell(value: unknown) {
  const s = String(value ?? "");
  return `"${/^[\s]*[=+\-@]/.test(s) ? "'" : ""}${s.replaceAll('"', '""')}"`;
}
export function canAccessAdministration(primary: boolean, role: boolean, _aal?: string) {
  return primary && role;
}
