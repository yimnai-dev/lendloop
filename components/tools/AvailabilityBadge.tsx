"use client";

import { Badge } from "~/components/ui/badge";
import { today } from "~/lib/today";
import { availability } from "~/shared/domain/loanView";
import type { Booking } from "~/confect/views";

/** Derived on render from approved bookings; nothing about it is stored. */
export function AvailabilityBadge({
  bookings,
}: {
  readonly bookings: ReadonlyArray<Booking>;
}) {
  const state = availability(
    bookings.map((booking) => ({ ...booking, status: "approved" as const })),
    today(),
  );
  switch (state._tag) {
    case "Available":
      return <Badge variant="secondary">Available</Badge>;
    case "OnLoan":
      return <Badge variant="outline">On loan until {state.until}</Badge>;
    case "Overdue":
      return <Badge variant="destructive">Overdue since {state.since}</Badge>;
  }
}
