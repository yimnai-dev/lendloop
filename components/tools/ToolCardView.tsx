"use client";

import Link from "next/link";
import { Avatar } from "~/components/app/Avatar";
import type { ToolCard } from "~/confect/views";
import { categoryLabel } from "~/shared/domain/Category";
import { conditionLabel } from "~/shared/domain/Condition";
import { AvailabilityBadge } from "./AvailabilityBadge";
import { ToolPhoto } from "./ToolPhoto";
import { TrustedBadge } from "./TrustedBadge";

export function ToolCardView({ tool }: { readonly tool: ToolCard }) {
  return (
    <Link href={`/tools/${tool._id}`} className="group grid content-start outline-none">
      <div className="group-focus-visible:ring-ring/40 relative overflow-hidden rounded-md group-focus-visible:ring-3">
        <ToolPhoto
          photo={tool.photos[0]}
          category={tool.category}
          className="aspect-square w-full transition-transform duration-500 ease-out group-hover:scale-[1.03]"
        />
        <span className="eyebrow absolute top-4 left-4 text-[10px]">
          {categoryLabel[tool.category]}
        </span>
      </div>
      <h2 className="mt-4 truncate text-[1.65rem] leading-tight group-hover:underline group-hover:decoration-1 group-hover:underline-offset-4">
        {tool.name}
      </h2>
      <p className="text-muted-foreground mt-0.5 text-[13px]">
        {conditionLabel[tool.condition]} condition
      </p>
      <div className="text-muted-foreground mt-4 flex items-center justify-between gap-3 border-t pt-3 text-[13px]">
        <span className="flex min-w-0 items-center gap-2">
          <Avatar name={tool.owner.firstName} className="size-6 text-[10px]" />
          <span className="truncate">{tool.isMine ? "You" : tool.owner.firstName}</span>
          {tool.owner.trustedLender && <TrustedBadge />}
        </span>
        <AvailabilityBadge bookings={tool.bookings} />
      </div>
    </Link>
  );
}
