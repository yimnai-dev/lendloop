"use client";

import { cn } from "~/lib/utils";

/** Underlined text tabs, the app's one tab style. Values are typed by the caller's literal union. */
export function TextTabs<T extends string>({
  label,
  value,
  options,
  onChange,
}: {
  readonly label: string;
  readonly value: T;
  readonly options: ReadonlyArray<{ readonly value: T; readonly label: string }>;
  readonly onChange: (value: T) => void;
}) {
  return (
    <div
      role="tablist"
      aria-label={label}
      className="flex gap-7 overflow-x-auto border-b"
    >
      {options.map((option) => (
        <button
          key={option.value}
          type="button"
          role="tab"
          aria-selected={option.value === value}
          onClick={() => onChange(option.value)}
          className={cn(
            "-mb-px shrink-0 border-b pb-3 text-[13px] transition-colors",
            option.value === value
              ? "border-foreground text-foreground font-medium"
              : "text-muted-foreground hover:text-foreground border-transparent",
          )}
        >
          {option.label}
        </button>
      ))}
    </div>
  );
}
