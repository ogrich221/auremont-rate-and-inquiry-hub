import { createFileRoute } from "@tanstack/react-router";
import { CustomerProfile } from "@/components/bank/admin/customers";
import { pageHead } from "@/lib/bank";
export const Route = createFileRoute("/_authenticated/admin/customers/$customerId_/edit")({
  head: () =>
    pageHead(
      "Edit Customer Information",
      "Secure Auremont customer editing with recorded old and new values.",
    ),
  component: Page,
});
function Page() {
  const { customerId } = Route.useParams();
  return <CustomerProfile id={customerId} edit />;
}
