import { createFileRoute } from "@tanstack/react-router";
import { pageHead } from "@/lib/bank";
import { UpdatePassword } from "@/components/bank/auth";
export const Route = createFileRoute("/update-password")({
  staticData: { sitemap: false },
  head: () => {
    const head = pageHead("Update Password", "Update your demo website password.");
    return { ...head, meta: [...(head.meta ?? []), { name: "robots", content: "noindex, nofollow" }] };
  },
  component: UpdatePassword,
});
