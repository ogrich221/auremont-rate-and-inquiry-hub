import { createFileRoute, redirect } from "@tanstack/react-router";
import { pageHead } from "@/lib/bank";
export const Route = createFileRoute("/auth")({
  head: () =>
    pageHead("Secure Workspace Sign In", "Sign in to the Auremont administration workspace."),
  beforeLoad: () => {
    throw redirect({ to: "/admin-login" });
  },
});
