import { cn } from "~/lib/utils";
import type { Category } from "~/shared/domain/Category";
import { categoryIcon } from "./categoryStyle";

const SIZES = {
  sm: "size-9 rounded-md [&>svg]:size-4",
  md: "size-14 rounded-md [&>svg]:size-6",
  lg: "size-20 rounded-lg [&>svg]:size-8",
} as const;

export function CategoryIcon({
  category,
  size = "md",
  className,
}: {
  readonly category: Category;
  readonly size?: keyof typeof SIZES;
  readonly className?: string;
}) {
  const Icon = categoryIcon[category];
  return (
    <span
      className={cn(
        "bg-muted text-foreground/60 grid shrink-0 place-items-center",
        SIZES[size],
        className,
      )}
    >
      <Icon strokeWidth={1.25} aria-hidden />
    </span>
  );
}
