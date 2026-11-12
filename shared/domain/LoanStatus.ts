import * as Schema from "effect/Schema";

export const LOAN_STATUSES = [
  "pending",
  "approved",
  "declined",
  "cancelled",
  "returned",
] as const;

export const LoanStatus = Schema.Literals(LOAN_STATUSES);
export type LoanStatus = typeof LoanStatus.Type;

export const loanStatusLabel = {
  pending: "Pending",
  approved: "Approved",
  declined: "Declined",
  cancelled: "Cancelled",
  returned: "Returned",
} as const satisfies Record<LoanStatus, string>;
