import { createFileRoute } from "@tanstack/react-router";
import { pageHead } from "@/lib/bank";
import { UpdatePassword } from "@/components/bank/auth";
export const Route = createFileRoute("/update-password")({
  head: () => pageHead("Update Password", "Update your demo website password."),
  component: UpdatePassword,
});
