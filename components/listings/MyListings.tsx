"use client";

import { useMutation, useQuery } from "@confect/react";
import { PackageOpenIcon } from "lucide-react";
import Link from "next/link";
import { EmptyState } from "~/components/app/EmptyState";
import { QueryView } from "~/components/app/QueryView";
import { AvailabilityBadge } from "~/components/tools/AvailabilityBadge";
import { ToolPhoto } from "~/components/tools/ToolPhoto";
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
          <ul className="border-t">
            {items.map(({ tool, pendingRequests }) => (
              <li
                key={tool._id}
                className="grid grid-cols-[4rem_1fr] items-center gap-x-5 gap-y-4 border-b py-5 sm:grid-cols-[4rem_1.6fr_1fr_auto]"
              >
                <ToolPhoto
                  photo={tool.photos[0]}
                  category={tool.category}
                  className="size-16 rounded-sm"
                  iconClassName="size-7"
                />
                <div className="grid min-w-0 gap-1">
                  <Link
                    href={`/tools/${tool._id}`}
                    className="font-heading truncate text-2xl leading-tight hover:underline"
                  >
                    {tool.name}
                  </Link>
                  <p className="text-muted-foreground text-xs">
                    {categoryLabel[tool.category]} · {conditionLabel[tool.condition]}
                  </p>
                </div>
                <div className="col-start-2 flex flex-wrap items-center gap-x-5 gap-y-1 sm:col-start-auto">
                  <AvailabilityBadge bookings={tool.bookings} />
                  {pendingRequests > 0 && (
                    <Link
                      href="/incoming"
                      className="text-xs font-medium underline underline-offset-4"
                    >
                      {pendingRequests} to decide
                    </Link>
                  )}
                </div>
                <div className="col-start-2 flex gap-2 sm:col-start-auto">
                  <Button asChild variant="outline" size="sm">
                    <Link href={`/listings/${tool._id}/edit`}>Edit</Link>
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-muted-foreground hover:text-rust"
                    onClick={() => {
                      void toastResult(archive({ toolId: tool._id }), "Listing removed");
                    }}
                  >
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
