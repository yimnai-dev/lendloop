"use client";

import type { DateRange as DayRange, Matcher } from "react-day-picker";
import { Calendar } from "~/components/ui/calendar";
import type { DateRange } from "~/shared/domain/DateRange";
import { addDays, type IsoDate } from "~/shared/domain/IsoDate";
import { MAX_ADVANCE_DAYS, MAX_LOAN_DAYS } from "~/shared/domain/loanRequest";

/** IsoDates are zone-less; the picker runs in UTC so midnight never drifts a day. */
const toDate = (date: string) => new Date(`${date}T00:00:00Z`);
const toIso = (date: Date): string => date.toISOString().slice(0, 10);

const toDayRange = (range: RawRange): { from: Date; to: Date } => ({
  from: toDate(range.startDate),
  to: toDate(range.endDate),
});

/** Raw form input: dates not yet decoded to IsoDate. */
type RawRange = typeof DateRange.Encoded;

const BOOKED =
  "[&>button]:text-muted-foreground [&>button]:line-through bg-[repeating-linear-gradient(135deg,var(--color-border)_0_3px,transparent_3px_7px)] rounded-(--cell-radius) [&>button]:opacity-100";

export function RangePicker({
  value,
  today,
  booked,
  onChange,
}: {
  readonly value: RawRange;
  readonly today: IsoDate;
  readonly booked: ReadonlyArray<DateRange>;
  readonly onChange: (range: RawRange) => void;
}) {
  const bookedDays = booked.map(toDayRange);
  const disabled: Array<Matcher> = [
    { before: toDate(today) },
    { after: toDate(addDays(today, MAX_ADVANCE_DAYS + MAX_LOAN_DAYS)) },
    ...bookedDays,
  ];
  const onSelect = (range: DayRange | undefined) => {
    // Clicking the lone selected day clears it; keep the last valid range instead.
    if (range?.from === undefined) return;
    const startDate = toIso(range.from);
    onChange({
      startDate,
      endDate: range.to === undefined ? startDate : toIso(range.to),
    });
  };
  return (
    <div className="bg-card/60 rounded-lg border px-4 py-4 sm:px-5">
      <Calendar
        mode="range"
        timeZone="UTC"
        weekStartsOn={1}
        excludeDisabled
        min={0}
        max={MAX_LOAN_DAYS - 1}
        selected={toDayRange(value)}
        onSelect={onSelect}
        defaultMonth={toDate(value.startDate)}
        disabled={disabled}
        modifiers={{ booked: bookedDays }}
        modifiersClassNames={{ booked: BOOKED }}
        className="w-full bg-transparent p-0 [--cell-radius:0.25rem] [--cell-size:--spacing(9)]"
        classNames={{
          root: "w-full",
          caption_label: "font-heading text-2xl font-normal",
          weekday: "eyebrow flex-1 text-[10px] font-normal",
        }}
      />
      <div className="text-muted-foreground mt-3 flex gap-5 border-t pt-3 text-[11.5px]">
        <span className="flex items-center gap-1.5">
          <i className="bg-foreground size-2.5 rounded-[2px]" aria-hidden />
          Your request
        </span>
        <span className="flex items-center gap-1.5">
          <i
            className="size-2.5 rounded-[2px] bg-[repeating-linear-gradient(135deg,var(--color-muted-foreground)_0_1.5px,transparent_1.5px_3.5px)]"
            aria-hidden
          />
          Already booked
        </span>
      </div>
    </div>
  );
}
