import * as Result from "effect/Result";
import { describe, expect, it } from "vitest";
import { checkRequestWindow, loanLength } from "./loanRequest";
import { d } from "./testing";

const today = d("2026-11-12");
const range = (startDate: string, endDate: string) => ({
  startDate: d(startDate),
  endDate: d(endDate),
});

describe("loan request window", () => {
  it("counts both ends of the range", () => {
    expect(loanLength(range("2026-11-12", "2026-11-12"))).toBe(1);
    expect(loanLength(range("2026-11-12", "2026-11-14"))).toBe(3);
  });

  it.each([
    ["starts today", "2026-11-12", "2026-11-12"],
    ["lasts exactly 14 days", "2026-11-12", "2026-11-25"],
    ["starts exactly 60 days ahead", "2027-01-11", "2027-01-12"],
  ])("accepts a request that %s", (_label, start, end) => {
    expect(Result.isSuccess(checkRequestWindow(range(start, end), today))).toBe(true);
  });

  it.each([
    ["starts in the past", "2026-11-11", "2026-11-13"],
    ["lasts 15 days", "2026-11-12", "2026-11-26"],
    ["starts 61 days ahead", "2027-01-12", "2027-01-13"],
  ])("rejects a request that %s", (_label, start, end) => {
    expect(Result.isFailure(checkRequestWindow(range(start, end), today))).toBe(true);
  });
});
