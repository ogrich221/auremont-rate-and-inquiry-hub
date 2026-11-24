import { createFileRoute } from "@tanstack/react-router";
import { pageHead } from "@/lib/bank";
import { LegalPage } from "@/components/bank/pages";
export const Route = createFileRoute("/cookies")({
  staticData: { sitemap: true },
  head: () => pageHead("Cookie Policy", "Cookie Policy for the Auremont demonstration website."),
  component: Page,
});
function Page() {
  return <LegalPage kind="cookies" />;
}
