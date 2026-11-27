import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { ratesSchema, statsSchema, contactsSchema } from "./bank";
import { z } from "zod";

const SOLO_ADMIN_EMAIL = "skybridgeairline@gmail.com";

const contentSchema = z.discriminatedUnion("key", [
  z.object({ key: z.literal("rates"), value: ratesSchema }),
  z.object({ key: z.literal("stats"), value: statsSchema }),
  z.object({ key: z.literal("contacts"), value: contactsSchema }),
]);

async function getDbClient(fallbackClient: any) {
  try {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    if (supabaseAdmin) return supabaseAdmin;
  } catch {}
  return fallbackClient;
}

export const getAdminData = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const userEmail = String(context.claims["email"] ?? "").toLowerCase().trim();
    if (userEmail !== SOLO_ADMIN_EMAIL) {
      throw new Error("Primary administrator access is required.");
    }

    try {
      await context.supabase.rpc("require_primary_administrator", { recent: false });
    } catch {}

    const client = await getDbClient(context.supabase);
    const { data, error } = await client
      .from("contact_submissions")
      .select("id,created_at,name,email,topic,message")
      .order("created_at", { ascending: false })
      .limit(100);
    if (error) throw new Error("The inbox could not load.");
    return { inquiries: data ?? [] };
  });

export const saveContent = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => contentSchema.parse(input))
  .handler(async ({ context, data }) => {
    const userEmail = String(context.claims["email"] ?? "").toLowerCase().trim();
    if (userEmail !== SOLO_ADMIN_EMAIL) {
      throw new Error("Primary administrator access is required.");
    }

    try {
      await context.supabase.rpc("require_primary_administrator", { recent: false });
    } catch {}

    const client = await getDbClient(context.supabase);
    const { error } = await client
      .from("site_content")
      .upsert({ key: data.key, value: data.value });
    if (error) throw new Error("Your changes could not be saved.");
    return { success: true };
  });
