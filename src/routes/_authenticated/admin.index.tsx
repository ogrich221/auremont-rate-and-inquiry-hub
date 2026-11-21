import { createFileRoute } from "@tanstack/react-router";
import { Overview } from "@/components/bank/admin/sections";
import { pageHead } from "@/lib/bank";
export const Route = createFileRoute("/_authenticated/admin/")({
  head: () =>
    pageHead(
      "Central Administration Overview",
      "Private Auremont dashboard with live customer statistics and audit activity.",
    ),
  component: Overview,
});
