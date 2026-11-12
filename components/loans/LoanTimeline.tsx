import type { LoanView } from "~/confect/views";
import { timeline } from "./timeline";

const formatter = new Intl.DateTimeFormat(undefined, {
  dateStyle: "medium",
  timeStyle: "short",
});

export function LoanTimeline({ loan }: { readonly loan: LoanView }) {
  return (
    <details className="text-sm">
      <summary className="text-muted-foreground cursor-pointer">Activity</summary>
      <ol className="mt-2 grid gap-1 border-l pl-4">
        {timeline(loan).map((entry) => (
          <li key={`${entry.at}-${entry.label}`} className="flex gap-3">
            <time className="text-muted-foreground w-40 shrink-0">
              {formatter.format(entry.at)}
            </time>
            {entry.label}
          </li>
        ))}
      </ol>
    </details>
  );
}
