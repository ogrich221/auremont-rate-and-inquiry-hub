import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { z } from "zod";
import {
  customerSchema,
  statusSchema,
  applicationSchema,
  reviewSchema,
  listSchema,
  canAccessAdministration,
} from "./admin-model";

export const getAdministratorAccess = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const [{ data: primary, error }, { data: role, error: roleError }] = await Promise.all([
      context.supabase
        .from("primary_administrator")
        .select("user_id")
        .eq("user_id", context.userId)
        .maybeSingle(),
      context.supabase.rpc("has_role", { _user_id: context.userId, _role: "admin" }),
    ]);
    if (error || roleError) throw new Error("Administrator access could not be checked.");
    const aal = String(context.claims["aal"] ?? "aal1");
    return {
      primary: !!primary,
      role: !!role,
      allowed: canAccessAdministration(!!primary, !!role, aal),
      email: String(context.claims["email"] ?? ""),
    };
  });
export const getWorkspace = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabase } = context;
    const { error: access } = await supabase.rpc("require_primary_administrator", {
      recent: false,
    });
    if (access)
      throw new Error(
        "Only the designated administrator with multi-factor verification can open this workspace.",
      );
    const [
      summary,
      customers,
      applications,
      transactions,
      activities,
      notifications,
      preferences,
      inbox,
      ...counts
    ] = await Promise.all([
      supabase.rpc("admin_summary"),
      supabase
        .from("admin_customers")
        .select("*")
        .is("archived_at", null)
        .order("created_at", { ascending: false })
        .limit(5),
      supabase
        .from("admin_applications")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(200),
      supabase
        .from("admin_transactions")
        .select("*")
        .order("occurred_at", { ascending: false })
        .limit(200),
      supabase.from("admin_audit").select("*").order("created_at", { ascending: false }).limit(100),
      supabase
        .from("admin_notifications")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(200),
      supabase.from("admin_preferences").select("*").eq("user_id", context.userId).maybeSingle(),
      supabase
        .from("contact_submissions")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(100),
      ...(["All", "Active", "Pending", "Suspended", "Closed", "Restricted", "New"] as const).map(
        (status) => {
          let q = supabase
            .from("admin_customers")
            .select("id", { count: "exact", head: true })
            .is("archived_at", null);
          if (status === "New")
            q = q.gte("created_at", new Date(Date.now() - 30 * 86400000).toISOString());
          else if (status !== "All") q = q.eq("status", status);
          return q;
        },
      ),
    ]);
    if (
      [
        summary,
        customers,
        applications,
        transactions,
        activities,
        notifications,
        preferences,
        inbox,
        ...counts,
      ].some((r) => r.error)
    )
      throw new Error("Workspace records could not be loaded. Please try again.");
    const totals = z
      .object({
        pendingApplications: z.number(),
        totalApplications: z.number(),
        totalTransactions: z.number(),
        registrations: z.array(z.object({ month: z.string(), count: z.number() })),
      })
      .parse(summary.data);
    return {
      summary: totals,
      customers: customers.data ?? [],
      applications: applications.data ?? [],
      transactions: transactions.data ?? [],
      activities: activities.data ?? [],
      notifications: notifications.data ?? [],
      preferences: preferences.data,
      inbox: inbox.data ?? [],
      counts: counts.map((c) => c.count ?? 0),
      userId: context.userId,
      email: String(context.claims["email"] ?? ""),
    };
  });
export const getCustomers = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((v) => listSchema.parse(v))
  .handler(async ({ context, data }) => {
    const { error: access } = await context.supabase.rpc("require_primary_administrator", {
      recent: false,
    });
    if (access) throw new Error("Administrator verification required.");
    let q = context.supabase.from("admin_customers").select("*", { count: "exact" });
    q = data.status === "Archived" ? q.not("archived_at", "is", null) : q.is("archived_at", null);
    if (data.status !== "All" && data.status !== "Archived") q = q.eq("status", data.status);
    const search = data.q.replace(/[%,().\\_]/g, " ").trim();
    if (search)
      q = q.or(
        ["first_name", "middle_name", "last_name", "email", "phone", "customer_ref", "account_ref"]
          .map((k) => `${k}.ilike.%${search}%`)
          .join(","),
      );
    const {
      data: rows,
      count,
      error,
    } = await q
      .order(data.sort, { ascending: data.asc })
      .order("id")
      .range((data.page - 1) * 20, data.page * 20 - 1);
    if (error) throw new Error("Customer records could not load.");
    return { rows: rows ?? [], count: count ?? 0 };
  });
