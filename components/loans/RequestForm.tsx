"use client";

import { useMutation } from "@confect/react";
import { useForm } from "@tanstack/react-form";
import * as Result from "effect/Result";
import * as Schema from "effect/Schema";
import { FieldError } from "~/components/form/FieldError";
import { Button } from "~/components/ui/button";
import type { Id } from "~/confect/_generated/id";
import refs from "~/confect/_generated/refs";
import { dayCount, formatRange } from "~/lib/dates";
import { toastResult } from "~/lib/mutationResult";
import { today } from "~/lib/today";
import { DateRange, overlaps } from "~/shared/domain/DateRange";
import { addDays, compare, type IsoDate } from "~/shared/domain/IsoDate";
import { checkRequestWindow, MAX_LOAN_DAYS } from "~/shared/domain/loanRequest";
import { RangePicker } from "./RangePicker";

const decodeRange = Schema.decodeUnknownOption(DateRange);

/** The window rules depend on "today", so they run beside the schema. */
const windowError = (value: unknown) => {
  const range = decodeRange(value);
  if (range._tag === "None") return undefined;
  return Result.match(checkRequestWindow(range.value, today()), {
    onSuccess: () => undefined,
    onFailure: (error) => error.reason,
  });
};

/** First free day from today, so the default selection never sits on a booking. */
const firstFreeDay = (from: IsoDate, booked: ReadonlyArray<DateRange>): IsoDate => {
  const clash = booked.find((b) => overlaps(b, { startDate: from, endDate: from }));
  return clash === undefined ? from : firstFreeDay(addDays(clash.endDate, 1), booked);
};

/** The longest run (up to 3 days) starting at `start` that avoids bookings. */
const defaultRange = (start: IsoDate, booked: ReadonlyArray<DateRange>): DateRange => {
  const next = booked
    .map((b) => b.startDate)
    .filter((d) => compare(d, start) > 0)
    .toSorted(compare)[0];
  const end = addDays(start, 2);
  return {
    startDate: start,
    endDate: next !== undefined && compare(next, end) <= 0 ? addDays(next, -1) : end,
  };
};

const ctaLabel = (values: typeof DateRange.Encoded) => {
  const range = decodeRange(values);
  if (range._tag === "None") return "Request to borrow";
  const { startDate, endDate } = range.value;
  const days = dayCount(startDate, endDate);
  return `Request ${formatRange(startDate, endDate)} · ${days} ${days === 1 ? "day" : "days"}`;
};

export function RequestForm({
  toolId,
  lender,
  booked,
}: {
  readonly toolId: Id<"tools">;
  readonly lender: string;
  readonly booked: ReadonlyArray<DateRange>;
}) {
  const request = useMutation(refs.public.loans.request);
  const start = today();
  // Form state is raw input: the schema's encoded side, decoded on submit.
  const defaultValues: typeof DateRange.Encoded = defaultRange(
    firstFreeDay(start, booked),
    booked,
  );
  const form = useForm({
    defaultValues,
    validators: {
      onChange: Schema.toStandardSchemaV1(DateRange),
      onSubmit: ({ value }) => windowError(value),
    },
    onSubmit: async ({ value }) => {
      const dates = Schema.decodeUnknownSync(DateRange)(value);
      await toastResult(request({ toolId, dates }), "Request sent to the owner");
    },
  });

  return (
    <form
      className="grid gap-5"
      onSubmit={(event) => {
        event.preventDefault();
        void form.handleSubmit();
      }}
    >
      <form.Subscribe
        selector={(state) =>
          [state.values, state.errorMap.onSubmit, state.isSubmitting] as const
        }
      >
        {([values, submitError, isSubmitting]) => (
          <>
            <RangePicker
              value={values}
              today={start}
              booked={booked}
              onChange={(range) => {
                form.setFieldValue("startDate", range.startDate);
                form.setFieldValue("endDate", range.endDate);
              }}
            />
            <FieldError errors={[submitError]} />
            <div className="grid gap-2.5">
              <Button type="submit" size="lg" disabled={isSubmitting} className="w-full">
                {isSubmitting ? "Sending…" : ctaLabel(values)}
              </Button>
              <p className="text-muted-foreground text-center text-xs">
                {lender} gets an email and decides. Up to {MAX_LOAN_DAYS} days per loan.
              </p>
            </div>
          </>
        )}
      </form.Subscribe>
    </form>
  );
}
