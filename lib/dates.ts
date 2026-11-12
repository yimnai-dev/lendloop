import type { IsoDate } from "~/shared/domain/IsoDate";

/** ISO calendar dates are zone-less, so format them as UTC midnight. */
const toUtc = (date: IsoDate) => new Date(`${date}T00:00:00Z`);
const short = new Intl.DateTimeFormat("en", {
  month: "short",
  day: "numeric",
  timeZone: "UTC",
});

/** "Nov 13 – 15", "Nov 30 – Dec 2". */
export const formatRange = (start: IsoDate, end: IsoDate) =>
  short.formatRange(toUtc(start), toUtc(end));

export const formatDate = (date: IsoDate) => short.format(toUtc(date));

const stamp = new Intl.DateTimeFormat("en", { dateStyle: "medium", timeStyle: "short" });
export const formatTimestamp = (epochMs: number) => stamp.format(epochMs);
