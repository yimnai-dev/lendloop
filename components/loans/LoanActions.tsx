"use client";

import { useMutation } from "@confect/react";
import { Button } from "~/components/ui/button";
import refs from "~/confect/_generated/refs";
import type { LoanView } from "~/confect/views";
import { toastResult } from "~/lib/mutationResult";

export type Perspective = "lender" | "borrower";

/** Only the actions the transition table allows this party, in this state. */
export function LoanActions({
  loan,
  as,
}: {
  readonly loan: LoanView;
  readonly as: Perspective;
}) {
  const approve = useMutation(refs.public.loans.approve);
  const decline = useMutation(refs.public.loans.decline);
  const cancel = useMutation(refs.public.loans.cancel);
  const markReturned = useMutation(refs.public.loans.markReturned);
  const args = { loanId: loan._id };

  if (as === "borrower" && loan.status === "pending") {
    return (
      <Button
        variant="outline"
        size="sm"
        onClick={() => void toastResult(cancel(args), "Request cancelled")}
      >
        Cancel request
      </Button>
    );
  }
  if (as === "lender" && loan.status === "pending") {
    return (
      <div className="flex gap-2">
        <Button size="sm" onClick={() => void toastResult(approve(args), "Approved")}>
          Approve
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => void toastResult(decline(args), "Declined")}
        >
          Decline
        </Button>
      </div>
    );
  }
  if (as === "lender" && loan.status === "approved") {
    return (
      <Button
        size="sm"
        onClick={() => void toastResult(markReturned(args), "Marked returned")}
      >
        Mark returned
      </Button>
    );
  }
  return null;
}
