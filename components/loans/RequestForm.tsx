"use client";

import { useMutation } from "@confect/react";
import { useForm } from "@tanstack/react-form";
import * as Result from "effect/Result";
import * as Schema from "effect/Schema";
import { FieldError } from "~/components/form/FieldError";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import type { Id } from "~/confect/_generated/id";
import refs from "~/confect/_generated/refs";
import { toastResult } from "~/lib/mutationResult";
import { today } from "~/lib/today";
import { DateRange } from "~/shared/domain/DateRange";
import { addDays } from "~/shared/domain/IsoDate";
import {
  checkRequestWindow,
  MAX_ADVANCE_DAYS,
  MAX_LOAN_DAYS,
} from "~/shared/domain/loanRequest";

const decodeRange = Schema.decodeUnknownOption(DateRange);

/** The window rules depend on "today", so they run beside the schema. */
const windowError = (value: unknown) => {
  const range = decodeRange(value);
  if (range._tag === "None") return undefined;
  return Result.match(checkRequestWindow(range.value, today()), {
    onSuccess: () => undefined,
    onFailure: (error) => error.reason,
  });
};

export function RequestForm({ toolId }: { readonly toolId: Id<"tools"> }) {
  const request = useMutation(refs.public.loans.request);
  const start = today();
  // Form state is raw input: the schema's encoded side, decoded on submit.
  const defaultValues: typeof DateRange.Encoded = {
    startDate: start,
    endDate: addDays(start, 2),
  };
  const form = useForm({
    defaultValues,
    validators: {
      onChange: Schema.toStandardSchemaV1(DateRange),
      onSubmit: ({ value }) => windowError(value),
    },
    onSubmit: async ({ value }) => {
      const dates = Schema.decodeUnknownSync(DateRange)(value);
      await toastResult(request({ toolId, dates }), "Request sent to the owner");
    },
  });

  return (
    <form
      className="grid gap-4"
      onSubmit={(event) => {
        event.preventDefault();
        void form.handleSubmit();
      }}
    >
      <div className="grid gap-4 sm:grid-cols-2">
        {(["startDate", "endDate"] as const).map((name) => (
          <form.Field key={name} name={name}>
            {(field) => (
              <div className="grid gap-1.5">
                <Label htmlFor={name}>{name === "startDate" ? "From" : "Until"}</Label>
                <Input
                  id={name}
                  type="date"
                  min={start}
                  max={addDays(start, MAX_ADVANCE_DAYS + MAX_LOAN_DAYS)}
                  value={field.state.value}
                  onChange={(event) => field.handleChange(event.target.value)}
                  onBlur={field.handleBlur}
                />
                <FieldError errors={field.state.meta.errors} />
              </div>
            )}
          </form.Field>
        ))}
      </div>
      <form.Subscribe
        selector={(state) => [state.errorMap.onSubmit, state.isSubmitting] as const}
      >
        {([submitError, isSubmitting]) => (
          <>
            <FieldError errors={[submitError]} />
            <p className="text-muted-foreground text-xs">
              Up to {MAX_LOAN_DAYS} days, starting within the next {MAX_ADVANCE_DAYS}{" "}
              days.
            </p>
            <Button type="submit" disabled={isSubmitting} className="justify-self-start">
              Request to borrow
            </Button>
          </>
        )}
      </form.Subscribe>
    </form>
  );
}
