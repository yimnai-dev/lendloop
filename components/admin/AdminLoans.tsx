"use client";

import { useQuery } from "@confect/react";
import { useQueryStates } from "nuqs";
import { QueryView } from "~/components/app/QueryView";
import { LoanStatusBadge } from "~/components/loans/LoanStatusBadge";
import { Badge } from "~/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "~/components/ui/table";
import refs from "~/confect/_generated/refs";
import { adminParams } from "~/lib/searchParams";
import { today } from "~/lib/today";
import { LOAN_STATUSES, loanStatusLabel } from "~/shared/domain/LoanStatus";
import { daysOverdue } from "~/shared/domain/loanView";

const ALL = "all";

export function AdminLoans() {
  const [{ status }, setParams] = useQueryStates(adminParams);
  const loans = useQuery(refs.public.admin.loans, status === null ? {} : { status });
  return (
    <div className="grid gap-4">
      <Select
        value={status ?? ALL}
        onValueChange={(value) => {
          void setParams({ status: LOAN_STATUSES.find((s) => s === value) ?? null });
        }}
      >
        <SelectTrigger className="w-48" aria-label="Status">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value={ALL}>All statuses</SelectItem>
          {LOAN_STATUSES.map((s) => (
            <SelectItem key={s} value={s}>
              {loanStatusLabel[s]}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <QueryView result={loans}>
        {(items) =>
          items.length === 0 ? (
            <p className="text-muted-foreground">No loans match.</p>
          ) : (
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
                      <TableCell>
                        {loan.tool.name}
                        {loan.tool.archived && (
                          <span className="text-muted-foreground"> (removed)</span>
                        )}
                      </TableCell>
                      <TableCell>{loan.lender.firstName}</TableCell>
                      <TableCell>{loan.borrower.firstName}</TableCell>
                      <TableCell className="tabular-nums">
                        {loan.startDate} → {loan.endDate}
                      </TableCell>
                      <TableCell className="flex gap-2">
                        <LoanStatusBadge status={loan.status} />
                        {overdue > 0 && (
                          <Badge variant="destructive">{overdue}d overdue</Badge>
                        )}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )
        }
      </QueryView>
    </div>
  );
}
