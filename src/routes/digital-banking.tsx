import { createFileRoute } from "@tanstack/react-router";
import { pageHead } from "@/lib/bank";
import { ProductPage } from "@/components/bank/pages";
export const Route = createFileRoute("/digital-banking")({
  staticData: { sitemap: true },
  head: () => pageHead("Digital Banking", "A connected demonstration banking experience."),
  component: Page,
});
function Page() {
  return <ProductPage kind="digital" />;
}
