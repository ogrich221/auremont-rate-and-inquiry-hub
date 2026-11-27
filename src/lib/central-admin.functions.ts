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
  createTransactionSchema,
  updateTransactionSchema,
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
    let customerId = data.id;

    if (data.id) {
      // 1. Try legacy RPC first
      const { data: id, error } = await client.rpc("admin_save_customer", {
        payload: data.customer,
        record_id: data.id,
        expected_version: data.version ?? 0,
      });

      // 2. Direct update to ensure all fields including status are applied
      const updateData: Record<string, any> = {
        first_name: data.customer.first_name,
        middle_name: data.customer.middle_name || "",
        last_name: data.customer.last_name,
        email: data.customer.email.toLowerCase(),
        phone: data.customer.phone || "",
        alternative_phone: data.customer.alternative_phone || "",
        nationality: data.customer.nationality || "",
        country: data.customer.country || "",
        address: data.customer.address || "",
        account_type: data.customer.account_type,
        currency: data.customer.currency,
        notes: data.customer.notes || "",
        updated_at: new Date().toISOString(),
      };
      if (data.customer.date_of_birth) {
        updateData.date_of_birth = data.customer.date_of_birth;
      }
      if (data.customer.status) {
        updateData.status = data.customer.status;
      }

      const { error: updateErr } = await client
        .from("admin_customers")
        .update(updateData)
        .eq("id", data.id);

      if (error && updateErr) {
        if (updateErr.code === "23505" || error.code === "23505")
          throw new Error("A customer with this email already exists.");
        throw new Error("Could not save customer changes. Please try again.");
      }
      customerId = data.id;
    } else {
      const customerRef = `ATB-CUST-${Date.now().toString().slice(-6)}`;
      const accountRef = `9481${Math.floor(100000 + Math.random() * 900000)}`;

      const insertData = {
        customer_ref: customerRef,
        account_ref: accountRef,
        first_name: data.customer.first_name,
        middle_name: data.customer.middle_name || "",
        last_name: data.customer.last_name,
        email: data.customer.email.toLowerCase(),
        phone: data.customer.phone || "",
        alternative_phone: data.customer.alternative_phone || "",
        nationality: data.customer.nationality || "",
        country: data.customer.country || "",
        address: data.customer.address || "",
        account_type: data.customer.account_type,
        currency: data.customer.currency,
        opening_date: data.customer.opening_date || new Date().toISOString().slice(0, 10),
        status: data.customer.status || "Active",
        verification_status: "Verified",
        notes: data.customer.notes || "",
      };

      const { data: newCustomer, error: insertErr } = await client
        .from("admin_customers")
        .insert(insertData)
        .select("id")
        .single();

      if (insertErr || !newCustomer) {
        const { data: id, error: rpcErr } = await client.rpc("admin_save_customer", {
          payload: data.customer,
        });
        if (rpcErr) {
          if (rpcErr.code === "23505" || insertErr?.code === "23505")
            throw new Error("A customer with this email already exists.");
          throw new Error("Could not create customer record. Please try again.");
        }
        customerId = id;
      } else {
        customerId = newCustomer.id;
      }
    }

    return { id: customerId };
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
    if (error) {
      const updateData: Record<string, any> = {
        status: data.status,
        updated_at: new Date().toISOString(),
      };
      if (data.archive) {
        updateData.archived_at = new Date().toISOString();
      }
      const { error: directErr } = await client
        .from("admin_customers")
        .update(updateData)
        .eq("id", data.id);

      if (directErr) {
        throw new Error(
          "Action not completed. Please reload the record before trying again.",
        );
      }
    }
    return { success: true };
  });

