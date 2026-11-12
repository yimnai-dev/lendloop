import type { ReactNode } from "react";

export function PageHeader({
  eyebrow,
  title,
  description,
  actions,
}: {
  readonly eyebrow?: string;
  readonly title: ReactNode;
  readonly description?: string;
  readonly actions?: ReactNode;
}) {
  return (
    <header className="flex flex-wrap items-end justify-between gap-x-10 gap-y-5">
      <div className="grid max-w-3xl gap-3">
        {eyebrow !== undefined && <p className="eyebrow">{eyebrow}</p>}
        <h1 className="text-5xl leading-[0.95] sm:text-6xl">{title}</h1>
        {description !== undefined && (
          <p className="text-muted-foreground max-w-xl leading-relaxed">{description}</p>
        )}
      </div>
      {actions}
    </header>
  );
}
