import Link from "next/link";
import { cn } from "~/lib/utils";

/** Serif wordmark; the italic "Loop" carries the brand's single color. */
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
        "font-heading text-[1.7rem] leading-none tracking-[-0.01em]",
        className,
      )}
    >
      Lend<em className="text-moss">Loop</em>
    </Link>
  );
}
