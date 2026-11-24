import { createFileRoute } from "@tanstack/react-router";
import { pageHead } from "@/lib/bank";
import { ProductPage } from "@/components/bank/pages";
export const Route = createFileRoute("/business-banking")({
  staticData: { sitemap: true },
  head: () => pageHead("Business Banking", "A foundation for your business ambitions."),
  component: Page,
});
function Page() {
  return <ProductPage kind="business" />;
}
