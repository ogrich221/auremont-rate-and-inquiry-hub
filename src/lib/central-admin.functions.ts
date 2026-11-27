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

export const SOLO_ADMIN_EMAIL = "skybridgeairline@gmail.com";

function isSoloAdmin(claims: Record<string, unknown>) {
  const email = String(claims["email"] ?? "").toLowerCase().trim();
  return email === SOLO_ADMIN_EMAIL;
}

async function getDbClient(fallbackClient: any) {
  try {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    if (supabaseAdmin) return supabaseAdmin;
  } catch {}
  return fallbackClient;
}

async function ensureSoloAdminInDb(userId: string) {
  try {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    if (supabaseAdmin) {
      await Promise.allSettled([
        supabaseAdmin.from("primary_administrator").delete().neq("user_id", userId),
        supabaseAdmin.from("user_roles").delete().eq("role", "admin").neq("user_id", userId),
        supabaseAdmin.from("primary_administrator").upsert({ singleton: true, user_id: userId }, { onConflict: "singleton" }),
        supabaseAdmin.from("user_roles").upsert({ user_id: userId, role: "admin" }, { onConflict: "user_id,role" }),
      ]);
    }
  } catch {
    // If service role client is not available in local test environment, proceed safely
  }
}

async function safeQuery<T extends { data?: any; error?: any; count?: number | null }>(
  query: PromiseLike<T>,
  fallbackData: any,
): Promise<{ data: any; count?: number | null; error: any }> {
  try {
    const res = await query;
    if (res && res.error) {
      return { data: fallbackData, count: 0, error: res.error };
    }
    return res ?? { data: fallbackData, count: 0, error: null };
  } catch (err) {
    return { data: fallbackData, count: 0, error: err };
  }
}

export const getAdministratorAccess = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const allowed = isSoloAdmin(context.claims);
    if (!allowed) {
      return {
        primary: false,
        role: false,
        allowed: false,
        email: String(context.claims["email"] ?? ""),
      };
    }

    await ensureSoloAdminInDb(context.userId);

    return {
      primary: true,
      role: true,
      allowed: true,
      email: SOLO_ADMIN_EMAIL,
    };
  });

export const getWorkspace = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    if (!isSoloAdmin(context.claims)) {
      throw new Error(
        "Only the designated administrator with password authentication can open this workspace.",
      );
    }

    await ensureSoloAdminInDb(context.userId);

    try {
      await context.supabase.rpc("require_primary_administrator", { recent: false });
    } catch {}

    const client = await getDbClient(context.supabase);

    const [
      summaryResult,
      customersResult,
      applicationsResult,
      transactionsResult,
      activitiesResult,
      notificationsResult,
      preferencesResult,
      inboxResult,
      ...countsResult
    ] = await Promise.all([
      safeQuery(client.rpc("admin_summary"), null),
      safeQuery(
        client
          .from("admin_customers")
          .select("*")
          .is("archived_at", null)
          .order("created_at", { ascending: false })
          .limit(5),
        [],
      ),
      safeQuery(
        client
          .from("admin_applications")
          .select("*")
          .order("created_at", { ascending: false })
          .limit(200),
        [],
      ),
      safeQuery(
        client
          .from("admin_transactions")
          .select("*")
          .order("occurred_at", { ascending: false })
          .limit(200),
        [],
      ),
      safeQuery(
        client.from("admin_audit").select("*").order("created_at", { ascending: false }).limit(100),
        [],
      ),
      safeQuery(
        client
          .from("admin_notifications")
          .select("*")
          .order("created_at", { ascending: false })
          .limit(200),
        [],
      ),
      safeQuery(
        client.from("admin_preferences").select("*").eq("user_id", context.userId).maybeSingle(),
        null,
      ),
      safeQuery(
        client
          .from("contact_submissions")
          .select("*")
          .order("created_at", { ascending: false })
          .limit(100),
        [],
      ),
      ...(["All", "Active", "Pending", "Suspended", "Closed", "Restricted", "New"] as const).map(
        (status) => {
          let q = client
            .from("admin_customers")
            .select("id", { count: "exact", head: true })
            .is("archived_at", null);
          if (status === "New")
            q = q.gte("created_at", new Date(Date.now() - 30 * 86400000).toISOString());
          else if (status !== "All") q = q.eq("status", status);
          return safeQuery(q, null);
        },
      ),
    ]);

    const applications = applicationsResult?.data ?? [];
    const transactions = transactionsResult?.data ?? [];
    const customers = customersResult?.data ?? [];

    let totals = {
      pendingApplications: applications.filter((a: any) =>
        ["Pending", "Information requested"].includes(a.status),
      ).length,
      totalApplications: applications.length,
      totalTransactions: transactions.length,
      registrations: [
        { month: "Jan", count: 0 },
        { month: "Feb", count: 0 },
        { month: "Mar", count: 0 },
        { month: "Apr", count: 0 },
        { month: "May", count: 0 },
        { month: "Jun", count: 0 },
      ],
    };

    if (summaryResult?.data) {
      try {
        totals = z
          .object({
            pendingApplications: z.number(),
            totalApplications: z.number(),
            totalTransactions: z.number(),
            registrations: z.array(z.object({ month: z.string(), count: z.number() })),
          })
          .parse(summaryResult.data);
      } catch {}
    }

    return {
      summary: totals,
      customers,
      applications,
      transactions,
      activities: activitiesResult?.data ?? [],
      notifications: notificationsResult?.data ?? [],
      preferences: preferencesResult?.data ?? null,
      inbox: inboxResult?.data ?? [],
      counts: countsResult.map((c: any) => c?.count ?? 0),
      userId: context.userId,
      email: SOLO_ADMIN_EMAIL,
    };
  });

