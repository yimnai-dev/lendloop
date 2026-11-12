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
    <div className="grid justify-items-center gap-4 border-y px-6 py-20 text-center">
      <Icon className="text-muted-foreground size-8" strokeWidth={1.25} aria-hidden />
      <div className="grid gap-2">
        <p className="font-heading text-3xl">{title}</p>
        <p className="text-muted-foreground max-w-sm text-sm leading-relaxed">
          {description}
        </p>
      </div>
      {action}
    </div>
  );
}
