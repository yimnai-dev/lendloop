import * as Result from "effect/Result";
import type { DateRange } from "./DateRange";
import { InvalidRequest } from "./errors";
import { addDays, compare, daysBetween, type IsoDate } from "./IsoDate";

export const MAX_LOAN_DAYS = 14;
export const MAX_ADVANCE_DAYS = 60;

/** Loan length in days, counting both ends (Mon–Wed is 3 days). */
export const loanLength = (range: DateRange): number =>
  daysBetween(range.startDate, range.endDate) + 1;

/** Rules that depend on "today", so they can't live in the schema itself. */
export const checkRequestWindow = (
  range: DateRange,
  today: IsoDate,
): Result.Result<DateRange, InvalidRequest> => {
  if (compare(range.startDate, today) < 0) {
    return Result.fail(new InvalidRequest({ reason: "Start date is in the past" }));
  }
  if (compare(range.startDate, addDays(today, MAX_ADVANCE_DAYS)) > 0) {
    return Result.fail(
      new InvalidRequest({
        reason: `Requests open at most ${MAX_ADVANCE_DAYS} days ahead`,
      }),
    );
  }
  if (loanLength(range) > MAX_LOAN_DAYS) {
    return Result.fail(
      new InvalidRequest({ reason: `Loans last at most ${MAX_LOAN_DAYS} days` }),
    );
  }
  return Result.succeed(range);
};
