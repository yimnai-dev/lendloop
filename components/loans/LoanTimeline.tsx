import type { LoanView } from "~/confect/views";
import { formatTimestamp } from "~/lib/dates";
import { cn } from "~/lib/utils";
import { timeline } from "./timeline";

/** Oldest to newest, left to right. Automation steps get the brand color. */
export function LoanTimeline({ loan }: { readonly loan: LoanView }) {
  const entries = timeline(loan).toReversed();
  return (
    <ol className="relative grid auto-cols-fr grid-flow-row gap-4 sm:grid-flow-col sm:gap-6">
      <span
        aria-hidden
        className="bg-border absolute top-[4px] right-0 left-0 hidden h-px sm:block"
      />
      {entries.map((entry) => (
        <li
          key={`${entry.at}-${entry.label}`}
          className="relative grid gap-0.5 pl-5 sm:pt-5 sm:pl-0"
        >
          <span
            aria-hidden
            className={cn(
              "absolute top-1 left-0 size-[9px] rounded-full border sm:top-0",
              entry.automated
                ? "border-moss bg-moss-soft"
                : "border-foreground bg-foreground",
            )}
          />
          <span className="text-[13px]">{entry.label}</span>
          <time className="text-muted-foreground font-mono text-[10.5px]">
            {formatTimestamp(entry.at)}
          </time>
        </li>
      ))}
    </ol>
  );
}
