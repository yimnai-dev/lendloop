import type { Category } from "~/shared/domain/Category";
import { cn } from "~/lib/utils";
import { categoryStyle } from "./categoryStyle";

const SIZES = {
  sm: "size-7 rounded-md [&>svg]:size-4",
  md: "size-10 rounded-lg [&>svg]:size-5",
  lg: "size-16 rounded-2xl [&>svg]:size-8",
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
  const { Icon, tint } = categoryStyle[category];
  return (
    <span
      className={cn("grid shrink-0 place-items-center", tint, SIZES[size], className)}
    >
      <Icon aria-hidden />
    </span>
  );
}
