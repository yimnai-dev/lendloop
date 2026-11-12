import { Suspense } from "react";
import { BrowseTools } from "~/components/tools/BrowseTools";

export default function ToolsPage() {
  return (
    <section className="grid gap-6">
      <h1 className="text-2xl font-semibold">Tools in your neighborhood</h1>
      {/* Filters read the URL, which is request-time data. */}
      <Suspense>
        <BrowseTools />
      </Suspense>
    </section>
  );
}
