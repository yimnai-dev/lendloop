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

/** The three ways people look at their loans: what needs a decision, what's out, and the past. */
export const LOAN_GROUPS = ["waiting", "active", "past"] as const;
export const LoanGroup = Schema.Literals(LOAN_GROUPS);
export type LoanGroup = typeof LoanGroup.Type;

export const loanGroupStatuses = {
  waiting: ["pending"],
  active: ["approved"],
  past: ["returned", "declined", "cancelled"],
} as const satisfies Record<LoanGroup, ReadonlyArray<LoanStatus>>;
