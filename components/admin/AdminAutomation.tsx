"use client";

import { useMutation, useQuery } from "@confect/react";
import { QueryView } from "~/components/app/QueryView";
import { AUTOMATION_LABELS } from "~/components/loans/timeline";
import { Badge } from "~/components/ui/badge";
import { Button } from "~/components/ui/button";
import { Card, CardContent } from "~/components/ui/card";
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

const timeFormat = new Intl.DateTimeFormat(undefined, {
  dateStyle: "medium",
  timeStyle: "short",
});
const FAILED = new Set(["notification_dead", "reminder_failed", "workflow_error"]);

export function AdminAutomation() {
  const health = useQuery(refs.public.admin.automation, {});
  const redrive = useMutation(refs.public.admin.redriveNotifications);
  return (
    <QueryView result={health}>
      {({ outbox, recent }) => (
        <div className="grid gap-4">
          <Card>
            <CardContent className="flex flex-wrap items-center gap-4">
              <span className="font-medium">Notification outbox</span>
              <Badge variant="secondary">{outbox.pending} pending</Badge>
              <Badge variant="outline">{outbox.delivered} delivered</Badge>
              <Badge variant={outbox.dead > 0 ? "destructive" : "outline"}>
                {outbox.dead} failed
              </Badge>
              {outbox.dead > 0 && (
                <Button
                  size="sm"
                  className="ml-auto"
                  onClick={() => {
                    void toastResult(redrive({}), "Failed notifications re-queued");
                  }}
                >
                  Retry failed
                </Button>
              )}
            </CardContent>
          </Card>
          {recent.length === 0 ? (
            <p className="text-muted-foreground">No automation activity yet.</p>
          ) : (
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
                    <TableCell className="whitespace-nowrap">
                      {timeFormat.format(event.at)}
                    </TableCell>
                    <TableCell>
                      <Badge variant={FAILED.has(event.kind) ? "destructive" : "outline"}>
                        {AUTOMATION_LABELS[event.kind]}
                      </Badge>
                    </TableCell>
                    <TableCell>{event.toolName ?? "—"}</TableCell>
                    <TableCell className="text-muted-foreground max-w-md truncate text-sm">
                      {event.detail ?? ""}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </div>
      )}
    </QueryView>
  );
}
