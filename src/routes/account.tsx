import { createFileRoute } from "@tanstack/react-router";
import { pageHead } from "@/lib/bank";
import { AccountPage } from "@/components/bank/account";
export const Route = createFileRoute("/account")({
  staticData: { sitemap: false },
  head: () =>
    pageHead("Account Overview", "Secure access to your Auremont banking accounts and portfolio."),
  component: AccountPage,
});
