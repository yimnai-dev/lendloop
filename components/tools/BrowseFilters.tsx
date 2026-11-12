"use client";

import { useQueryStates } from "nuqs";
import { Label } from "~/components/ui/label";
import { Switch } from "~/components/ui/switch";
import { browseParams } from "~/lib/searchParams";
import { cn } from "~/lib/utils";
import { CATEGORIES, type Category, categoryLabel } from "~/shared/domain/Category";

function Tab({
  active,
  onClick,
  children,
}: {
  readonly active: boolean;
  readonly onClick: () => void;
  readonly children: string;
}) {
  return (
    <button
      type="button"
      aria-pressed={active}
      onClick={onClick}
      className={cn(
        "shrink-0 border-b py-1 text-[13px] transition-colors",
        active
          ? "border-foreground text-foreground font-medium"
          : "text-muted-foreground hover:text-foreground border-transparent",
      )}
    >
      {children}
    </button>
  );
}

export function BrowseFilters() {
  const [{ category, trusted }, setParams] = useQueryStates(browseParams);
  const pick = (next: Category | null) => () => {
    void setParams({ category: next });
  };
  return (
    <div className="grid grid-cols-1 items-center gap-4 border-y py-4 lg:grid-cols-[minmax(0,1fr)_auto]">
      <fieldset className="max-w-full min-w-0">
        <legend className="sr-only">Category</legend>
        <div className="-mx-1 flex gap-6 overflow-x-auto px-1">
          <Tab active={category === null} onClick={pick(null)}>
            All
          </Tab>
          {CATEGORIES.map((c) => (
            <Tab key={c} active={category === c} onClick={pick(c)}>
              {categoryLabel[c]}
            </Tab>
          ))}
        </div>
      </fieldset>
      <Label className="text-muted-foreground flex items-center gap-2.5 text-[13px] font-normal">
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
