import { createFileRoute } from "@tanstack/react-router";
import { pageHead } from "@/lib/bank";
import { RegistrationPage } from "@/components/bank/registration/RegistrationPage";

export const Route = createFileRoute("/open-account")({
  head: () =>
    pageHead(
      "Open an Account",
      "Experience a more confident way to manage your finances. Complete your secure account application with Auremont Trust Bank.",
    ),
  component: Page,
});

function Page() {
  return <RegistrationPage />;
}
