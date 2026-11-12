import { Repeat2Icon } from "lucide-react";
import Link from "next/link";
import { cn } from "~/lib/utils";

/** Wordmark: a loop (things come back) on the brand green. */
export function Logo({
  href = "/",
  className,
}: {
  readonly href?: string;
  readonly className?: string;
}) {
  return (
    <Link
      href={href}
      className={cn(
        "flex items-center gap-2 font-heading text-lg font-semibold",
        className,
      )}
    >
      <span className="bg-primary text-primary-foreground grid size-8 place-items-center rounded-lg shadow-sm">
        <Repeat2Icon className="size-5" aria-hidden />
      </span>
      LendLoop
    </Link>
  );
}
