import { createFileRoute } from "@tanstack/react-router";
import { pageHead } from "@/lib/bank";
import { LegalPage } from "@/components/bank/pages";
export const Route = createFileRoute("/careers")({
  staticData: { sitemap: true },
  head: () => pageHead("Careers", "Careers for the Auremont demonstration website."),
  component: Page,
});
function Page() {
  return <LegalPage kind="careers" />;
}
