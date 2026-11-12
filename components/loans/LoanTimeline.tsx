import type { LoanView } from "~/confect/views";
import { formatTimestamp } from "~/lib/dates";
import { timeline } from "./timeline";

export function LoanTimeline({ loan }: { readonly loan: LoanView }) {
  const entries = timeline(loan);
  return (
    <details className="group text-sm">
      <summary className="text-muted-foreground hover:text-foreground w-fit cursor-pointer list-none text-xs font-medium select-none">
        <span className="group-open:hidden">Show activity ({entries.length})</span>
        <span className="hidden group-open:inline">Hide activity</span>
      </summary>
      <ol className="mt-3 grid gap-3 border-l-2 pl-4">
        {entries.map((entry) => (
          <li key={`${entry.at}-${entry.label}`} className="relative grid gap-0.5">
            <span
              className="bg-primary ring-background absolute top-1.5 -left-[21px] size-2 rounded-full ring-4"
              aria-hidden
            />
            <span className="font-medium">{entry.label}</span>
            <time className="text-muted-foreground text-xs">
              {formatTimestamp(entry.at)}
            </time>
          </li>
        ))}
      </ol>
    </details>
  );
}
