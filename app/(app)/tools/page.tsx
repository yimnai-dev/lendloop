import Link from "next/link";
import { PlusIcon } from "lucide-react";
import { Suspense } from "react";
import { PageHeader } from "~/components/app/PageHeader";
import { BrowseTools } from "~/components/tools/BrowseTools";
import { Button } from "~/components/ui/button";

export const metadata = { title: "Browse tools" };

export default function ToolsPage() {
  return (
    <section className="grid grid-cols-1 gap-8">
      <PageHeader
        title="Tools in your neighborhood"
        description="Borrow for up to 14 days. Owners approve each request."
        actions={
          <Button asChild>
            <Link href="/listings/new">
              <PlusIcon aria-hidden />
              List a tool
            </Link>
          </Button>
        }
      />
      {/* Filters read the URL, which is request-time data. */}
      <Suspense>
        <BrowseTools />
      </Suspense>
    </section>
  );
}
