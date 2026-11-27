import { createFileRoute } from "@tanstack/react-router";
import { pageHead } from "@/lib/bank";
import { LegalPage } from "@/components/bank/pages";
export const Route = createFileRoute("/careers")({
  staticData: { sitemap: true },
  head: () => pageHead("Careers", "Career opportunities and professional excellence at Auremont Trust Bank."),
  component: Page,
});
function Page() {
  return <LegalPage kind="careers" />;
}
