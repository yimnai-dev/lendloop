import { BadgeCheckIcon } from "lucide-react";
import { CategoryIcon } from "~/components/tools/CategoryIcon";
import { Badge } from "~/components/ui/badge";
import type { Category } from "~/shared/domain/Category";

const CARDS: ReadonlyArray<{
  readonly name: string;
  readonly category: Category;
  readonly owner: string;
  readonly status: "Available" | "Back Fri";
  readonly className: string;
}> = [
  {
    name: "Cordless drill",
    category: "power_tools",
    owner: "Maya",
    status: "Available",
    className: "-rotate-3 translate-x-2",
  },
  {
    name: "Hedge trimmer",
    category: "garden",
    owner: "Priya",
    status: "Back Fri",
    className: "rotate-2 -translate-x-4",
  },
  {
    name: "4-person tent",
    category: "camping",
    owner: "Sam",
    status: "Available",
    className: "-rotate-1 translate-x-6",
  },
];

/** Decorative: what a listing looks like, without fetching anything. */
export function HeroArt() {
  return (
    <div aria-hidden className="relative grid gap-3 py-4">
      <div className="bg-accent absolute inset-0 -z-10 rounded-[2rem] rotate-2" />
      {CARDS.map((card) => (
        <div
          key={card.name}
          className={`bg-card flex items-center gap-3 rounded-2xl border p-3 shadow-sm ${card.className}`}
        >
          <CategoryIcon category={card.category} />
          <div className="grid flex-1">
            <span className="font-medium">{card.name}</span>
            <span className="text-muted-foreground flex items-center gap-1 text-xs">
              Lent by {card.owner}
              {card.owner === "Maya" && (
                <BadgeCheckIcon className="size-3.5 text-emerald-600" />
              )}
            </span>
          </div>
          <Badge variant={card.status === "Available" ? "success" : "warning"}>
            {card.status}
          </Badge>
        </div>
      ))}
    </div>
  );
}
