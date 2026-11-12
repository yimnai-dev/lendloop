"use client";

import { useQueryStates } from "nuqs";
import { Label } from "~/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";
import { browseParams } from "~/lib/searchParams";
import { CATEGORIES, categoryLabel } from "~/shared/domain/Category";

const ALL = "all";

export function BrowseFilters() {
  const [{ category, trusted }, setParams] = useQueryStates(browseParams);
  return (
    <div className="flex flex-wrap items-center gap-4">
      <Select
        value={category ?? ALL}
        onValueChange={(value) => {
          void setParams({ category: CATEGORIES.find((c) => c === value) ?? null });
        }}
      >
        <SelectTrigger className="w-48" aria-label="Category">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value={ALL}>All categories</SelectItem>
          {CATEGORIES.map((c) => (
            <SelectItem key={c} value={c}>
              {categoryLabel[c]}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <Label className="flex items-center gap-2 text-sm font-normal">
        <input
          type="checkbox"
          checked={trusted}
          onChange={(event) => {
            void setParams({ trusted: event.target.checked });
          }}
        />
        Trusted lenders only
      </Label>
    </div>
  );
}
