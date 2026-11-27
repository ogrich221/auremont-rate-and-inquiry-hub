import { createFileRoute } from "@tanstack/react-router";
import { pageHead } from "@/lib/bank";
import { ProductPage } from "@/components/bank/pages";
export const Route = createFileRoute("/cards")({
  staticData: { sitemap: true },
  head: () => pageHead("Debit & Credit Cards", "Modern payment solutions, contactless cards, and elite rewards."),
  component: Page,
});
function Page() {
  return <ProductPage kind="cards" />;
}
