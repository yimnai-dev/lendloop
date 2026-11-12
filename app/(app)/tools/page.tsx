import { Suspense } from "react";
import { PageHeader } from "~/components/app/PageHeader";
import { BrowseTools } from "~/components/tools/BrowseTools";

export const metadata = { title: "Browse tools" };

export default function ToolsPage() {
  return (
    <section className="grid grid-cols-1 gap-12">
      <PageHeader
        eyebrow="The shed"
        title={
          <>
            Borrow what you need,
            <br />
            <em className="text-muted-foreground">from people nearby.</em>
          </>
        }
        description="Ask an owner for up to fourteen days. Their email is shared only once they say yes."
      />
      {/* Filters read the URL, which is request-time data. */}
      <Suspense>
        <BrowseTools />
      </Suspense>
    </section>
  );
}
