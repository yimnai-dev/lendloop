"use client";

import { useMutation, useQuery } from "@confect/react";
import Link from "next/link";
import { QueryView } from "~/components/app/QueryView";
import { StatusDot } from "~/components/app/StatusDot";
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
import { categoryLabel } from "~/shared/domain/Category";
import { CategoryIcon } from "~/components/tools/CategoryIcon";
import { Panel } from "./Panel";

export function AdminListings() {
  const listings = useQuery(refs.public.admin.listings);
  const remove = useMutation(refs.public.admin.removeListing);
  return (
    <QueryView result={listings}>
      {(items) =>
        items.length === 0 ? (
          <p className="text-muted-foreground">No active listings.</p>
        ) : (
          <Panel>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Tool</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Owner</TableHead>
                  <TableHead />
                </TableRow>
              </TableHeader>
              <TableBody>
                {items.map((tool) => (
                  <TableRow key={tool._id}>
                    <TableCell>
                      <Link
                        href={`/tools/${tool._id}`}
                        className="font-heading flex items-center gap-3 text-lg hover:underline"
                      >
                        <CategoryIcon category={tool.category} size="sm" />
                        {tool.name}
                      </Link>
                    </TableCell>
                    <TableCell>{categoryLabel[tool.category]}</TableCell>
                    <TableCell>{tool.owner.firstName}</TableCell>
                    <TableCell className="text-right">
                      {tool.onLoan ? (
                        <StatusDot tone="wait">On loan</StatusDot>
                      ) : (
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-muted-foreground hover:text-destructive"
                          onClick={() => {
                            void toastResult(
                              remove({ toolId: tool._id }),
                              `Removed “${tool.name}”`,
                            );
                          }}
                        >
                          Remove
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Panel>
        )
      }
    </QueryView>
  );
}
