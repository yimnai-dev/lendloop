"use client";

import { useMutation, useQuery } from "@confect/react";
import { InboxIcon, PackageOpenIcon, PencilIcon, Trash2Icon } from "lucide-react";
import Link from "next/link";
import { EmptyState } from "~/components/app/EmptyState";
import { QueryView } from "~/components/app/QueryView";
import { AvailabilityBadge } from "~/components/tools/AvailabilityBadge";
import { ToolPhoto } from "~/components/tools/ToolPhoto";
import { Badge } from "~/components/ui/badge";
import { Button } from "~/components/ui/button";
import refs from "~/confect/_generated/refs";
import { toastResult } from "~/lib/mutationResult";
import { categoryLabel } from "~/shared/domain/Category";
import { conditionLabel } from "~/shared/domain/Condition";

export function MyListings() {
  const listings = useQuery(refs.public.tools.myListings);
  const archive = useMutation(refs.public.tools.archive);
  return (
    <QueryView result={listings}>
      {(items) =>
        items.length === 0 ? (
          <EmptyState
            icon={PackageOpenIcon}
            title="Nothing listed yet"
            description="Got a ladder gathering dust? List it and a neighbor can borrow it this weekend."
            action={
              <Button asChild>
                <Link href="/listings/new">List a tool</Link>
              </Button>
            }
          />
        ) : (
          <ul className="bg-card divide-y overflow-hidden rounded-2xl border">
            {items.map(({ tool, pendingRequests }) => (
              <li key={tool._id} className="flex flex-wrap items-center gap-4 p-4">
                <ToolPhoto
                  photo={tool.photos[0]}
                  category={tool.category}
                  className="size-14 rounded-xl [&>svg]:size-6"
                />
                <div className="grid min-w-0 flex-1 gap-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <Link
                      href={`/tools/${tool._id}`}
                      className="truncate font-semibold hover:underline"
                    >
                      {tool.name}
                    </Link>
                    <AvailabilityBadge bookings={tool.bookings} />
                    {pendingRequests > 0 && (
                      <Badge asChild variant="info">
                        <Link href="/incoming">
                          <InboxIcon aria-hidden />
                          {pendingRequests} pending
                        </Link>
                      </Badge>
                    )}
                  </div>
                  <p className="text-muted-foreground text-sm">
                    {categoryLabel[tool.category]} · {conditionLabel[tool.condition]}
                  </p>
                </div>
                <div className="flex gap-1">
                  <Button asChild variant="outline" size="sm">
                    <Link href={`/listings/${tool._id}/edit`}>
                      <PencilIcon aria-hidden />
                      Edit
                    </Link>
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-muted-foreground hover:text-destructive"
                    onClick={() => {
                      void toastResult(archive({ toolId: tool._id }), "Listing removed");
                    }}
                  >
                    <Trash2Icon aria-hidden />
                    Remove
                  </Button>
                </div>
              </li>
            ))}
          </ul>
        )
      }
    </QueryView>
  );
}
