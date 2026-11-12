"use client";

import { useQuery } from "@confect/react";
import { QueryView } from "~/components/app/QueryView";
import refs from "~/confect/_generated/refs";
import { LoanCard } from "./LoanCard";
import type { Perspective } from "./LoanActions";

const QUERIES = {
  borrower: refs.public.loans.myRequests,
  lender: refs.public.loans.incoming,
} as const;

const EMPTY = {
  borrower: "You haven't asked to borrow anything yet.",
  lender: "No one has asked to borrow your tools yet.",
} as const;

export function LoanList({ as }: { readonly as: Perspective }) {
  const loans = useQuery(QUERIES[as]);
  return (
    <QueryView result={loans}>
      {(items) =>
        items.length === 0 ? (
          <p className="text-muted-foreground">{EMPTY[as]}</p>
        ) : (
          <div className="grid gap-3">
            {items.map((loan) => (
              <LoanCard key={loan._id} loan={loan} as={as} />
            ))}
          </div>
        )
      }
    </QueryView>
  );
}
