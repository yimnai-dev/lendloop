"use client";

import { useQuery } from "@confect/react";
import { PackageOpenIcon } from "lucide-react";
import { EmptyState } from "~/components/app/EmptyState";
import { QueryView } from "~/components/app/QueryView";
import { CategoryIcon } from "~/components/tools/CategoryIcon";
import { Skeleton } from "~/components/ui/skeleton";
import refs from "~/confect/_generated/refs";
import { categoryLabel } from "~/shared/domain/Category";
import type { PublicTool } from "~/shared/domain/Tool";

/** Public rows carry no ids by design; identical ones collapse into a count. */
const groupTools = (tools: ReadonlyArray<PublicTool>) =>
  [
    ...Map.groupBy(tools, (tool) => `${tool.category}:${tool.name.toLowerCase()}`),
  ].flatMap(([key, group]) => {
    const [first] = group;
    return first === undefined ? [] : [{ key, ...first, count: group.length }];
  });

const Loading = () => (
  <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
    {["a", "b", "c", "d", "e", "f"].map((key) => (
      <Skeleton key={key} className="h-[4.5rem] rounded-xl" />
    ))}
  </div>
);

/** Name and category only: everything else needs an account. */
export function PublicCatalog() {
  const tools = useQuery(refs.public.catalog.publicList);
  return (
    <QueryView result={tools} loading={<Loading />}>
      {(items) =>
        items.length === 0 ? (
          <EmptyState
            icon={PackageOpenIcon}
            title="The shelf is empty"
            description="No tools listed yet. Sign in and be the first neighbor to share one."
          />
        ) : (
          <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {groupTools(items).map(({ key, name, category, count }) => (
              <li
                key={key}
                className="bg-card flex items-center gap-3 rounded-xl border p-3"
              >
                <CategoryIcon category={category} />
                <div className="grid min-w-0">
                  <span className="truncate font-medium">
                    {name}
                    {count > 1 && (
                      <span className="text-muted-foreground font-normal"> ×{count}</span>
                    )}
                  </span>
                  <span className="text-muted-foreground text-xs">
                    {categoryLabel[category]}
                  </span>
                </div>
              </li>
            ))}
          </ul>
        )
      }
    </QueryView>
  );
}
