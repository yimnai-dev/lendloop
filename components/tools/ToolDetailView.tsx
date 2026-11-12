"use client";

import { useQuery } from "@confect/react";
import Link from "next/link";
import { QueryView } from "~/components/app/QueryView";
import { RequestForm } from "~/components/loans/RequestForm";
import { Badge } from "~/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import type { Id } from "~/confect/_generated/id";
import refs from "~/confect/_generated/refs";
import type { ToolDetail } from "~/confect/views";
import { categoryLabel } from "~/shared/domain/Category";
import { conditionLabel } from "~/shared/domain/Condition";
import { AvailabilityBadge } from "./AvailabilityBadge";
import { TrustedBadge } from "./TrustedBadge";

function BorrowPanel({ detail }: { readonly detail: ToolDetail }) {
  const { tool, myPendingRequest } = detail;
  if (tool.isMine) {
    return (
      <p className="text-muted-foreground text-sm">
        This is your listing.{" "}
        <Link href={`/listings/${tool._id}/edit`} className="underline">
          Edit it
        </Link>
        .
      </p>
    );
  }
  if (myPendingRequest !== null) {
    return (
      <p className="text-sm">
        You asked for {myPendingRequest.startDate} → {myPendingRequest.endDate}. Waiting
        on {tool.owner.firstName}.{" "}
        <Link href="/requests" className="underline">
          See your requests
        </Link>
        .
      </p>
    );
  }
  return <RequestForm toolId={tool._id} />;
}

export function ToolDetailView({ toolId }: { readonly toolId: Id<"tools"> }) {
  const detail = useQuery(refs.public.tools.get, { toolId });
  return (
    <QueryView result={detail}>
      {(value) => {
        const { tool } = value;
        return (
          <div className="grid gap-6 md:grid-cols-[3fr_2fr]">
            <div className="grid content-start gap-4">
              <div className="flex flex-wrap items-center gap-3">
                <h1 className="text-2xl font-semibold">{tool.name}</h1>
                <AvailabilityBadge bookings={tool.bookings} />
              </div>
              <div className="flex flex-wrap gap-1.5">
                <Badge variant="outline">{categoryLabel[tool.category]}</Badge>
                <Badge variant="outline">{conditionLabel[tool.condition]}</Badge>
              </div>
              <p className="flex items-center gap-2 text-sm">
                Lent by {tool.owner.firstName}{" "}
                {tool.owner.trustedLender && <TrustedBadge />}
              </p>
              {tool.description !== "" && (
                <p className="whitespace-pre-line">{tool.description}</p>
              )}
              <div className="grid grid-cols-3 gap-2">
                {tool.photos.map((photo) => (
                  // oxlint-disable-next-line nextjs/no-img-element
                  <img
                    key={photo.storageId}
                    src={photo.url}
                    alt=""
                    className="aspect-square rounded-md object-cover"
                  />
                ))}
              </div>
            </div>
            <Card className="h-fit">
              <CardHeader>
                <CardTitle>Borrow it</CardTitle>
              </CardHeader>
              <CardContent className="grid gap-4">
                {tool.bookings.length > 0 && (
                  <div className="text-sm">
                    <p className="font-medium">Already booked</p>
                    <ul className="text-muted-foreground">
                      {tool.bookings.map((b) => (
                        <li key={b.startDate}>
                          {b.startDate} → {b.endDate}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                <BorrowPanel detail={value} />
              </CardContent>
            </Card>
          </div>
        );
      }}
    </QueryView>
  );
}
