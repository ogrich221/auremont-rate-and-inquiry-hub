import { createFileRoute } from "@tanstack/react-router";
import { pageHead } from "@/lib/bank";
import { ProductPage } from "@/components/bank/pages";
export const Route = createFileRoute("/loans")({
  staticData: { sitemap: true },
  head: () => pageHead("Loans & Credit", "Explore illustrative financing possibilities."),
  component: Page,
});
function Page() {
  return <ProductPage kind="loans" />;
}
