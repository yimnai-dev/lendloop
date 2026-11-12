import type { LoanView } from "~/confect/views";
import type { AutomationKind } from "~/confect/tables/automationEvents";

export type TimelineEntry = { readonly at: number; readonly label: string };

const AUTOMATION_LABELS: Record<typeof AutomationKind.Type, string> = {
  notification_delivered: "Email notification sent",
  notification_dead: "Email notification failed",
  reminder_sent: "Overdue reminder sent",
  reminder_failed: "Overdue reminder failed",
  workflow_error: "Automation error",
};

const DECISION_LABELS: Partial<Record<LoanView["status"], string>> = {
  approved: "Approved",
  declined: "Declined",
  cancelled: "Cancelled",
  returned: "Approved",
};

/** Merges lifecycle timestamps with automation events, newest first. */
export const timeline = (loan: LoanView): ReadonlyArray<TimelineEntry> => {
  const decision = DECISION_LABELS[loan.status];
  const lifecycle: ReadonlyArray<TimelineEntry> = [
    { at: loan.requestedAt, label: "Requested" },
    ...(loan.decidedAt !== null && decision !== undefined
      ? [{ at: loan.decidedAt, label: decision }]
      : []),
    ...(loan.returnedAt !== null ? [{ at: loan.returnedAt, label: "Returned" }] : []),
  ];
  const automation = loan.activity.map(({ kind, at }) => ({
    at,
    label: AUTOMATION_LABELS[kind],
  }));
  return [...lifecycle, ...automation].toSorted((a, b) => b.at - a.at);
};
