"use client";

import { useMutation, useQuery } from "@confect/react";
import { QueryView } from "~/components/app/QueryView";
import { Badge } from "~/components/ui/badge";
import { Switch } from "~/components/ui/switch";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "~/components/ui/table";
import refs from "~/confect/_generated/refs";
import type { AdminUser } from "~/confect/adminViews";
import { toastResult } from "~/lib/mutationResult";

const dateFormat = new Intl.DateTimeFormat(undefined, { dateStyle: "medium" });

const lastChange = ({ lastTrustChange: change }: AdminUser) =>
  change === null
    ? "—"
    : `${change.action === "grant" ? "Granted" : "Revoked"} by ${change.actorFirstName}, ${dateFormat.format(change.at)}`;

export function AdminUsers() {
  const users = useQuery(refs.public.admin.users);
  const setTrusted = useMutation(refs.public.admin.setTrustedLender);
  return (
    <QueryView result={users}>
      {(items) => (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Listings</TableHead>
              <TableHead>Trusted Lender</TableHead>
              <TableHead>Last change</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {items.map((user) => (
              <TableRow key={user._id}>
                <TableCell className="flex items-center gap-2">
                  {user.firstName}
                  {user.role === "admin" && <Badge variant="secondary">admin</Badge>}
                </TableCell>
                <TableCell>{user.email}</TableCell>
                <TableCell className="tabular-nums">{user.activeListings}</TableCell>
                <TableCell>
                  <Switch
                    checked={user.trustedLender}
                    aria-label={`Trusted Lender: ${user.firstName}`}
                    onCheckedChange={(trusted) => {
                      void toastResult(
                        setTrusted({ userId: user._id, trusted }),
                        trusted
                          ? `${user.firstName} is now a Trusted Lender`
                          : `Removed Trusted Lender from ${user.firstName}`,
                      );
                    }}
                  />
                </TableCell>
                <TableCell className="text-muted-foreground text-sm">
                  {lastChange(user)}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </QueryView>
  );
}
