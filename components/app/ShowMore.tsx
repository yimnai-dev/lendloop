"use client";

import { PaginatedQueryResult } from "@confect/react";
import { Button } from "~/components/ui/button";

/**
 * Footer for a paginated list: a quiet count and an explicit "show more".
 * Convex pagination is cursor-based, so there are no page numbers to jump to.
 */
export function ShowMore<Item, E>({
  result,
  pageSize,
  noun,
}: {
  readonly result: PaginatedQueryResult.Variants<Item, E>;
  readonly pageSize: number;
  readonly noun: string;
}) {
  const shown = result.results.length;
  if (shown === 0) return null;
  return (
    <div className="grid justify-items-center gap-4 pt-10 pb-4">
      <p className="eyebrow">
        {PaginatedQueryResult.isExhausted(result)
          ? `All ${shown} ${noun}`
          : `Showing ${shown} ${noun}`}
      </p>
      {PaginatedQueryResult.isCanLoadMore(result) && (
        <Button variant="outline" onClick={() => result.loadMore(pageSize)}>
          Show more
        </Button>
      )}
      {PaginatedQueryResult.isLoadingMore(result) && (
        <Button variant="outline" disabled>
          Loading…
        </Button>
      )}
    </div>
  );
}
