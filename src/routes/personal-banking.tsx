import { createFileRoute } from "@tanstack/react-router";
import { pageHead } from "@/lib/bank";
import { ProductPage } from "@/components/bank/pages";
export const Route = createFileRoute("/personal-banking")({
  staticData: { sitemap: true },
  head: () => pageHead("Personal Banking", "Everyday banking built around your life."),
  component: Page,
});
function Page() {
  return <ProductPage kind="personal" />;
}
