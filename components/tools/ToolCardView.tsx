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
    <Link
      href={`/tools/${tool._id}`}
      className="group bg-card focus-visible:ring-ring/50 flex flex-col overflow-hidden rounded-2xl border transition-all outline-none hover:-translate-y-0.5 hover:shadow-lg focus-visible:ring-3"
    >
      <div className="relative">
        <ToolPhoto
          photo={tool.photos[0]}
          category={tool.category}
          className="aspect-[4/3] w-full transition-transform duration-300 group-hover:scale-[1.02]"
        />
        <div className="absolute top-3 right-3">
          <AvailabilityBadge bookings={tool.bookings} />
        </div>
      </div>
      <div className="grid gap-1 p-4">
        <h2 className="truncate text-base font-semibold">{tool.name}</h2>
        <p className="text-muted-foreground text-sm">
          {categoryLabel[tool.category]} · {conditionLabel[tool.condition]}
        </p>
        <p className="text-muted-foreground mt-2 flex items-center gap-2 text-sm">
          <Avatar name={tool.owner.firstName} className="size-6 text-xs" />
          {tool.isMine ? "Your listing" : tool.owner.firstName}
          {tool.owner.trustedLender && <TrustedBadge />}
        </p>
      </div>
    </Link>
  );
}
