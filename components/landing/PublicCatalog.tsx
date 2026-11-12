"use client";

import { useQuery } from "@confect/react";
import { QueryView } from "~/components/app/QueryView";
import { Badge } from "~/components/ui/badge";
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

/** Name and category only: everything else needs an account. */
export function PublicCatalog() {
  const tools = useQuery(refs.public.catalog.publicList);
  return (
    <QueryView result={tools}>
      {(items) =>
        items.length === 0 ? (
          <p className="text-muted-foreground">No tools listed yet. Be the first!</p>
        ) : (
          <ul className="divide-y rounded-lg border">
            {groupTools(items).map(({ key, name, category, count }) => (
              <li key={key} className="flex items-center justify-between px-4 py-3">
                <span>
                  {name}
                  {count > 1 && <span className="text-muted-foreground"> ×{count}</span>}
                </span>
                <Badge variant="outline">{categoryLabel[category]}</Badge>
              </li>
            ))}
          </ul>
        )
      }
    </QueryView>
  );
}
