"use client";

import { useMutation, useQuery } from "@confect/react";
import { QueryView } from "~/components/app/QueryView";
import { StatusDot } from "~/components/app/StatusDot";
import { AUTOMATION_LABELS } from "~/components/loans/timeline";
import { Button } from "~/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "~/components/ui/table";
import refs from "~/confect/_generated/refs";
import { toastResult } from "~/lib/mutationResult";
import { formatTimestamp } from "~/lib/dates";
import { cn } from "~/lib/utils";
import { Panel } from "./Panel";

function Stat({
  label,
  value,
  bad = false,
}: {
  readonly label: string;
  readonly value: number;
  readonly bad?: boolean;
}) {
  return (
    <div className="grid gap-3 border-t pt-4">
      <span className="eyebrow">{label}</span>
      <span
        className={cn(
          "font-heading text-6xl leading-none tabular-nums",
          bad && "text-rust",
        )}
      >
        {value}
      </span>
    </div>
  );
}

const FAILED = new Set(["notification_dead", "reminder_failed", "workflow_error"]);

export function AdminAutomation() {
  const health = useQuery(refs.public.admin.automation, {});
  const redrive = useMutation(refs.public.admin.redriveNotifications);
  return (
    <QueryView result={health}>
      {({ outbox, recent }) => (
        <div className="grid grid-cols-1 gap-8">
          <div className="flex flex-wrap items-end justify-between gap-3">
            <div className="grid gap-1">
              <h2 className="text-3xl">Notification outbox</h2>
              <p className="text-muted-foreground text-sm">
                Convex → n8n deliveries, retried with backoff.
              </p>
            </div>
            {outbox.dead > 0 && (
              <Button
                size="sm"
                onClick={() => {
                  void toastResult(redrive({}), "Failed notifications re-queued");
                }}
              >
                Retry failed
              </Button>
            )}
          </div>
          <div className="grid gap-8 sm:grid-cols-3">
            <Stat label="Pending" value={outbox.pending} />
            <Stat label="Delivered" value={outbox.delivered} />
            <Stat label="Failed" value={outbox.dead} bad={outbox.dead > 0} />
          </div>
          <h2 className="mt-8 text-3xl">Recent activity</h2>
          {recent.length === 0 ? (
            <p className="text-muted-foreground">No automation activity yet.</p>
          ) : (
            <Panel>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>When</TableHead>
                    <TableHead>Event</TableHead>
                    <TableHead>Tool</TableHead>
                    <TableHead>Detail</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {recent.map((event) => (
                    <TableRow key={event._id}>
                      <TableCell className="font-mono text-xs whitespace-nowrap">
                        {formatTimestamp(event.at)}
                      </TableCell>
                      <TableCell>
                        <StatusDot tone={FAILED.has(event.kind) ? "late" : "ok"}>
                          {AUTOMATION_LABELS[event.kind]}
                        </StatusDot>
                      </TableCell>
                      <TableCell>{event.toolName ?? "—"}</TableCell>
                      <TableCell className="text-muted-foreground max-w-md truncate text-sm">
                        {event.detail ?? ""}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </Panel>
          )}
        </div>
      )}
    </QueryView>
  );
}
