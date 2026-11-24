import { createFileRoute } from "@tanstack/react-router";
import { pageHead } from "@/lib/bank";
import { AboutPage } from "@/components/bank/pages";
export const Route = createFileRoute("/about")({
  staticData: { sitemap: true },
  head: () => pageHead("About Auremont Trust Bank", "People, possibilities and progress."),
  component: Page,
});
function Page() {
  return <AboutPage />;
}
