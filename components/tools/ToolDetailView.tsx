"use client";

import { useQuery } from "@confect/react";
import { PencilIcon } from "lucide-react";
import Link from "next/link";
import type { ReactNode } from "react";
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
import { ToolPhoto } from "./ToolPhoto";
import { TrustedBadge } from "./TrustedBadge";

function BorrowPanel({ detail }: { readonly detail: ToolDetail }) {
  const { tool, myPendingRequest } = detail;
  if (tool.isMine) {
    return (
      <div className="grid gap-4 border-y py-6">
        <p className="text-muted-foreground text-sm">
          This is your listing. Requests for it show up under Lending.
        </p>
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
      <div className="grid gap-2 border-y py-6">
        <p className="font-heading text-2xl">
          You asked for{" "}
          {formatRange(myPendingRequest.startDate, myPendingRequest.endDate)}.
        </p>
        <p className="text-muted-foreground text-sm">
          Waiting on {tool.owner.firstName}.{" "}
          <Link href="/requests" className="text-foreground underline underline-offset-4">
            See your requests
          </Link>
        </p>
      </div>
    );
  }
  return (
    <RequestForm toolId={tool._id} lender={tool.owner.firstName} booked={tool.bookings} />
  );
}

function Gallery({ tool }: { readonly tool: ToolCard }) {
  const [cover, ...rest] = tool.photos;
  return (
    <div className="grid gap-2.5">
      <ToolPhoto
        photo={cover}
        category={tool.category}
        className="aspect-square w-full rounded-md"
        iconClassName="size-32 text-foreground/35"
      />
      {rest.length > 0 && (
        <div className="grid grid-cols-4 gap-2.5">
          {rest.map((photo) => (
            <ToolPhoto
              key={photo.storageId}
              photo={photo}
              category={tool.category}
              className="aspect-square rounded-sm"
            />
          ))}
        </div>
      )}
    </div>
  );
}

function Spec({
  term,
  children,
}: {
  readonly term: string;
  readonly children: ReactNode;
}) {
  return (
    <div className="grid grid-cols-[8rem_1fr] items-center border-b py-3.5 text-[13.5px]">
      <dt className="text-muted-foreground">{term}</dt>
      <dd>{children}</dd>
    </div>
  );
}

const Loading = () => (
  <div className="grid gap-12 lg:grid-cols-[1.15fr_1fr] lg:gap-18">
    <Skeleton className="aspect-square rounded-md" />
    <div className="grid content-start gap-4">
      <Skeleton className="h-4 w-32" />
      <Skeleton className="h-16 w-3/4" />
      <Skeleton className="h-24" />
      <Skeleton className="h-80" />
    </div>
  </div>
);

export function ToolDetailView({ toolId }: { readonly toolId: Id<"tools"> }) {
  const detail = useQuery(refs.public.tools.get, { toolId });
  return (
    <QueryView result={detail} loading={<Loading />}>
      {(value) => {
        const { tool } = value;
        return (
          <article className="grid grid-cols-1 gap-8">
            <nav
              aria-label="Breadcrumb"
              className="text-muted-foreground flex gap-2.5 text-[12.5px]"
            >
              <Link href="/tools" className="hover:text-foreground">
                The shed
              </Link>
              <span aria-hidden>/</span>
              <Link
                href={`/tools?category=${tool.category}`}
                className="hover:text-foreground"
              >
                {categoryLabel[tool.category]}
              </Link>
              <span aria-hidden>/</span>
              <span className="text-foreground truncate">{tool.name}</span>
            </nav>
            <div className="grid grid-cols-1 items-start gap-12 lg:grid-cols-[1.15fr_1fr] lg:gap-18">
              <Gallery tool={tool} />
              <div className="grid min-w-0 gap-7">
                <div className="grid gap-4">
                  <span className="eyebrow">{categoryLabel[tool.category]}</span>
                  <h1 className="text-5xl leading-[0.95] sm:text-7xl">{tool.name}</h1>
                  {tool.description !== "" && (
                    <p className="text-muted-foreground max-w-md text-[15px] leading-relaxed whitespace-pre-line">
                      {tool.description}
                    </p>
                  )}
                </div>
                <dl className="border-t">
                  <Spec term="Lender">
                    <span className="flex flex-wrap items-center gap-2">
                      <Avatar
                        name={tool.owner.firstName}
                        className="size-6 text-[10px]"
                      />
                      {tool.isMine ? "You" : tool.owner.firstName}
                      {tool.owner.trustedLender && <TrustedBadge withLabel />}
                    </span>
                  </Spec>
                  <Spec term="Condition">{conditionLabel[tool.condition]}</Spec>
                  <Spec term="Status">
                    <AvailabilityBadge bookings={tool.bookings} />
                  </Spec>
                </dl>
                <section className="grid gap-4" aria-labelledby="borrow-heading">
                  <h2 id="borrow-heading" className="text-3xl">
                    Borrow it
                  </h2>
                  <BorrowPanel detail={value} />
                </section>
              </div>
            </div>
          </article>
        );
      }}
    </QueryView>
  );
}
