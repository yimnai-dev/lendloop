import { BadgeCheckIcon } from "lucide-react";
import { cn } from "~/lib/utils";

/** Icon by default; `withLabel` where there's room to say it. */
export function TrustedBadge({
  withLabel = false,
  className,
}: {
  readonly withLabel?: boolean;
  readonly className?: string;
}) {
  return (
    <span
      className={cn(
        "text-moss inline-flex items-center gap-1 text-xs font-medium",
        className,
      )}
      title="Trusted lender"
    >
      <BadgeCheckIcon className="size-3.5" strokeWidth={2} aria-hidden />
      {withLabel ? "Trusted lender" : <span className="sr-only">Trusted lender</span>}
    </span>
  );
}
