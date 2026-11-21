import { createFileRoute, notFound } from "@tanstack/react-router";
import { AdminSection } from "@/components/bank/admin/sections";
import { sectionSchema, sectionNames } from "@/lib/admin-model";
import { pageHead } from "@/lib/bank";
export const Route = createFileRoute("/_authenticated/admin/$section")({
  beforeLoad: ({ params }) => {
    if (!sectionSchema.safeParse(params.section).success) throw notFound();
  },
  head: ({ params }) =>
    pageHead(
      `Administration · ${sectionNames[sectionSchema.parse(params.section)]}`,
      "Private Auremont customer management and administrative controls.",
    ),
  component: Page,
});
function Page() {
  const { section } = Route.useParams();
  return <AdminSection section={sectionSchema.parse(section)} />;
}
