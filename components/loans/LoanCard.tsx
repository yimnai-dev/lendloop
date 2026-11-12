"use client";

import Link from "next/link";
import { Avatar } from "~/components/app/Avatar";
import { CategoryIcon } from "~/components/tools/CategoryIcon";
import { TrustedBadge } from "~/components/tools/TrustedBadge";
import type { LoanView } from "~/confect/views";
import { dayCount, formatRange, formatTimestamp } from "~/lib/dates";
import { today } from "~/lib/today";
import { daysOverdue } from "~/shared/domain/loanView";
import { StatusDot } from "~/components/app/StatusDot";
import { LoanActions, type Perspective } from "./LoanActions";
import { LoanStatusBadge } from "./LoanStatusBadge";
import { LoanTimeline } from "./LoanTimeline";

function Field({
  label,
  children,
}: {
  readonly label: string;
  readonly children: React.ReactNode;
}) {
  return (
    <div className="grid content-start gap-1">
      <span className="eyebrow text-[10px]">{label}</span>
      <div className="text-[13.5px]">{children}</div>
    </div>
  );
}

export function LoanCard({
  loan,
  as,
}: {
  readonly loan: LoanView;
  readonly as: Perspective;
}) {
  const overdue = daysOverdue(loan, today());
  const days = dayCount(loan.startDate, loan.endDate);
  const { counterpart } = loan;
  return (
    <article className="grid gap-6 border-b py-7">
      <div className="grid grid-cols-[auto_1fr] items-start gap-x-5 gap-y-5 md:grid-cols-[auto_minmax(0,1.6fr)_1fr_1.2fr_auto]">
        <CategoryIcon category={loan.tool.category} size="md" />
        <div className="grid gap-1">
          <Link
            href={`/tools/${loan.tool._id}`}
            className="font-heading truncate text-[1.75rem] leading-tight hover:underline hover:decoration-1 hover:underline-offset-4"
          >
            {loan.tool.name}
          </Link>
          <div className="flex flex-wrap items-center gap-x-4 gap-y-1">
            <LoanStatusBadge status={loan.status} />
            {overdue > 0 && (
              <StatusDot tone="late">
                {overdue} {overdue === 1 ? "day" : "days"} overdue
              </StatusDot>
            )}
            <span className="text-muted-foreground text-xs">
              Requested {formatTimestamp(loan.requestedAt)}
            </span>
          </div>
        </div>
        <div className="col-start-2 md:col-start-auto">
          <Field label="Dates">
            {formatRange(loan.startDate, loan.endDate)}
            <span className="text-muted-foreground">
              {" "}
              · {days} {days === 1 ? "day" : "days"}
            </span>
          </Field>
        </div>
        <div className="col-start-2 md:col-start-auto">
          <Field label={as === "lender" ? "Borrower" : "Lender"}>
            <span className="flex items-center gap-2">
              <Avatar name={counterpart.firstName} className="size-6 text-[10px]" />
              {counterpart.firstName}
              {counterpart.trustedLender && <TrustedBadge />}
            </span>
            {counterpart.email !== null && (
              <a
                href={`mailto:${counterpart.email}`}
                className="text-moss mt-1 block truncate text-xs underline-offset-4 hover:underline"
              >
                {counterpart.email}
              </a>
            )}
          </Field>
        </div>
        <div className="col-start-2 md:col-start-auto md:justify-self-end">
          <LoanActions loan={loan} as={as} />
        </div>
      </div>
      <div className="md:pl-[76px]">
        <LoanTimeline loan={loan} />
      </div>
    </article>
  );
}
