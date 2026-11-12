"use client";

import { PaginatedQueryResult } from "@confect/react";
import type { ReactNode } from "react";
import { Alert, AlertDescription } from "~/components/ui/alert";
import { describeError, type AppError } from "~/lib/errors";
import { ShowMore } from "./ShowMore";

type Props<Item, E extends AppError> = {
  readonly result: PaginatedQueryResult.Variants<Item, E>;
  readonly pageSize: number;
  readonly noun: string;
  readonly loading: ReactNode;
  readonly empty: ReactNode;
  readonly children: (items: ReadonlyArray<Item>) => ReactNode;
};

/** `QueryView` for paginated queries: first-page loading, typed errors, empty, then "show more". */
export function PagedView<Item, E extends AppError>({
  result,
  pageSize,
  noun,
  loading,
  empty,
  children,
}: Props<Item, E>) {
  if (PaginatedQueryResult.isLoadingFirstPage(result)) return loading;
  if (PaginatedQueryResult.isFailure(result) && result.results.length === 0) {
    return (
      <Alert variant="destructive">
        <AlertDescription>{describeError(result.error)}</AlertDescription>
      </Alert>
    );
  }
  if (result.results.length === 0) return empty;
  return (
    <>
      {children(result.results)}
      <ShowMore result={result} pageSize={pageSize} noun={noun} />
    </>
  );
}
