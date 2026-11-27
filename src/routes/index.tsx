import { createFileRoute } from "@tanstack/react-router";
import { queryOptions, useSuspenseQuery } from "@tanstack/react-query";
import { getSiteData } from "@/lib/bank.functions";
import { pageHead } from "@/lib/bank";
import { EditorialHome } from "@/components/bank/home-editorial";
export const siteQuery = queryOptions({
  queryKey: ["site-content"],
  queryFn: () => getSiteData(),
  staleTime: 60000,
});
export const Route = createFileRoute("/")({
  staticData: { sitemap: true },
  head: () =>
    pageHead(
      "A Higher Standard of Banking",
      "Explore Auremont’s personal, business and digital banking demonstration. Your Wealth. Your Future. Our Commitment.",
    ),
  loader: ({ context }) => context.queryClient.ensureQueryData(siteQuery),
  component: Index,
});
function Index() {
  const { data } = useSuspenseQuery(siteQuery);
  return <EditorialHome data={data} />;
}
