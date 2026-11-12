import { StatusDot, type Tone } from "~/components/app/StatusDot";
import { loanStatusLabel, type LoanStatus } from "~/shared/domain/LoanStatus";

const TONE = {
  pending: "wait",
  approved: "ok",
  declined: "quiet",
  cancelled: "quiet",
  returned: "info",
} as const satisfies Record<LoanStatus, Tone>;

export function LoanStatusBadge({ status }: { readonly status: LoanStatus }) {
  return <StatusDot tone={TONE[status]}>{loanStatusLabel[status]}</StatusDot>;
}
