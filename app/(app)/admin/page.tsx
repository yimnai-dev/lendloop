import { Suspense } from "react";
import { AdminConsole } from "~/components/admin/AdminConsole";
import { PageHeader } from "~/components/app/PageHeader";

export const metadata = { title: "Admin" };

/** Visible to anyone signed in; every query behind it is admin-only in Convex. */
export default function AdminPage() {
  return (
    <section className="grid gap-8">
      <PageHeader
        title="Admin"
        description="Every loan, every neighbor, and the automations behind the emails."
      />
      <Suspense>
        <AdminConsole />
      </Suspense>
    </section>
  );
}
