import type { ReactNode } from "react";
import { cn } from "~/lib/utils";

const TONES = {
  ok: "text-moss",
  wait: "text-ochre",
  late: "text-rust",
  info: "text-foreground",
  quiet: "text-muted-foreground",
} as const;

export type Tone = keyof typeof TONES;

/** A dot and a word: status without the visual weight of a pill. */
export function StatusDot({
  tone,
  children,
  className,
}: {
  readonly tone: Tone;
  readonly children: ReactNode;
  readonly className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-2 text-xs font-medium whitespace-nowrap before:size-1.5 before:shrink-0 before:rounded-full before:bg-current",
        TONES[tone],
        className,
      )}
    >
      {children}
    </span>
  );
}
