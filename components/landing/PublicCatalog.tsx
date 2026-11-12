"use client";

import { useQuery } from "@confect/react";
import { PackageOpenIcon } from "lucide-react";
import { EmptyState } from "~/components/app/EmptyState";
import { QueryView } from "~/components/app/QueryView";
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
  <div className="grid gap-x-10 border-t sm:grid-cols-2 lg:grid-cols-3">
    {["a", "b", "c", "d", "e", "f"].map((key) => (
      <Skeleton key={key} className="my-3 h-8" />
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
          <ol className="grid gap-x-10 border-t sm:grid-cols-2 lg:grid-cols-3">
            {groupTools(items).map(({ key, name, category, count }, index) => (
              <li
                key={key}
                className="grid grid-cols-[2rem_1fr_auto] items-baseline gap-3 border-b py-4"
              >
                <span className="text-muted-foreground font-mono text-[11px]">
                  {String(index + 1).padStart(2, "0")}
                </span>
                <span className="font-heading truncate text-xl">
                  {name}
                  {count > 1 && (
                    <span className="text-muted-foreground font-sans text-sm">
                      {" "}
                      ×{count}
                    </span>
                  )}
                </span>
                <span className="eyebrow text-[10px]">{categoryLabel[category]}</span>
              </li>
            ))}
          </ol>
        )
      }
    </QueryView>
  );
}
