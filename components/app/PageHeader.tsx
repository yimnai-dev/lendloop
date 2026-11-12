import type { ReactNode } from "react";

export function PageHeader({
  title,
  description,
  actions,
}: {
  readonly title: string;
  readonly description?: string;
  readonly actions?: ReactNode;
}) {
  return (
    <header className="flex flex-wrap items-end justify-between gap-4">
      <div className="grid gap-1">
        <h1 className="text-3xl font-semibold">{title}</h1>
        {description !== undefined && (
          <p className="text-muted-foreground">{description}</p>
        )}
      </div>
      {actions}
    </header>
  );
}
