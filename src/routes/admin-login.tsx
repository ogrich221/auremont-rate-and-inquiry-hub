import { createFileRoute } from "@tanstack/react-router";
import { AdminLogin } from "@/components/bank/admin/access";
import { pageHead } from "@/lib/bank";
export const Route = createFileRoute("/admin-login")({
  staticData: { sitemap: false },
  head: () => ({
    ...pageHead(
      "Administrator Access",
      "Dedicated Auremont administrator access with multi-factor verification.",
    ),
    meta: [
      ...pageHead(
        "Administrator Access",
        "Dedicated Auremont administrator access with multi-factor verification.",
      ).meta,
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
  component: AdminLogin,
});
