import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";

export function EmptyState({
  icon: Icon,
  title,
  description,
  action,
}: {
  readonly icon: LucideIcon;
  readonly title: string;
  readonly description: string;
  readonly action?: ReactNode;
}) {
  return (
    <div className="bg-card grid justify-items-center gap-3 rounded-2xl border border-dashed px-6 py-14 text-center">
      <span className="bg-accent text-accent-foreground grid size-12 place-items-center rounded-full">
        <Icon className="size-6" aria-hidden />
      </span>
      <div className="grid gap-1">
        <p className="font-heading text-lg font-semibold">{title}</p>
        <p className="text-muted-foreground max-w-sm text-sm">{description}</p>
      </div>
      {action}
    </div>
  );
}
