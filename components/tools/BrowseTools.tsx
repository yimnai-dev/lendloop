"use client";

import { useQuery } from "@confect/react";
import { SearchXIcon } from "lucide-react";
import { useQueryStates } from "nuqs";
import { EmptyState } from "~/components/app/EmptyState";
import { QueryView } from "~/components/app/QueryView";
import { Skeleton } from "~/components/ui/skeleton";
import refs from "~/confect/_generated/refs";
import { browseParams } from "~/lib/searchParams";
import { BrowseFilters } from "./BrowseFilters";
import { ToolCardView } from "./ToolCardView";

const grid = "grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4";

const Loading = () => (
  <div className={grid}>
    {Array.from({ length: 8 }, (_, i) => (
      <Skeleton key={i} className="aspect-[4/5] rounded-2xl" />
    ))}
  </div>
);

export function BrowseTools() {
  const [{ category, trusted }] = useQueryStates(browseParams);
  const tools = useQuery(
    refs.public.tools.browse,
    category === null ? { trustedOnly: trusted } : { category, trustedOnly: trusted },
  );
  return (
    <div className="grid grid-cols-1 gap-6">
      <BrowseFilters />
      <QueryView result={tools} loading={<Loading />}>
        {(cards) =>
          cards.length === 0 ? (
            <EmptyState
              icon={SearchXIcon}
              title="Nothing here yet"
              description="No tools match these filters. Try another category, or list one of yours."
            />
          ) : (
            <div className={grid}>
              {cards.map((tool) => (
                <ToolCardView key={tool._id} tool={tool} />
              ))}
            </div>
          )
        }
      </QueryView>
    </div>
  );
}
