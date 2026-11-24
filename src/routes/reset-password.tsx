import { createFileRoute } from "@tanstack/react-router";
import { pageHead } from "@/lib/bank";
import { AuthPage } from "@/components/bank/auth";
export const Route = createFileRoute("/reset-password")({
  staticData: { sitemap: false },
  head: () => {
    const head = pageHead(
      "Reset Password",
      "Secure access to the Auremont demo website. No real banking services.",
    );
    return { ...head, meta: [...(head.meta ?? []), { name: "robots", content: "noindex, nofollow" }] };
  },
  component: Page,
});
function Page() {
  return <AuthPage mode="reset" />;
}
