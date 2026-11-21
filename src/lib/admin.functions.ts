import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { ratesSchema, statsSchema, contactsSchema } from "./bank";
import { z } from "zod";
const contentSchema = z.discriminatedUnion("key", [
  z.object({ key: z.literal("rates"), value: ratesSchema }),
  z.object({ key: z.literal("stats"), value: statsSchema }),
  z.object({ key: z.literal("contacts"), value: contactsSchema }),
]);
export const getAdminData = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { error: roleError } = await context.supabase.rpc("require_primary_administrator", {
      recent: false,
    });
    if (roleError) throw new Error("Primary administrator multi-factor access is required.");
    const { data, error } = await context.supabase
      .from("contact_submissions")
      .select("id,created_at,name,email,topic,message")
      .order("created_at", { ascending: false })
      .limit(100);
    if (error) throw new Error("The inbox could not load.");
    return { inquiries: data };
  });
export const saveContent = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => contentSchema.parse(input))
  .handler(async ({ context, data }) => {
    const { error: roleError } = await context.supabase.rpc("require_primary_administrator", {
      recent: false,
    });
    if (roleError) throw new Error("Primary administrator multi-factor access is required.");
    const { error } = await context.supabase
      .from("site_content")
      .upsert({ key: data.key, value: data.value });
    if (error) throw new Error("Your changes could not be saved.");
    return { success: true };
  });
