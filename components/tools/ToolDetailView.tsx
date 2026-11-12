"use client";

import { useQuery } from "@confect/react";
import { ArrowLeftIcon, CalendarClockIcon, PencilIcon } from "lucide-react";
import Link from "next/link";
import { Avatar } from "~/components/app/Avatar";
import { QueryView } from "~/components/app/QueryView";
import { RequestForm } from "~/components/loans/RequestForm";
import { Button } from "~/components/ui/button";
import { Skeleton } from "~/components/ui/skeleton";
import type { Id } from "~/confect/_generated/id";
import refs from "~/confect/_generated/refs";
import type { ToolCard, ToolDetail } from "~/confect/views";
import { formatRange } from "~/lib/dates";
import { categoryLabel } from "~/shared/domain/Category";
import { conditionLabel } from "~/shared/domain/Condition";
import { AvailabilityBadge } from "./AvailabilityBadge";
import { CategoryIcon } from "./CategoryIcon";
import { ToolPhoto } from "./ToolPhoto";
import { TrustedBadge } from "./TrustedBadge";

function BorrowPanel({ detail }: { readonly detail: ToolDetail }) {
  const { tool, myPendingRequest } = detail;
  if (tool.isMine) {
    return (
      <div className="grid gap-3">
        <p className="text-muted-foreground text-sm">This is your listing.</p>
        <Button asChild variant="outline" className="justify-self-start">
          <Link href={`/listings/${tool._id}/edit`}>
            <PencilIcon aria-hidden />
            Edit listing
          </Link>
        </Button>
      </div>
    );
  }
  if (myPendingRequest !== null) {
    return (
      <div className="bg-accent/60 grid gap-1 rounded-xl p-4 text-sm">
        <p className="font-medium">
          You asked for{" "}
          {formatRange(myPendingRequest.startDate, myPendingRequest.endDate)}
        </p>
        <p className="text-muted-foreground">
          Waiting on {tool.owner.firstName}.{" "}
          <Link
            href="/requests"
            className="text-primary font-medium underline-offset-4 hover:underline"
          >
            See your requests
          </Link>
        </p>
      </div>
    );
  }
  return <RequestForm toolId={tool._id} />;
}

function Gallery({ tool }: { readonly tool: ToolCard }) {
  const [cover, ...rest] = tool.photos;
  return (
    <div className="grid gap-2">
      <ToolPhoto
        photo={cover}
        category={tool.category}
        className="aspect-[4/3] w-full rounded-2xl border"
      />
      {rest.length > 0 && (
        <div className="grid grid-cols-4 gap-2">
          {rest.map((photo) => (
            <ToolPhoto
              key={photo.storageId}
              photo={photo}
              category={tool.category}
              className="aspect-square rounded-xl border"
            />
          ))}
        </div>
      )}
    </div>
  );
}

const Loading = () => (
  <div className="grid gap-8 lg:grid-cols-[3fr_2fr]">
    <Skeleton className="aspect-[4/3] rounded-2xl" />
    <Skeleton className="h-72 rounded-2xl" />
  </div>
);

export function ToolDetailView({ toolId }: { readonly toolId: Id<"tools"> }) {
  const detail = useQuery(refs.public.tools.get, { toolId });
  return (
    <div className="grid gap-6">
      <Link
        href="/tools"
        className="text-muted-foreground hover:text-foreground flex w-fit items-center gap-1.5 text-sm"
      >
        <ArrowLeftIcon className="size-4" aria-hidden />
        All tools
      </Link>
      <QueryView result={detail} loading={<Loading />}>
        {(value) => {
          const { tool } = value;
          return (
            <div className="grid items-start gap-8 lg:grid-cols-[3fr_2fr]">
              <div className="grid gap-6">
                <div className="grid gap-3">
                  <div className="flex flex-wrap items-center gap-3">
                    <CategoryIcon category={tool.category} size="sm" />
                    <span className="text-muted-foreground text-sm">
                      {categoryLabel[tool.category]} · {conditionLabel[tool.condition]}
                    </span>
                    <AvailabilityBadge bookings={tool.bookings} />
                  </div>
                  <h1 className="text-3xl font-semibold sm:text-4xl">{tool.name}</h1>
                  {tool.description !== "" && (
                    <p className="text-muted-foreground leading-relaxed whitespace-pre-line">
                      {tool.description}
                    </p>
                  )}
                </div>
                <Gallery tool={tool} />
              </div>
              <aside className="bg-card grid gap-6 rounded-2xl border p-6 shadow-sm lg:sticky lg:top-24">
                <div className="flex items-center gap-3">
                  <Avatar name={tool.owner.firstName} className="size-10" />
                  <div className="grid">
                    <span className="text-muted-foreground text-xs">Lent by</span>
                    <span className="flex items-center gap-2 font-medium">
                      {tool.isMine ? "You" : tool.owner.firstName}
                      {tool.owner.trustedLender && <TrustedBadge />}
                    </span>
                  </div>
                </div>
                {tool.bookings.length > 0 && (
                  <div className="grid gap-2 text-sm">
                    <p className="flex items-center gap-1.5 font-medium">
                      <CalendarClockIcon className="size-4" aria-hidden />
                      Already booked
                    </p>
                    <ul className="flex flex-wrap gap-1.5">
                      {tool.bookings.map((b) => (
                        <li
                          key={b.startDate}
                          className="bg-muted rounded-full px-2.5 py-1 text-xs font-medium"
                        >
                          {formatRange(b.startDate, b.endDate)}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                <div className="border-t pt-6">
                  <h2 className="mb-4 text-lg font-semibold">Borrow it</h2>
                  <BorrowPanel detail={value} />
                </div>
              </aside>
            </div>
          );
        }}
      </QueryView>
    </div>
  );
}
