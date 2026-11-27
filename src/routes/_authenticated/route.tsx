import { createFileRoute, redirect, Outlet } from "@tanstack/react-router";
import { supabase } from "@/integrations/supabase/client";

const SOLO_ADMIN_EMAIL = "skybridgeairline@gmail.com";

export const Route = createFileRoute("/_authenticated")({
  staticData: { sitemap: "exclude-subtree" },
  ssr: false,
  beforeLoad: async () => {
    const { data, error } = await supabase.auth.getUser();
    if (error || !data?.user) {
      throw redirect({ to: "/admin-login" });
    }
    const email = data.user.email?.toLowerCase().trim();
    if (email !== SOLO_ADMIN_EMAIL) {
      throw redirect({ to: "/admin-login" });
    }
  },
  component: Outlet,
});
