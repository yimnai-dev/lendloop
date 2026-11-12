import { Suspense } from "react";
import { AdminConsole } from "~/components/admin/AdminConsole";
import { PageHeader } from "~/components/app/PageHeader";

export const metadata = { title: "Admin" };

/** Visible to anyone signed in; every query behind it is admin-only in Convex. */
export default function AdminPage() {
  return (
    <section className="grid grid-cols-1 gap-12">
      <PageHeader
        eyebrow="Neighborhood admin"
        title="The ledger"
        description="Every loan and neighbor, plus the automations that send the emails."
      />
      <Suspense>
        <AdminConsole />
      </Suspense>
    </section>
  );
}
