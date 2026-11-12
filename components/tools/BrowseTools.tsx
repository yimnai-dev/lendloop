"use client";

import { usePaginatedQuery } from "@confect/react";
import { SearchXIcon } from "lucide-react";
import Link from "next/link";
import { useQueryStates } from "nuqs";
import { EmptyState } from "~/components/app/EmptyState";
import { PagedView } from "~/components/app/PagedView";
import { Button } from "~/components/ui/button";
import { Skeleton } from "~/components/ui/skeleton";
import refs from "~/confect/_generated/refs";
import { browseParams } from "~/lib/searchParams";
import { BrowseFilters } from "./BrowseFilters";
import { ToolCardView } from "./ToolCardView";

const PAGE_SIZE = 12;
const grid = "grid gap-x-7 gap-y-12 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4";

const Loading = () => (
  <div className={grid}>
    {Array.from({ length: 8 }, (_, i) => (
      <div key={i} className="grid gap-3">
        <Skeleton className="aspect-[4/5] rounded-md" />
        <Skeleton className="h-6 w-2/3" />
        <Skeleton className="h-4 w-1/3" />
      </div>
    ))}
  </div>
);

export function BrowseTools() {
  const [{ category, trusted }] = useQueryStates(browseParams);
  const tools = usePaginatedQuery(
    refs.public.tools.browse,
    category === null ? { trustedOnly: trusted } : { category, trustedOnly: trusted },
    { initialNumItems: PAGE_SIZE },
  );
  return (
    <div className="grid grid-cols-1 gap-10">
      <BrowseFilters />
      <PagedView
        result={tools}
        pageSize={PAGE_SIZE}
        noun="tools"
        loading={<Loading />}
        empty={
          <EmptyState
            icon={SearchXIcon}
            title="Nothing on this shelf"
            description="No tools match these filters yet. Try another category, or lend one of yours."
            action={
              <Button asChild variant="outline">
                <Link href="/listings/new">List a tool</Link>
              </Button>
            }
          />
        }
      >
        {(cards) => (
          <div className={grid}>
            {cards.map((tool) => (
              <ToolCardView key={tool._id} tool={tool} />
            ))}
          </div>
        )}
      </PagedView>
    </div>
  );
}
