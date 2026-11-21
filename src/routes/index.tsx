import { createFileRoute } from "@tanstack/react-router";
import { queryOptions, useSuspenseQuery } from "@tanstack/react-query";
import { getSiteData } from "@/lib/bank.functions";
import { pageHead } from "@/lib/bank";
import { Home } from "@/components/bank/home";
export const siteQuery = queryOptions({
  queryKey: ["site-content"],
  queryFn: () => getSiteData(),
  staleTime: 60000,
});
export const Route = createFileRoute("/")({
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
  return <Home data={data} />;
}
