import type { ReactNode } from "react";

/** Card frame for admin tables, scrolling sideways on narrow screens. */
export function Panel({ children }: { readonly children: ReactNode }) {
  return (
    <div className="bg-card overflow-x-auto rounded-2xl border shadow-xs [&_td]:px-4 [&_th]:px-4">
      {children}
    </div>
  );
}
