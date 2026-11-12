import { Badge } from "~/components/ui/badge";
import { loanStatusLabel, type LoanStatus } from "~/shared/domain/LoanStatus";

const VARIANT = {
  pending: "warning",
  approved: "success",
  declined: "outline",
  cancelled: "outline",
  returned: "info",
} as const satisfies Record<LoanStatus, string>;

export function LoanStatusBadge({ status }: { readonly status: LoanStatus }) {
  return <Badge variant={VARIANT[status]}>{loanStatusLabel[status]}</Badge>;
}
