import { StatusDot, type Tone } from "~/components/app/StatusDot";
import { categoryIcon } from "~/components/tools/categoryStyle";
import type { Category } from "~/shared/domain/Category";

const ENTRIES: ReadonlyArray<{
  readonly name: string;
  readonly category: Category;
  readonly owner: string;
  readonly status: string;
  readonly tone: Tone;
}> = [
  {
    name: "Hammer drill",
    category: "power_tools",
    owner: "Priya",
    status: "Available",
    tone: "ok",
  },
  {
    name: "Hedge trimmer",
    category: "garden",
    owner: "Maya",
    status: "Back Fri",
    tone: "wait",
  },
  {
    name: "Four-person tent",
    category: "camping",
    owner: "Sam",
    status: "Available",
    tone: "ok",
  },
  {
    name: "Step ladder",
    category: "outdoor",
    owner: "Theo",
    status: "Available",
    tone: "ok",
  },
];

/** Decorative: a page from the neighborhood ledger, without fetching anything. */
export function HeroArt() {
  return (
    <figure
      aria-hidden
      className="bg-card/70 grid gap-0 rounded-md border px-6 pt-5 pb-2 sm:px-8"
    >
      <figcaption className="flex items-baseline justify-between border-b pb-4">
        <span className="font-heading text-2xl">The ledger</span>
        <span className="eyebrow text-[10px]">This week</span>
      </figcaption>
      {ENTRIES.map((entry, index) => {
        const Icon = categoryIcon[entry.category];
        return (
          <div
            key={entry.name}
            className="grid grid-cols-[1.75rem_2.5rem_1fr_auto] items-center gap-3 border-b py-4 last:border-b-0"
          >
            <span className="text-muted-foreground font-mono text-[11px]">
              {String(index + 1).padStart(2, "0")}
            </span>
            <span className="bg-muted grid size-10 place-items-center rounded-sm">
              <Icon className="text-foreground/55 size-5" strokeWidth={1.25} />
            </span>
            <span className="grid min-w-0">
              <span className="font-heading truncate text-xl leading-tight">
                {entry.name}
              </span>
              <span className="text-muted-foreground text-xs">Lent by {entry.owner}</span>
            </span>
            <StatusDot tone={entry.tone}>{entry.status}</StatusDot>
          </div>
        );
      })}
    </figure>
  );
}
