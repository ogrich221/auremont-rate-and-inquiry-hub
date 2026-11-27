import { createFileRoute } from "@tanstack/react-router";
import { pageHead } from "@/lib/bank";
import { LegalPage } from "@/components/bank/pages";
export const Route = createFileRoute("/security")({
  staticData: { sitemap: true },
  head: () =>
    pageHead("Security Centre", "Security Centre, fraud prevention, and account protection at Auremont Trust Bank."),
  component: Page,
});
function Page() {
  return <LegalPage kind="security" />;
}
