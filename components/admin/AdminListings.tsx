"use client";

import { useMutation, useQuery } from "@confect/react";
import Link from "next/link";
import { QueryView } from "~/components/app/QueryView";
import { Badge } from "~/components/ui/badge";
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

export function AdminListings() {
  const listings = useQuery(refs.public.admin.listings);
  const remove = useMutation(refs.public.admin.removeListing);
  return (
    <QueryView result={listings}>
      {(items) =>
        items.length === 0 ? (
          <p className="text-muted-foreground">No active listings.</p>
        ) : (
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
                    <Link href={`/tools/${tool._id}`} className="hover:underline">
                      {tool.name}
                    </Link>
                  </TableCell>
                  <TableCell>{categoryLabel[tool.category]}</TableCell>
                  <TableCell>{tool.owner.firstName}</TableCell>
                  <TableCell className="text-right">
                    {tool.onLoan ? (
                      <Badge variant="outline">On loan</Badge>
                    ) : (
                      <Button
                        variant="ghost"
                        size="sm"
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
        )
      }
    </QueryView>
  );
}
