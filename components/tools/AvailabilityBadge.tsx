"use client";

import { StatusDot } from "~/components/app/StatusDot";
import type { Booking } from "~/confect/views";
import { formatWeekday } from "~/lib/dates";
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
      return <StatusDot tone="ok">Available</StatusDot>;
    case "OnLoan":
      return <StatusDot tone="wait">Back {formatWeekday(state.until)}</StatusDot>;
    case "Overdue":
      return <StatusDot tone="late">Overdue</StatusDot>;
  }
}
