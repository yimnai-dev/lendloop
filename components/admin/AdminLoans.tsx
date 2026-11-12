"use client";

import { usePaginatedQuery } from "@confect/react";
import { useQueryStates } from "nuqs";
import { TableIcon } from "lucide-react";
import { EmptyState } from "~/components/app/EmptyState";
import { PagedView } from "~/components/app/PagedView";
import { StatusDot } from "~/components/app/StatusDot";
import { LoanStatusBadge } from "~/components/loans/LoanStatusBadge";
import { Skeleton } from "~/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "~/components/ui/table";
import refs from "~/confect/_generated/refs";
import { formatRange } from "~/lib/dates";
import { adminParams } from "~/lib/searchParams";
import { today } from "~/lib/today";
import { cn } from "~/lib/utils";
import {
  LOAN_STATUSES,
  type LoanStatus,
  loanStatusLabel,
} from "~/shared/domain/LoanStatus";
import { daysOverdue } from "~/shared/domain/loanView";
import { Panel } from "./Panel";

const PAGE_SIZE = 25;

function StatusFilter({
  status,
  onChange,
}: {
  readonly status: LoanStatus | null;
  readonly onChange: (status: LoanStatus | null) => void;
}) {
  const options: ReadonlyArray<{ value: LoanStatus | null; label: string }> = [
    { value: null, label: "All" },
    ...LOAN_STATUSES.map((s) => ({ value: s, label: loanStatusLabel[s] })),
  ];
  return (
    <div className="flex flex-wrap gap-2">
      {options.map((option) => (
        <button
          key={option.label}
          type="button"
          aria-pressed={option.value === status}
          onClick={() => onChange(option.value)}
          className={cn(
            "h-8 rounded-full border px-3.5 text-[12.5px] transition-colors",
            option.value === status
              ? "bg-foreground text-background border-foreground"
              : "text-muted-foreground hover:text-foreground hover:border-foreground/40",
          )}
        >
          {option.label}
        </button>
      ))}
    </div>
  );
}

export function AdminLoans() {
  const [{ status }, setParams] = useQueryStates(adminParams);
  const loans = usePaginatedQuery(
    refs.public.admin.loans,
    status === null ? {} : { status },
    { initialNumItems: PAGE_SIZE },
  );
  return (
    <div className="grid grid-cols-1 gap-6">
      <StatusFilter
        status={status}
        onChange={(next) => void setParams({ status: next })}
      />
      <PagedView
        result={loans}
        pageSize={PAGE_SIZE}
        noun="loans"
        loading={<Skeleton className="h-64" />}
        empty={
          <EmptyState
            icon={TableIcon}
            title="No loans"
            description="Nothing matches this status."
          />
        }
      >
        {(items) => (
          <Panel>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Tool</TableHead>
                  <TableHead>Lender</TableHead>
                  <TableHead>Borrower</TableHead>
                  <TableHead>Dates</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {items.map((loan) => {
                  const overdue = daysOverdue(loan, today());
                  return (
                    <TableRow key={loan._id}>
                      <TableCell className="font-heading text-lg">
                        {loan.tool.name}
                        {loan.tool.archived && (
                          <span className="text-muted-foreground font-sans text-xs">
                            {" "}
                            · removed
                          </span>
                        )}
                      </TableCell>
                      <TableCell>{loan.lender.firstName}</TableCell>
                      <TableCell>{loan.borrower.firstName}</TableCell>
                      <TableCell className="whitespace-nowrap tabular-nums">
                        {formatRange(loan.startDate, loan.endDate)}
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-4">
                          <LoanStatusBadge status={loan.status} />
                          {overdue > 0 && (
                            <StatusDot tone="late">{overdue}d overdue</StatusDot>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </Panel>
        )}
      </PagedView>
    </div>
  );
}
