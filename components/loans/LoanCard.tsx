"use client";

import { MailIcon } from "lucide-react";
import Link from "next/link";
import { CategoryIcon } from "~/components/tools/CategoryIcon";
import { TrustedBadge } from "~/components/tools/TrustedBadge";
import { Badge } from "~/components/ui/badge";
import type { LoanView } from "~/confect/views";
import { formatRange } from "~/lib/dates";
import { today } from "~/lib/today";
import { daysBetween } from "~/shared/domain/IsoDate";
import { daysOverdue } from "~/shared/domain/loanView";
import { LoanActions, type Perspective } from "./LoanActions";
import { LoanStatusBadge } from "./LoanStatusBadge";
import { LoanTimeline } from "./LoanTimeline";

export function LoanCard({
  loan,
  as,
}: {
  readonly loan: LoanView;
  readonly as: Perspective;
}) {
  const overdue = daysOverdue(loan, today());
  const days = daysBetween(loan.startDate, loan.endDate) + 1;
  const { counterpart } = loan;
  return (
    <article className="bg-card grid gap-4 rounded-2xl border p-5 shadow-xs">
      <div className="flex flex-wrap items-start gap-4">
        <CategoryIcon category={loan.tool.category} size="md" />
        <div className="grid min-w-0 flex-1 gap-1">
          <div className="flex flex-wrap items-center gap-2">
            <Link
              href={`/tools/${loan.tool._id}`}
              className="truncate font-semibold hover:underline"
            >
              {loan.tool.name}
            </Link>
            <LoanStatusBadge status={loan.status} />
            {overdue > 0 && (
              <Badge variant="destructive">
                {overdue} {overdue === 1 ? "day" : "days"} overdue
              </Badge>
            )}
          </div>
          <p className="text-muted-foreground text-sm">
            {formatRange(loan.startDate, loan.endDate)} · {days}{" "}
            {days === 1 ? "day" : "days"}
          </p>
          <p className="text-muted-foreground flex flex-wrap items-center gap-x-2 gap-y-1 text-sm">
            {as === "lender" ? "Borrower:" : "Lender:"}
            <span className="text-foreground font-medium">{counterpart.firstName}</span>
            {counterpart.trustedLender && <TrustedBadge />}
            {counterpart.email !== null && (
              <a
                href={`mailto:${counterpart.email}`}
                className="text-primary inline-flex items-center gap-1 font-medium underline-offset-4 hover:underline"
              >
                <MailIcon className="size-3.5" aria-hidden />
                {counterpart.email}
              </a>
            )}
          </p>
        </div>
        <LoanActions loan={loan} as={as} />
      </div>
      <LoanTimeline loan={loan} />
    </article>
  );
}
