import { createFileRoute } from "@tanstack/react-router";
import { pageHead } from "@/lib/bank";
import { LegalPage } from "@/components/bank/pages";
export const Route = createFileRoute("/privacy")({
  staticData: { sitemap: true },
  head: () => pageHead("Privacy Policy", "Privacy Policy and information protection at Auremont Trust Bank."),
  component: Page,
});
function Page() {
  return <LegalPage kind="privacy" />;
}
