"use client";

import { QueryResult } from "@confect/react";
import type { ReactNode } from "react";
import { Alert, AlertDescription } from "~/components/ui/alert";
import { Skeleton } from "~/components/ui/skeleton";
import { describeError, type AppError } from "~/lib/errors";

type Props<A, E extends AppError> = {
  readonly result: QueryResult.QueryResult<A, E>;
  readonly children: (value: A) => ReactNode;
  readonly loading?: ReactNode;
};

const TRANSIENT: ReadonlySet<AppError["_tag"]> = new Set([
  "NotSignedIn",
  "AccountNotProvisioned",
]);

const DefaultLoading = () => (
  <div className="grid gap-3">
    <Skeleton className="h-24" />
    <Skeleton className="h-24" />
  </div>
);

/** Renders a live query's three states; typed errors become a readable alert. */
export function QueryView<A, E extends AppError>({
  result,
  children,
  loading,
}: Props<A, E>) {
  if (QueryResult.isSuccess(result)) return children(result.value);
  // Auth and first-visit provisioning settle on their own; keep showing loading.
  if (QueryResult.isFailure(result) && !TRANSIENT.has(result.error._tag)) {
    return (
      <Alert variant="destructive">
        <AlertDescription>{describeError(result.error)}</AlertDescription>
      </Alert>
    );
  }
  return loading ?? <DefaultLoading />;
}
