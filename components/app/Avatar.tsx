import { cn } from "~/lib/utils";

/** First-initial avatar; we never store profile photos. */
export function Avatar({
  name,
  className,
}: {
  readonly name: string;
  readonly className?: string;
}) {
  return (
    <span
      aria-hidden
      className={cn(
        "bg-card text-foreground grid size-8 shrink-0 place-items-center rounded-full border text-xs font-medium",
        className,
      )}
    >
      {name.slice(0, 1).toUpperCase()}
    </span>
  );
}
