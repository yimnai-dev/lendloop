"use client";

import { usePaginatedQuery } from "@confect/react";
import { CalendarCheckIcon, HistoryIcon, InboxIcon } from "lucide-react";
import Link from "next/link";
import { useQueryStates } from "nuqs";
import { EmptyState } from "~/components/app/EmptyState";
import { PagedView } from "~/components/app/PagedView";
import { TextTabs } from "~/components/app/TextTabs";
import { Button } from "~/components/ui/button";
import { Skeleton } from "~/components/ui/skeleton";
import refs from "~/confect/_generated/refs";
import { loanParams } from "~/lib/searchParams";
import { LOAN_GROUPS, type LoanGroup } from "~/shared/domain/LoanStatus";
import type { Perspective } from "./LoanActions";
import { LoanCard } from "./LoanCard";

const PAGE_SIZE = 10;

const QUERIES = {
  borrower: refs.public.loans.myRequests,
  lender: refs.public.loans.incoming,
} as const;

const TABS = {
  borrower: { waiting: "Waiting", active: "Out with you", past: "History" },
  lender: { waiting: "To decide", active: "Out on loan", past: "History" },
} as const satisfies Record<Perspective, Record<LoanGroup, string>>;

const EMPTY = {
  borrower: {
    waiting: [
      "Nothing waiting",
      "Requests you send appear here until the owner decides.",
    ],
    active: [
      "Nothing borrowed right now",
      "Approved loans show here, with the owner's email for the handover.",
    ],
    past: ["No history yet", "Returned, declined and cancelled requests are kept here."],
  },
  lender: {
    waiting: [
      "No requests to decide",
      "When a neighbor asks for one of your tools, it lands here.",
    ],
    active: [
      "Nothing out on loan",
      "Approved loans stay here until you mark them returned.",
    ],
    past: ["No history yet", "Finished loans are kept here for reference."],
  },
} as const satisfies Record<Perspective, Record<LoanGroup, readonly [string, string]>>;

const ICONS = {
  waiting: InboxIcon,
  active: CalendarCheckIcon,
  past: HistoryIcon,
} as const;

const Loading = () => (
  <div className="grid">
    {[0, 1, 2].map((i) => (
      <div key={i} className="flex gap-5 border-b py-7">
        <Skeleton className="size-14" />
        <div className="grid flex-1 gap-2">
          <Skeleton className="h-7 w-1/3" />
          <Skeleton className="h-4 w-1/4" />
        </div>
      </div>
    ))}
  </div>
);

export function LoanList({ as }: { readonly as: Perspective }) {
  const [{ group }, setParams] = useQueryStates(loanParams);
  const loans = usePaginatedQuery(QUERIES[as], { group }, { initialNumItems: PAGE_SIZE });
  const [title, description] = EMPTY[as][group];
  return (
    <div className="grid grid-cols-1 gap-2">
      <TextTabs
        label="Loans"
        value={group}
        options={LOAN_GROUPS.map((g) => ({ value: g, label: TABS[as][g] }))}
        onChange={(g) => void setParams({ group: g })}
      />
      <PagedView
        result={loans}
        pageSize={PAGE_SIZE}
        noun="loans"
        loading={<Loading />}
        empty={
          <div className="pt-8">
            <EmptyState
              icon={ICONS[group]}
              title={title}
              description={description}
              action={
                <Button asChild variant="outline">
                  {as === "borrower" ? (
                    <Link href="/tools">Browse tools</Link>
                  ) : (
                    <Link href="/listings/new">List a tool</Link>
                  )}
                </Button>
              }
            />
          </div>
        }
      >
        {(items) => (
          <div className="grid">
            {items.map((loan) => (
              <LoanCard key={loan._id} loan={loan} as={as} />
            ))}
          </div>
        )}
      </PagedView>
    </div>
  );
}
