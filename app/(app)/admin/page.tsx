import { Suspense } from "react";
import { AdminConsole } from "~/components/admin/AdminConsole";

/** Visible to anyone signed in; every query behind it is admin-only in Convex. */
export default function AdminPage() {
  return (
    <section className="grid gap-6">
      <h1 className="text-2xl font-semibold">Admin</h1>
      <Suspense>
        <AdminConsole />
      </Suspense>
    </section>
  );
}
