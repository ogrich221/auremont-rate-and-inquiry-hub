import { createFileRoute } from "@tanstack/react-router";
import { CustomerProfile } from "@/components/bank/admin/customers";
import { pageHead } from "@/lib/bank";
export const Route = createFileRoute("/_authenticated/admin/customers/$customerId")({
  staticData: { sitemap: false },
  head: () =>
    pageHead(
      "Customer Profile",
      "Access-controlled Auremont customer information and administrative history.",
    ),
  component: Page,
});
function Page() {
  const { customerId } = Route.useParams();
  return <CustomerProfile id={customerId} />;
}