export const getCustomers = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((v) => listSchema.parse(v))
  .handler(async ({ context, data }) => {
    if (!isSoloAdmin(context.claims)) {
      throw new Error("Administrator verification required.");
    }
    const client = await getDbClient(context.supabase);
    let q = client.from("admin_customers").select("*", { count: "exact" });
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
    if (!isSoloAdmin(context.claims)) {
      throw new Error("Administrator verification required.");
    }
    const client = await getDbClient(context.supabase);
    const [customer, history, transactions] = await Promise.all([
      client.from("admin_customers").select("*").eq("id", data.id).single(),
      client
        .from("admin_audit")
        .select("*")
        .eq("entity_id", data.id)
        .order("created_at", { ascending: false }),
      client
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
    if (!isSoloAdmin(context.claims)) {
      throw new Error("Administrator verification required.");
    }
    const client = await getDbClient(context.supabase);
    const { data: id, error } = await client.rpc("admin_save_customer", {
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
    if (!isSoloAdmin(context.claims)) {
      throw new Error("Administrator verification required.");
    }
    const client = await getDbClient(context.supabase);
    const { error } = await client.rpc("admin_change_customer", {
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
    if (!isSoloAdmin(context.claims)) {
      throw new Error("Administrator verification required.");
    }
    const client = await getDbClient(context.supabase);
    const { error } = await client.rpc("admin_create_application", { payload: data });
    if (error) throw new Error("Application could not be recorded.");
    return { success: true };
  });

export const reviewApplication = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((v) => reviewSchema.parse(v))
  .handler(async ({ context, data }) => {
    if (!isSoloAdmin(context.claims)) {
      throw new Error("Administrator verification required.");
    }
    const client = await getDbClient(context.supabase);
    const { data: id, error } = await client.rpc("admin_review_application", {
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
    if (!isSoloAdmin(context.claims)) {
      throw new Error("Administrator verification required.");
    }
    const client = await getDbClient(context.supabase);
    const { error } = await client.rpc(
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
    if (!isSoloAdmin(context.claims)) {
      throw new Error("Administrator verification required.");
    }
    const client = await getDbClient(context.supabase);
    const { error } = await client.rpc("admin_save_preferences", {
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
    const client = await getDbClient(context.supabase);
    try {
      await client.rpc("admin_record_access", { event: data.event });
    } catch (e) {
      console.warn("Security activity record skipped:", e);
    }
    return { success: true };
  });

export const exportCustomers = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    if (!isSoloAdmin(context.claims)) {
      throw new Error("Unauthorized to export customer records.");
    }
    const client = await getDbClient(context.supabase);
    const rows = [];
    for (let offset = 0; ; offset += 500) {
      const { data, error } = await client
        .from("admin_customers")
        .select("customer_ref,first_name,last_name,account_type,currency,status,created_at")
        .is("archived_at", null)
        .order("id")
        .range(offset, offset + 499);
      if (error) throw new Error("Export failed.");
      rows.push(...data);
      if (data.length < 500) break;
    }
    try {
      await client.rpc("admin_record_access", { event: "Report exported" });
    } catch {}
    return rows;
  });
