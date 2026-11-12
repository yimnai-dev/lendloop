import type { Photo } from "~/confect/views";
import { cn } from "~/lib/utils";
import type { Category } from "~/shared/domain/Category";
import { categoryIcon } from "./categoryStyle";

/** A tool's photo, or its category's line drawing on paper when there is none. */
export function ToolPhoto({
  photo,
  category,
  className,
  iconClassName,
}: {
  readonly photo: Photo | undefined;
  readonly category: Category;
  readonly className?: string;
  readonly iconClassName?: string;
}) {
  if (photo !== undefined) {
    // Convex storage URLs are signed and short-lived; skip next/image.
    return (
      // oxlint-disable-next-line nextjs/no-img-element
      <img src={photo.url} alt="" className={cn("bg-muted object-cover", className)} />
    );
  }
  const Icon = categoryIcon[category];
  return (
    <div className={cn("bg-muted grid place-items-center", className)}>
      <Icon
        className={cn("text-foreground/45 size-16", iconClassName)}
        strokeWidth={1}
        aria-hidden
      />
    </div>
  );
}
