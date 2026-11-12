"use client";

import Link from "next/link";
import { TrustedBadge } from "~/components/tools/TrustedBadge";
import { Badge } from "~/components/ui/badge";
import { Card, CardContent } from "~/components/ui/card";
import type { LoanView } from "~/confect/views";
import { today } from "~/lib/today";
import { daysOverdue } from "~/shared/domain/loanView";
import { LoanActions, type Perspective } from "./LoanActions";
import { LoanTimeline } from "./LoanTimeline";

const STATUS_VARIANT = {
  pending: "secondary",
  approved: "default",
  declined: "outline",
  cancelled: "outline",
  returned: "outline",
} as const;

export function LoanCard({
  loan,
  as,
}: {
  readonly loan: LoanView;
  readonly as: Perspective;
}) {
  const overdue = daysOverdue(loan, today());
  const { counterpart } = loan;
  return (
    <Card>
      <CardContent className="grid gap-3">
        <div className="flex flex-wrap items-center gap-3">
          <Link href={`/tools/${loan.tool._id}`} className="font-medium hover:underline">
            {loan.tool.name}
          </Link>
          <Badge variant={STATUS_VARIANT[loan.status]}>{loan.status}</Badge>
          {overdue > 0 && <Badge variant="destructive">{overdue} days overdue</Badge>}
          <span className="text-muted-foreground text-sm">
            {loan.startDate} → {loan.endDate}
          </span>
          <div className="ml-auto">
            <LoanActions loan={loan} as={as} />
          </div>
        </div>
        <p className="flex flex-wrap items-center gap-2 text-sm">
          {as === "lender" ? "Borrower" : "Lender"}: {counterpart.firstName}
          {counterpart.trustedLender && <TrustedBadge />}
          {counterpart.email !== null && (
            <a href={`mailto:${counterpart.email}`} className="underline">
              {counterpart.email}
            </a>
          )}
        </p>
        <LoanTimeline loan={loan} />
      </CardContent>
    </Card>
  );
}
