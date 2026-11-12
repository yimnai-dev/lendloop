import { describe, expect, it } from "vitest";
import type { LoanStatus } from "./LoanStatus";
import { availability, daysOverdue, isActive, isOverdue } from "./loanView";
import { d } from "./testing";

const loan = (status: LoanStatus, startDate: string, endDate: string) => ({
  status,
  startDate: d(startDate),
  endDate: d(endDate),
});

const today = d("2026-11-12");

describe("loan view", () => {
  it("is active only while approved and within its dates", () => {
    expect(isActive(loan("approved", "2026-11-10", "2026-11-12"), today)).toBe(true);
    expect(isActive(loan("approved", "2026-11-13", "2026-11-15"), today)).toBe(false);
    expect(isActive(loan("pending", "2026-11-10", "2026-11-14"), today)).toBe(false);
  });

  it("is overdue the day after the end date, never for returned loans", () => {
    expect(isOverdue(loan("approved", "2026-11-01", "2026-11-12"), today)).toBe(false);
    expect(isOverdue(loan("approved", "2026-11-01", "2026-11-11"), today)).toBe(true);
    expect(isOverdue(loan("returned", "2026-11-01", "2026-11-05"), today)).toBe(false);
    expect(daysOverdue(loan("approved", "2026-11-01", "2026-11-09"), today)).toBe(3);
    expect(daysOverdue(loan("approved", "2026-11-01", "2026-11-20"), today)).toBe(0);
  });

  it("derives availability, with overdue taking priority", () => {
    expect(availability([], today)).toEqual({ _tag: "Available" });
    expect(availability([loan("approved", "2026-11-20", "2026-11-22")], today)).toEqual({
      _tag: "Available",
    });
    expect(availability([loan("approved", "2026-11-10", "2026-11-14")], today)).toEqual({
      _tag: "OnLoan",
      until: "2026-11-14",
    });
    expect(
      availability(
        [
          loan("approved", "2026-11-12", "2026-11-14"),
          loan("approved", "2026-11-01", "2026-11-05"),
        ],
        today,
      ),
    ).toEqual({ _tag: "Overdue", since: "2026-11-05" });
  });
});
