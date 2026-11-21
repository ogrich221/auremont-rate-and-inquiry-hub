import { createFileRoute } from "@tanstack/react-router";
import { AdminWorkspace } from "@/components/bank/admin/workspace";
import { listSchema } from "@/lib/admin-model";
import type { z } from "zod";
export const Route = createFileRoute("/_authenticated/admin")({
  validateSearch: (input: Record<string, unknown>): Partial<z.infer<typeof listSchema>> => {
    const parsed = listSchema.partial().parse(input);
    return {
      ...(parsed.q !== undefined ? { q: parsed.q } : {}),
      ...(parsed.status !== undefined ? { status: parsed.status } : {}),
      ...(parsed.page !== undefined ? { page: parsed.page } : {}),
      ...(parsed.sort !== undefined ? { sort: parsed.sort } : {}),
      ...(parsed.asc !== undefined ? { asc: parsed.asc } : {}),
    };
  },
  component: AdminWorkspace,
});
