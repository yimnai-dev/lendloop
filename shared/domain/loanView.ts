import type { DateRange } from "./DateRange";
import { contains } from "./DateRange";
import { compare, daysBetween, type IsoDate } from "./IsoDate";
import type { LoanStatus } from "./LoanStatus";

/** The fields every derived view needs; works for any loan-shaped record. */
export type LoanLike = DateRange & { readonly status: LoanStatus };

export const isActive = (loan: LoanLike, today: IsoDate): boolean =>
  loan.status === "approved" && contains(loan, today);

export const isOverdue = (loan: LoanLike, today: IsoDate): boolean =>
  loan.status === "approved" && compare(loan.endDate, today) < 0;

export const daysOverdue = (loan: LoanLike, today: IsoDate): number =>
  isOverdue(loan, today) ? daysBetween(loan.endDate, today) : 0;

export type Availability =
  | { readonly _tag: "Available" }
  | { readonly _tag: "OnLoan"; readonly until: IsoDate }
  | { readonly _tag: "Overdue"; readonly since: IsoDate };

/** A tool's availability today, derived from its loans (never stored). */
export const availability = (
  loans: ReadonlyArray<LoanLike>,
  today: IsoDate,
): Availability => {
  const overdue = loans.find((loan) => isOverdue(loan, today));
  if (overdue !== undefined) return { _tag: "Overdue", since: overdue.endDate };
  const active = loans.find((loan) => isActive(loan, today));
  if (active !== undefined) return { _tag: "OnLoan", until: active.endDate };
  return { _tag: "Available" };
};
