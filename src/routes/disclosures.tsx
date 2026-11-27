import { createFileRoute } from "@tanstack/react-router";
import { pageHead } from "@/lib/bank";
import { LegalPage } from "@/components/bank/pages";
export const Route = createFileRoute("/disclosures")({
  staticData: { sitemap: true },
  head: () =>
    pageHead(
      "Important Disclosures",
      "Important Disclosures and regulatory transparency for Auremont Trust Bank.",
    ),
  component: Page,
});
function Page() {
  return <LegalPage kind="disclosures" />;
}
