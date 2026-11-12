import type { Photo } from "~/confect/views";
import { cn } from "~/lib/utils";
import type { Category } from "~/shared/domain/Category";
import { categoryStyle } from "./categoryStyle";

/** A tool's cover photo, or its category icon on a tinted backdrop when there is none. */
export function ToolPhoto({
  photo,
  category,
  className,
}: {
  readonly photo: Photo | undefined;
  readonly category: Category;
  readonly className?: string;
}) {
  if (photo !== undefined) {
    // Convex storage URLs are signed and short-lived; skip next/image.
    // oxlint-disable-next-line nextjs/no-img-element
    return <img src={photo.url} alt="" className={cn("object-cover", className)} />;
  }
  const { Icon, tint } = categoryStyle[category];
  return (
    <div className={cn("grid place-items-center", tint, className)}>
      <Icon className="size-12 opacity-80" strokeWidth={1.5} aria-hidden />
    </div>
  );
}
