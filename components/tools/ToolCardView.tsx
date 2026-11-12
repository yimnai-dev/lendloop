"use client";

import Link from "next/link";
import { Badge } from "~/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import type { ToolCard } from "~/confect/views";
import { categoryLabel } from "~/shared/domain/Category";
import { conditionLabel } from "~/shared/domain/Condition";
import { AvailabilityBadge } from "./AvailabilityBadge";
import { TrustedBadge } from "./TrustedBadge";

export function ToolCardView({ tool }: { readonly tool: ToolCard }) {
  const [cover] = tool.photos;
  return (
    <Link href={`/tools/${tool._id}`} className="group">
      <Card className="h-full overflow-hidden pt-0 transition-shadow group-hover:shadow-md">
        <div className="bg-muted aspect-[4/3]">
          {cover !== undefined && (
            // Convex storage URLs are signed and short-lived; skip next/image.
            // oxlint-disable-next-line nextjs/no-img-element
            <img src={cover.url} alt="" className="size-full object-cover" />
          )}
        </div>
        <CardHeader>
          <CardTitle className="flex items-start justify-between gap-2">
            {tool.name}
            <AvailabilityBadge bookings={tool.bookings} />
          </CardTitle>
        </CardHeader>
        <CardContent className="text-muted-foreground grid gap-2 text-sm">
          <div className="flex flex-wrap gap-1.5">
            <Badge variant="outline">{categoryLabel[tool.category]}</Badge>
            <Badge variant="outline">{conditionLabel[tool.condition]}</Badge>
          </div>
          <span className="flex items-center gap-2">
            {tool.isMine ? "Your listing" : `Lent by ${tool.owner.firstName}`}
            {tool.owner.trustedLender && <TrustedBadge />}
          </span>
        </CardContent>
      </Card>
    </Link>
  );
}
