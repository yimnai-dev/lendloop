import * as Exit from "effect/Exit";
import * as Schema from "effect/Schema";
import { describe, expect, it } from "vitest";
import { DateRange, overlaps } from "./DateRange";
import { addDays, compare, daysBetween, IsoDate, todayIn } from "./IsoDate";
import { d } from "./testing";

const decodes = (input: unknown) =>
  Exit.isSuccess(Schema.decodeUnknownExit(IsoDate)(input));

describe("IsoDate", () => {
  it("accepts real calendar dates only", () => {
    expect(decodes("2026-11-12")).toBe(true);
    expect(decodes("2024-02-29")).toBe(true);
    expect(decodes("2026-02-29")).toBe(false);
    expect(decodes("2026-13-01")).toBe(false);
    expect(decodes("2026-1-1")).toBe(false);
    expect(decodes("2026-11-12T00:00:00Z")).toBe(false);
    expect(decodes(20261112)).toBe(false);
  });

  it("does arithmetic across month boundaries", () => {
    expect(addDays(d("2026-11-30"), 1)).toBe("2026-12-01");
    expect(daysBetween(d("2026-11-28"), d("2026-12-02"))).toBe(4);
    expect(compare(d("2026-01-02"), d("2026-01-01"))).toBeGreaterThan(0);
  });

  it("resolves today in the given time zone", () => {
    const instant = Date.UTC(2026, 10, 12, 23, 30); // 23:30 UTC on Nov 12
    expect(todayIn("UTC", instant)).toBe("2026-11-12");
    expect(todayIn("Africa/Lagos", instant)).toBe("2026-11-13"); // UTC+1
    expect(todayIn("America/New_York", instant)).toBe("2026-11-12");
  });
});

const range = (startDate: string, endDate: string) => ({
  startDate: d(startDate),
  endDate: d(endDate),
});

describe("DateRange", () => {
  it("rejects ranges that end before they start", () => {
    const decode = Schema.decodeUnknownExit(DateRange);
    expect(
      Exit.isSuccess(decode({ startDate: "2026-11-12", endDate: "2026-11-12" })),
    ).toBe(true);
    expect(
      Exit.isSuccess(decode({ startDate: "2026-11-12", endDate: "2026-11-11" })),
    ).toBe(false);
  });

  it("treats ranges as inclusive when checking overlap", () => {
    expect(
      overlaps(range("2026-11-10", "2026-11-12"), range("2026-11-12", "2026-11-14")),
    ).toBe(true);
    expect(
      overlaps(range("2026-11-10", "2026-11-12"), range("2026-11-13", "2026-11-14")),
    ).toBe(false);
    expect(
      overlaps(range("2026-11-01", "2026-11-30"), range("2026-11-10", "2026-11-11")),
    ).toBe(true);
  });
});
