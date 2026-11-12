import * as Schema from "effect/Schema";
import { Temporal } from "temporal-polyfill";

const toPlainDate = (value: string): Temporal.PlainDate | undefined => {
  try {
    return Temporal.PlainDate.from(value, { overflow: "reject" });
  } catch {
    return undefined;
  }
};

/**
 * A calendar date (`YYYY-MM-DD`) with no time or zone. Lending is day-based,
 * so loans store plain dates and "today" is resolved in the app's time zone.
 */
export const IsoDate = Schema.String.check(
  Schema.isPattern(/^\d{4}-\d{2}-\d{2}$/, { message: "Expected a date as YYYY-MM-DD" }),
  Schema.makeFilter(
    (value: string) => toPlainDate(value) !== undefined || "Not a real calendar date",
  ),
).pipe(Schema.brand("IsoDate"));

export type IsoDate = typeof IsoDate.Type;

const decode = Schema.decodeSync(IsoDate);

const fromPlainDate = (date: Temporal.PlainDate): IsoDate => decode(date.toString());

const plain = (date: IsoDate): Temporal.PlainDate => Temporal.PlainDate.from(date);

/** Today's date in `timeZone` at `epochMs`. */
export const todayIn = (timeZone: string, epochMs: number): IsoDate =>
  fromPlainDate(
    Temporal.Instant.fromEpochMilliseconds(epochMs)
      .toZonedDateTimeISO(timeZone)
      .toPlainDate(),
  );

/** Negative when `a` is before `b`, zero when equal, positive when after. */
export const compare = (a: IsoDate, b: IsoDate): number =>
  Temporal.PlainDate.compare(plain(a), plain(b));

export const addDays = (date: IsoDate, days: number): IsoDate =>
  fromPlainDate(plain(date).add({ days }));

/** Whole days from `from` to `to` (positive when `to` is later). */
export const daysBetween = (from: IsoDate, to: IsoDate): number =>
  plain(from).until(plain(to), { largestUnit: "days" }).days;
