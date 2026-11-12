import type { ReactNode } from "react";

/** Hairline table frame; scrolls sideways on narrow screens. */
export function Panel({ children }: { readonly children: ReactNode }) {
  return (
    <div className="overflow-x-auto border-t [&_td]:py-3.5 [&_td]:pr-6 [&_td:first-child]:pl-0 [&_th]:eyebrow [&_th]:h-11 [&_th]:pr-6 [&_th]:text-[10px] [&_th:first-child]:pl-0 [&_tr]:hover:bg-transparent">
      {children}
    </div>
  );
}
