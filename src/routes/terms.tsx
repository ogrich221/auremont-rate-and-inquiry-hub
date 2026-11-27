import { createFileRoute } from "@tanstack/react-router";
import { pageHead } from "@/lib/bank";
import { LegalPage } from "@/components/bank/pages";
export const Route = createFileRoute("/terms")({
  staticData: { sitemap: true },
  head: () =>
    pageHead("Terms & Conditions", "Terms & Conditions of service for Auremont Trust Bank."),
  component: Page,
});
function Page() {
  return <LegalPage kind="terms" />;
}
