"use client";

import { useQueryStates } from "nuqs";
import { Label } from "~/components/ui/label";
import { Switch } from "~/components/ui/switch";
import { browseParams } from "~/lib/searchParams";
import { cn } from "~/lib/utils";
import { CATEGORIES, type Category, categoryLabel } from "~/shared/domain/Category";
import { categoryStyle } from "./categoryStyle";

const chip =
  "flex shrink-0 items-center gap-1.5 rounded-full border px-3 py-1.5 text-sm font-medium transition-colors";
const chipIdle =
  "bg-card text-muted-foreground hover:text-foreground hover:border-foreground/20";
const chipActive = "bg-foreground text-background border-foreground";

function Chip({
  active,
  onClick,
  category,
}: {
  readonly active: boolean;
  readonly onClick: () => void;
  readonly category: Category | null;
}) {
  const Icon = category === null ? null : categoryStyle[category].Icon;
  return (
    <button
      type="button"
      aria-pressed={active}
      onClick={onClick}
      className={cn(chip, active ? chipActive : chipIdle)}
    >
      {Icon !== null && <Icon className="size-3.5" aria-hidden />}
      {category === null ? "All" : categoryLabel[category]}
    </button>
  );
}

export function BrowseFilters() {
  const [{ category, trusted }, setParams] = useQueryStates(browseParams);
  const pick = (next: Category | null) => () => {
    void setParams({ category: next });
  };
  return (
    <div className="grid grid-cols-1 items-center gap-3 lg:grid-cols-[minmax(0,1fr)_auto]">
      <fieldset className="min-w-0 max-w-full">
        <legend className="sr-only">Category</legend>
        <div className="-mx-1 flex gap-1.5 overflow-x-auto px-1 pb-1">
          <Chip active={category === null} onClick={pick(null)} category={null} />
          {CATEGORIES.map((c) => (
            <Chip key={c} active={category === c} onClick={pick(c)} category={c} />
          ))}
        </div>
      </fieldset>
      <Label className="text-muted-foreground flex items-center gap-2 text-sm font-medium">
        <Switch
          checked={trusted}
          onCheckedChange={(checked) => {
            void setParams({ trusted: checked });
          }}
        />
        Trusted lenders only
      </Label>
    </div>
  );
}
