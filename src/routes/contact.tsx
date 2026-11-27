import { createFileRoute } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { pageHead } from "@/lib/bank";
import { siteQuery } from "./index";
import { ContactPage } from "@/components/bank/pages";
export const Route = createFileRoute("/contact")({
  staticData: { sitemap: true },
  head: () =>
    pageHead(
      "Contact Auremont",
      "Start a conversation with our dedicated client advisory team.",
    ),
  loader: ({ context }) => context.queryClient.ensureQueryData(siteQuery),
  component: Page,
});
function Page() {
  const { data } = useSuspenseQuery(siteQuery);
  return <ContactPage contacts={data.contacts} />;
}
