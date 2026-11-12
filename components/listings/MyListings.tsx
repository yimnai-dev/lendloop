"use client";

import { useMutation, useQuery } from "@confect/react";
import Link from "next/link";
import { QueryView } from "~/components/app/QueryView";
import { AvailabilityBadge } from "~/components/tools/AvailabilityBadge";
import { Badge } from "~/components/ui/badge";
import { Button } from "~/components/ui/button";
import { Card, CardContent } from "~/components/ui/card";
import refs from "~/confect/_generated/refs";
import { toastResult } from "~/lib/mutationResult";
import { categoryLabel } from "~/shared/domain/Category";

export function MyListings() {
  const listings = useQuery(refs.public.tools.myListings);
  const archive = useMutation(refs.public.tools.archive);
  return (
    <QueryView result={listings}>
      {(items) =>
        items.length === 0 ? (
          <p className="text-muted-foreground">
            Nothing listed yet. Got a ladder gathering dust?{" "}
            <Link href="/listings/new" className="underline">
              List it
            </Link>
            .
          </p>
        ) : (
          <div className="grid gap-3">
            {items.map(({ tool, pendingRequests }) => (
              <Card key={tool._id}>
                <CardContent className="flex flex-wrap items-center gap-3">
                  <Link
                    href={`/tools/${tool._id}`}
                    className="font-medium hover:underline"
                  >
                    {tool.name}
                  </Link>
                  <Badge variant="outline">{categoryLabel[tool.category]}</Badge>
                  <AvailabilityBadge bookings={tool.bookings} />
                  {pendingRequests > 0 && (
                    <Link href="/incoming">
                      <Badge>
                        {pendingRequests} pending request
                        {pendingRequests === 1 ? "" : "s"}
                      </Badge>
                    </Link>
                  )}
                  <div className="ml-auto flex gap-2">
                    <Button asChild variant="outline" size="sm">
                      <Link href={`/listings/${tool._id}/edit`}>Edit</Link>
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        void toastResult(
                          archive({ toolId: tool._id }),
                          "Listing removed",
                        );
                      }}
                    >
                      Remove
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )
      }
    </QueryView>
  );
}
