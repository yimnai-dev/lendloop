"use client";

import { useQuery } from "@confect/react";
import { useQueryStates } from "nuqs";
import { QueryView } from "~/components/app/QueryView";
import refs from "~/confect/_generated/refs";
import { browseParams } from "~/lib/searchParams";
import { BrowseFilters } from "./BrowseFilters";
import { ToolCardView } from "./ToolCardView";

export function BrowseTools() {
  const [{ category, trusted }] = useQueryStates(browseParams);
  const tools = useQuery(
    refs.public.tools.browse,
    category === null ? { trustedOnly: trusted } : { category, trustedOnly: trusted },
  );
  return (
    <div className="grid gap-6">
      <BrowseFilters />
      <QueryView result={tools}>
        {(cards) =>
          cards.length === 0 ? (
            <p className="text-muted-foreground">No tools match. Try another category.</p>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
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