export const getCustomer = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((v) => z.object({ id: z.string().uuid() }).parse(v))
  .handler(async ({ context, data }) => {
    const { error: access } = await context.supabase.rpc("require_primary_administrator", {
      recent: false,
    });
    if (access) throw new Error("Administrator verification required.");
    const [customer, history, transactions] = await Promise.all([
      context.supabase.from("admin_customers").select("*").eq("id", data.id).single(),
      context.supabase
        .from("admin_audit")
        .select("*")
        .eq("entity_id", data.id)
        .order("created_at", { ascending: false }),
      context.supabase
        .from("admin_transactions")
        .select("*")
        .eq("customer_id", data.id)
        .order("occurred_at", { ascending: false }),
    ]);
    if (customer.error || history.error || transactions.error)
      throw new Error("Customer record unavailable.");
    return {
      customer: customer.data,
      history: history.data ?? [],
      transactions: transactions.data ?? [],
    };
  });
export const saveCustomer = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((v) =>
    z
      .object({
        customer: customerSchema,
        id: z.string().uuid().optional(),
        version: z.number().int().positive().optional(),
      })
      .parse(v),
  )
  .handler(async ({ context, data }) => {
    const { data: id, error } = await context.supabase.rpc("admin_save_customer", {
      payload: data.customer,
      ...(data.id ? { record_id: data.id, expected_version: data.version ?? 0 } : {}),
    });
    if (error) {
      if (error.code === "23505") throw new Error("A customer with this email already exists.");
      throw new Error("Could not save. Reload if this record changed, then try again.");
    }
    return { id };
  });
export const changeCustomer = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((v) => statusSchema.parse(v))
  .handler(async ({ context, data }) => {
    const { error } = await context.supabase.rpc("admin_change_customer", {
      record_id: data.id,
      expected_version: data.version,
      target_status: data.status,
      reason: data.reason,
      checks_complete: data.checks,
      archive: data.archive,
    });
    if (error)
      throw new Error(
        "Action not completed. Please reload the record before trying again.",
      );
    return { success: true };
  });
export const createApplication = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((v) => applicationSchema.parse(v))
  .handler(async ({ context, data }) => {
    const { error } = await context.supabase.rpc("admin_create_application", { payload: data });
    if (error) throw new Error("Application could not be recorded.");
    return { success: true };
  });
export const reviewApplication = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((v) => reviewSchema.parse(v))
  .handler(async ({ context, data }) => {
    const { data: id, error } = await context.supabase.rpc("admin_review_application", {
      record_id: data.id,
      decision: data.decision,
      reason: data.reason,
      checks_complete: data.checks,
    });
    if (error)
      throw new Error(
        "Review not completed. Check for duplicate customers and reload the application.",
      );
    return { id };
  });
export const markNotifications = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((v) => z.object({ id: z.string().uuid().optional() }).parse(v))
  .handler(async ({ context, data }) => {
    const { error } = await context.supabase.rpc(
      "admin_mark_notifications",
      data.id ? { record_id: data.id } : {},
    );
    if (error) throw new Error("Notification could not be updated.");
    return { success: true };
  });
export const savePreferences = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((v) =>
    z.object({ name: z.string().trim().min(1).max(100), notifications: z.boolean() }).parse(v),
  )
  .handler(async ({ context, data }) => {
    const { error } = await context.supabase.rpc("admin_save_preferences", {
      display_name: data.name,
      security_notifications: data.notifications,
    });
    if (error) throw new Error("Settings could not be saved.");
    return { success: true };
  });
export const recordAdminEvent = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((v) =>
    z
      .object({
        event: z.enum([
          "Workspace opened",
          "Report exported",
          "Password changed",
          "Other sessions signed out",
        ]),
      })
      .parse(v),
  )
  .handler(async ({ context, data }) => {
    const { error } = await context.supabase.rpc("admin_record_access", { event: data.event });
    if (error) throw new Error("Security activity could not be recorded.");
    return { success: true };
  });
export const exportCustomers = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { error: access } = await context.supabase.rpc("require_primary_administrator", {
      recent: false,
    });
    if (access) throw new Error("Unauthorized to export customer records.");
    const rows = [];
    for (let offset = 0; ; offset += 500) {
      const { data, error } = await context.supabase
        .from("admin_customers")
        .select("customer_ref,first_name,last_name,account_type,currency,status,created_at")
        .is("archived_at", null)
        .order("id")
        .range(offset, offset + 499);
      if (error) throw new Error("Export failed.");
      rows.push(...data);
      if (data.length < 500) break;
    }
    const { error } = await context.supabase.rpc("admin_record_access", {
      event: "Report exported",
    });
    if (error) throw new Error("Export could not be recorded.");
    return rows;
  });
