import { createFileRoute } from "@tanstack/react-router";
import { pageHead } from "@/lib/bank";
import { ProductPage } from "@/components/bank/pages";
export const Route = createFileRoute("/cards")({
  staticData: { sitemap: true },
  head: () => pageHead("Debit & Credit Cards", "Modern card and payment demonstration."),
  component: Page,
});
function Page() {
  return <ProductPage kind="cards" />;
}