export const deleteCustomer = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((v) =>
    z
      .object({
        id: z.string().uuid(),
        permanent: z.boolean().default(true),
      })
      .parse(v),
  )
  .handler(async ({ context, data }) => {
    if (!isSoloAdmin(context.claims)) {
      throw new Error("Administrator verification required.");
    }
    const client = await getDbClient(context.supabase);

    if (data.permanent) {
      try {
        await client.from("admin_transactions").delete().eq("customer_id", data.id);
      } catch {}
      try {
        await client.from("admin_audit").delete().eq("entity_id", data.id);
      } catch {}
      try {
        await client.from("admin_applications").delete().eq("customer_id", data.id);
      } catch {}
      const { error } = await client.from("admin_customers").delete().eq("id", data.id);
      if (error) {
        throw new Error("Could not permanently delete customer. Check linked records.");
      }
      return { success: true, permanent: true };
    } else {
      const { error } = await client
        .from("admin_customers")
        .update({ archived_at: new Date().toISOString(), status: "Closed" })
        .eq("id", data.id);
      if (error) throw new Error("Could not archive customer.");
      return { success: true, permanent: false };
    }
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

export const recordCustomerTransaction = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((v) => createTransactionSchema.parse(v))
  .handler(async ({ context, data }) => {
    if (!isSoloAdmin(context.claims)) {
      throw new Error("Administrator verification required.");
    }
    const client = await getDbClient(context.supabase);

    const { data: customer, error: custErr } = await client
      .from("admin_customers")
      .select("id, first_name, last_name, customer_ref, email")
      .eq("id", data.customer_id)
      .single();

    if (custErr || !customer) {
      throw new Error("Customer record not found.");
    }

    const isCredit = data.type === "Credit" || data.type === "Deposit";
    const ref =
      data.reference ||
      `ATB-${isCredit ? "CR" : "DR"}-${Date.now().toString().slice(-6)}`;

    const dbType =
      data.type === "Credit"
        ? "Deposit"
        : data.type === "Debit"
          ? "Withdrawal"
          : data.type;

    let occurredAtIso = new Date().toISOString();
    try {
      if (data.occurred_at) {
        occurredAtIso = new Date(data.occurred_at).toISOString();
      }
    } catch {
      occurredAtIso = new Date().toISOString();
    }

    const { data: inserted, error: insertErr } = await client
      .from("admin_transactions")
      .insert({
        customer_id: data.customer_id,
        amount: data.amount,
        currency: data.currency,
        occurred_at: occurredAtIso,
        provider_reference: data.narration,
        reference: ref,
        status: data.status,
        transaction_type: dbType,
      })
      .select()
      .single();

    if (insertErr || !inserted) {
      throw new Error(insertErr?.message || "Failed to record transaction.");
    }

    try {
      await client.from("admin_audit").insert({
        actor_id: context.userId,
        action: isCredit ? "Account Credited" : "Account Debited",
        entity: "admin_transactions",
        entity_id: data.customer_id,
        reason: `${data.currency} ${data.amount.toLocaleString()} - ${data.narration}`,
        new_values: {
          reference: ref,
          type: data.type,
          amount: data.amount,
          currency: data.currency,
          narration: data.narration,
          occurred_at: occurredAtIso,
          status: data.status,
        },
      });
    } catch {}

    try {
      await client.from("admin_notifications").insert({
        title: `${isCredit ? "Credit" : "Debit"} Posted: ${data.currency} ${data.amount}`,
        body: `Posted to ${customer.first_name} ${customer.last_name} (${ref}): ${data.narration}`,
        entity_id: data.customer_id,
      });
    } catch {}

    return { success: true, transaction: inserted };
  });

export const updateCustomerTransaction = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((v) => updateTransactionSchema.parse(v))
  .handler(async ({ context, data }) => {
    if (!isSoloAdmin(context.claims)) {
      throw new Error("Administrator verification required.");
    }
    const client = await getDbClient(context.supabase);

    const { data: existing, error: existErr } = await client
      .from("admin_transactions")
      .select("*")
      .eq("id", data.id)
      .single();

    if (existErr || !existing) {
      throw new Error("Transaction not found.");
    }

    const updates: Record<string, any> = {};
    if (data.amount !== undefined) updates.amount = data.amount;
    if (data.currency !== undefined) updates.currency = data.currency;
    if (data.status !== undefined) updates.status = data.status;
    if (data.narration !== undefined) updates.provider_reference = data.narration;
    if (data.type !== undefined) {
      updates.transaction_type =
        data.type === "Credit"
          ? "Deposit"
          : data.type === "Debit"
            ? "Withdrawal"
            : data.type;
    }
    if (data.occurred_at !== undefined) {
      try {
        updates.occurred_at = new Date(data.occurred_at).toISOString();
      } catch {
        updates.occurred_at = data.occurred_at;
      }
    }

    const { data: updated, error: updateErr } = await client
      .from("admin_transactions")
      .update(updates)
      .eq("id", data.id)
      .select()
      .single();

    if (updateErr) {
      throw new Error(updateErr.message || "Failed to update transaction.");
    }

    try {
      await client.from("admin_audit").insert({
        actor_id: context.userId,
        action: "Transaction Modified",
        entity: "admin_transactions",
        entity_id: existing.customer_id,
        reason: `Updated transaction ${existing.reference}`,
        old_values: {
          occurred_at: existing.occurred_at,
          narration: existing.provider_reference,
          amount: existing.amount,
          status: existing.status,
        },
        new_values: updates,
      });
    } catch {}

    return { success: true, transaction: updated };
  });

export const deleteCustomerTransaction = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((v) => z.object({ id: z.string().uuid() }).parse(v))
  .handler(async ({ context, data }) => {
    if (!isSoloAdmin(context.claims)) {
      throw new Error("Administrator verification required.");
    }
    const client = await getDbClient(context.supabase);

    const { data: existing } = await client
      .from("admin_transactions")
      .select("customer_id, reference")
      .eq("id", data.id)
      .single();

    const { error } = await client
      .from("admin_transactions")
      .delete()
      .eq("id", data.id);

    if (error) {
      throw new Error("Failed to delete transaction.");
    }

    if (existing) {
      try {
        await client.from("admin_audit").insert({
          actor_id: context.userId,
          action: "Transaction Removed",
          entity: "admin_transactions",
          entity_id: existing.customer_id,
          reason: `Removed transaction ${existing.reference}`,
        });
      } catch {}
    }

    return { success: true };
  });

export const getCustomerTransactions = createServerFn({ method: "POST" })
  .inputValidator((v) =>
    z
      .object({
        customerId: z.string().uuid().optional(),
        email: z.string().email().optional(),
      })
      .optional()
      .default({}),
  )
  .handler(async ({ context, data }) => {
    let client: any = context.supabase;
    try {
      const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
      if (supabaseAdmin) client = supabaseAdmin;
    } catch {}

    let targetCustomerId = data?.customerId;

    const emailToLookup =
      data?.email ||
      (context.claims?.["email"] ? String(context.claims["email"]) : undefined);

    if (!targetCustomerId && emailToLookup && client) {
      try {
        const { data: cust } = await client
          .from("admin_customers")
          .select("id")
          .eq("email", emailToLookup.toLowerCase().trim())
          .maybeSingle();
        if (cust) {
          targetCustomerId = cust.id;
        }
      } catch {}
    }

    let rows: any[] = [];
    if (client) {
      try {
        let query = client
          .from("admin_transactions")
          .select("*")
          .order("occurred_at", { ascending: false });

        if (targetCustomerId) {
          query = query.eq("customer_id", targetCustomerId);
        } else {
          query = query.limit(100);
        }

        const { data: resRows } = await query;
        if (resRows) rows = resRows;
      } catch {}
    }

    const transactions = (rows ?? []).map((row: any) => {
      const isDeposit =
        row.transaction_type === "Deposit" || row.transaction_type === "Credit";
      return {
        id: row.id,
        reference: row.reference,
        type: isDeposit ? "Deposit" : "Withdrawal",
        recipientMerchant: isDeposit
          ? "Private Wealth Settlement / Credit"
          : (row.provider_reference || "Account Debit"),
        date: row.occurred_at
          ? new Date(row.occurred_at).toISOString().replace("T", " ").slice(0, 16)
          : new Date().toISOString().replace("T", " ").slice(0, 16),
        amount: Number(row.amount),
        currency: row.currency || "USD",
        status: row.status || "Completed",
        fee: 0,
        description: row.provider_reference || "Private Banking Transaction",
        category: isDeposit ? "Income" : "Debit / Transfers",
        rawOccurredAt: row.occurred_at,
      };
    });

    return { transactions };
  });

export const checkUserLoginStatus = createServerFn({ method: "POST" })
  .inputValidator((v) => z.object({ email: z.string().email() }).parse(v))
  .handler(async ({ context, data }) => {
    const email = data.email.toLowerCase().trim();

    // Solo admin is always authorized
    if (email === SOLO_ADMIN_EMAIL) {
      return { allowed: true, status: "Active", reason: null };
    }

    let client: any = context.supabase;
    try {
      const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
      if (supabaseAdmin) client = supabaseAdmin;
    } catch {}

    if (!client) {
      return { allowed: true, status: "Active", reason: null };
    }

    const { data: customer } = await client
      .from("admin_customers")
      .select("id, email, status, first_name, last_name")
      .eq("email", email)
      .maybeSingle();

    if (!customer) {
      const { data: app } = await client
        .from("admin_applications")
        .select("status")
        .eq("email", email)
        .maybeSingle();

      if (app && app.status !== "Approved") {
        return {
          allowed: false,
          status: "Pending",
          reason: "Your application is currently pending administrator review. You cannot log in until your account is approved.",
        };
      }

      return {
        allowed: false,
        status: "Pending",
        reason: "Account pending administrative approval. An administrator must approve your account before you can log in.",
      };
    }

    if (customer.status === "Pending") {
      return {
        allowed: false,
        status: "Pending",
        reason: "Your account is pending administrator approval. Please wait for an administrator to review and approve your account before signing in.",
      };
    }

    if (customer.status === "Suspended") {
      return {
        allowed: false,
        status: "Suspended",
        reason: "Your account has been suspended by the administrator. Please contact Auremont client services.",
      };
    }

    if (customer.status === "Closed" || customer.status === "Restricted") {
      return {
        allowed: false,
        status: customer.status,
        reason: `Your account is marked as ${customer.status.toLowerCase()}. Access is restricted.`,
      };
    }

    return { allowed: true, status: "Active", reason: null };
  });

export const registerPendingCustomer = createServerFn({ method: "POST" })
  .inputValidator((v) => z.object({ email: z.string().email(), name: z.string().optional() }).parse(v))
  .handler(async ({ context, data }) => {
    const email = data.email.toLowerCase().trim();
    if (email === SOLO_ADMIN_EMAIL) return { success: true };

    const client = await getDbClient(context.supabase);
    const nameParts = (data.name || email.split("@")[0] || "Client").split(" ");
    const firstName = nameParts[0] || "Client";
    const lastName = nameParts.slice(1).join(" ") || "User";

    const customerRef = `ATB-REG-${Date.now().toString().slice(-6)}`;
    const accountRef = `9481${Math.floor(100000 + Math.random() * 900000)}`;

    const { error } = await client.from("admin_customers").upsert(
      {
        email,
        first_name: firstName,
        last_name: lastName,
        customer_ref: customerRef,
        account_ref: accountRef,
        account_type: "Personal",
        currency: "USD",
        status: "Pending",
        verification_status: "Pending",
      },
      { onConflict: "email" },
    );

    try {
      await client.from("admin_notifications").insert({
        title: "New User Registered (Pending Approval)",
        body: `${email} has registered and requires administrator approval before logging in.`,
      });
    } catch {}

    return { success: !error };
  });

export const approveUserCustomer = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((v) => z.object({ id: z.string().uuid() }).parse(v))
  .handler(async ({ context, data }) => {
    if (!isSoloAdmin(context.claims)) {
      throw new Error("Administrator verification required.");
    }
    const client = await getDbClient(context.supabase);

    const { data: customer, error: custErr } = await client
      .from("admin_customers")
      .update({
        status: "Active",
        updated_at: new Date().toISOString(),
      })
      .eq("id", data.id)
      .select("id, email, first_name, last_name, customer_ref")
      .single();

    if (custErr || !customer) {
      throw new Error("Failed to approve user account.");
    }

    try {
      await client.from("admin_audit").insert({
        actor_id: context.userId,
        action: "User Approved",
        entity: "admin_customers",
        entity_id: customer.id,
        reason: `Administrator approved account for ${customer.first_name} ${customer.last_name} (${customer.email}). User is now permitted to log in.`,
      });
    } catch {}

    try {
      await client.from("admin_notifications").insert({
        title: "User Account Approved",
        body: `${customer.first_name} ${customer.last_name} (${customer.email}) approved for login access.`,
        entity_id: customer.id,
      });
    } catch {}

    return { success: true, customer };
  });

export const submitCustomerTransfer = createServerFn({ method: "POST" })
  .inputValidator(
    (v) =>
      z
        .object({
          email: z.string().email().optional(),
          recipient: z.string().min(1),
          amount: z.number().positive(),
          currency: z.string().default("USD"),
          type: z.string().default("Domestic Transfer"),
          description: z.string().default("Transfer"),
          reference: z.string(),
        })
        .parse(v),
  )
  .handler(async ({ context, data }) => {
    let client: any = context.supabase;
    try {
      const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
      if (supabaseAdmin) client = supabaseAdmin;
    } catch {}

    const email =
      data.email ||
      (context.claims?.["email"] ? String(context.claims["email"]) : undefined);

    let customerId = "";
    if (email && client) {
      try {
        const { data: cust } = await client
          .from("admin_customers")
          .select("id")
          .eq("email", email.toLowerCase().trim())
          .maybeSingle();
        if (cust) customerId = cust.id;
      } catch {}
    }

    if (!customerId && client) {
      try {
        const { data: anyCust } = await client
          .from("admin_customers")
          .select("id")
          .limit(1)
          .maybeSingle();
        if (anyCust) customerId = anyCust.id;
      } catch {}
    }

    if (client && customerId) {
      try {
        await client.from("admin_transactions").insert({
          customer_id: customerId,
          amount: data.amount,
          currency: data.currency,
          occurred_at: new Date().toISOString(),
          provider_reference: `${data.description} (To: ${data.recipient})`,
          reference: data.reference,
          status: "Pending",
          transaction_type: data.type,
        });

        await client.from("admin_notifications").insert({
          title: `Transfer Awaiting Approval: ${data.currency} ${data.amount.toLocaleString()}`,
          body: `Transfer to ${data.recipient} (${data.reference}) is awaiting compliance approval before settlement.`,
          entity_id: customerId,
        });

        await client.from("admin_audit").insert({
          actor_id: customerId,
          action: "Transfer Initiated (Pending Approval)",
          entity: "admin_transactions",
          entity_id: customerId,
          reason: `User scheduled ${data.type} of ${data.currency} ${data.amount} to ${data.recipient}. Awaiting admin authorization.`,
        });
      } catch (err) {
        console.warn("Could not record pending transfer to admin_transactions:", err);
      }
    }

    return { success: true, reference: data.reference, status: "Pending" };
  });

export const approveTransferTransaction = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((v) => z.object({ id: z.string().uuid() }).parse(v))
  .handler(async ({ context, data }) => {
    if (!isSoloAdmin(context.claims)) {
      throw new Error("Administrator verification required.");
    }
    const client = await getDbClient(context.supabase);

    const { data: existing, error: existErr } = await client
      .from("admin_transactions")
      .select("*")
      .eq("id", data.id)
      .single();

    if (existErr || !existing) {
      throw new Error("Transaction not found.");
    }

    const { data: updated, error: updateErr } = await client
      .from("admin_transactions")
      .update({ status: "Completed" })
      .eq("id", data.id)
      .select()
      .single();

    if (updateErr) {
      throw new Error("Failed to approve transfer.");
    }

    try {
      await client.from("admin_audit").insert({
        actor_id: context.userId,
        action: "Transfer Approved",
        entity: "admin_transactions",
        entity_id: existing.customer_id,
        reason: `Administrator approved transfer ${existing.reference} (${existing.currency} ${existing.amount}). Settlement complete.`,
      });
    } catch {}

    try {
      await client.from("admin_notifications").insert({
        title: `Transfer Settled: ${existing.reference}`,
        body: `Transfer of ${existing.currency} ${existing.amount} approved and settled.`,
        entity_id: existing.customer_id,
      });
    } catch {}

    return { success: true, transaction: updated };
  });

export const rejectTransferTransaction = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((v) => z.object({ id: z.string().uuid(), reason: z.string().optional() }).parse(v))
  .handler(async ({ context, data }) => {
    if (!isSoloAdmin(context.claims)) {
      throw new Error("Administrator verification required.");
    }
    const client = await getDbClient(context.supabase);

    const { data: existing } = await client
      .from("admin_transactions")
      .select("*")
      .eq("id", data.id)
      .single();

    if (!existing) {
      throw new Error("Transaction not found.");
    }

    const { data: updated, error: updateErr } = await client
      .from("admin_transactions")
      .update({ status: "Failed" })
      .eq("id", data.id)
      .select()
      .single();

    if (updateErr) {
      throw new Error("Failed to reject transfer.");
    }

    try {
      await client.from("admin_audit").insert({
        actor_id: context.userId,
        action: "Transfer Declined",
        entity: "admin_transactions",
        entity_id: existing.customer_id,
        reason: `Administrator declined transfer ${existing.reference}. Reason: ${data.reason || "Compliance review rejection"}`,
      });
    } catch {}

    return { success: true, transaction: updated };
  });
