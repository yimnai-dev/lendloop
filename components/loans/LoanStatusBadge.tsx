import { Badge } from "~/components/ui/badge";
import { loanStatusLabel, type LoanStatus } from "~/shared/domain/LoanStatus";

const VARIANT = {
  pending: "secondary",
  approved: "default",
  declined: "outline",
  cancelled: "outline",
  returned: "outline",
} as const satisfies Record<LoanStatus, string>;

export function LoanStatusBadge({ status }: { readonly status: LoanStatus }) {
  return <Badge variant={VARIANT[status]}>{loanStatusLabel[status]}</Badge>;
}
