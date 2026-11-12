import * as Schema from "effect/Schema";
import { compare, IsoDate } from "./IsoDate";

/** Inclusive range: a loan from Mon to Wed occupies Mon, Tue and Wed. */
export const DateRange = Schema.Struct({
  startDate: IsoDate,
  endDate: IsoDate,
}).check(
  Schema.makeFilter(
    (range: { readonly startDate: IsoDate; readonly endDate: IsoDate }) =>
      compare(range.startDate, range.endDate) <= 0 || {
        path: ["endDate"],
        issue: "End date must be on or after the start date",
      },
  ),
);

export type DateRange = typeof DateRange.Type;

export const overlaps = (a: DateRange, b: DateRange): boolean =>
  compare(a.startDate, b.endDate) <= 0 && compare(b.startDate, a.endDate) <= 0;

export const contains = (range: DateRange, date: IsoDate): boolean =>
  compare(range.startDate, date) <= 0 && compare(date, range.endDate) <= 0;
