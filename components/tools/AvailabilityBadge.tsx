"use client";

import { Badge } from "~/components/ui/badge";
import type { Booking } from "~/confect/views";
import { formatDate } from "~/lib/dates";
import { today } from "~/lib/today";
import { availability } from "~/shared/domain/loanView";

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
      return <Badge variant="success">Available</Badge>;
    case "OnLoan":
      return <Badge variant="warning">Back {formatDate(state.until)}</Badge>;
    case "Overdue":
      return <Badge variant="destructive">Overdue</Badge>;
  }
}
