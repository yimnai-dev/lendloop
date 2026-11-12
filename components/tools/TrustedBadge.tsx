import { BadgeCheckIcon } from "lucide-react";

export function TrustedBadge() {
  return (
    <span className="inline-flex items-center gap-1 text-xs font-medium text-emerald-700">
      <BadgeCheckIcon className="size-3.5" aria-hidden />
      Trusted lender
    </span>
  );
}
