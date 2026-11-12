"use client";

import { useForm } from "@tanstack/react-form";
import * as Schema from "effect/Schema";
import { FieldError } from "~/components/form/FieldError";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";
import { Textarea } from "~/components/ui/textarea";
import { Photo } from "~/confect/views";
import { CATEGORIES, categoryLabel } from "~/shared/domain/Category";
import { CONDITIONS, conditionLabel } from "~/shared/domain/Condition";
import { MAX_TOOL_PHOTOS, ToolFields } from "~/shared/domain/Tool";
import { PhotoField } from "./PhotoField";

/** Trim before validating, so stray spaces never block a submit. */
const FormSchema = Schema.Struct({
  ...ToolFields.fields,
  name: Schema.Trim.pipe(Schema.decodeTo(ToolFields.fields.name)),
  description: Schema.Trim.pipe(Schema.decodeTo(ToolFields.fields.description)),
  photos: Schema.Array(Photo).check(Schema.isMaxLength(MAX_TOOL_PHOTOS)),
});

export type ToolFormValues = typeof FormSchema.Encoded;
export type ToolFormOutput = typeof FormSchema.Type;

type Props = {
  readonly initial: ToolFormValues;
  readonly submitLabel: string;
  readonly onSubmit: (value: ToolFormOutput) => Promise<void>;
};

const decodeFields = Schema.decodeUnknownSync(FormSchema);

export function ToolForm({ initial, submitLabel, onSubmit }: Props) {
  const form = useForm({
    defaultValues: initial,
    validators: { onChange: Schema.toStandardSchemaV1(FormSchema) },
    onSubmit: async ({ value }) => {
      await onSubmit(decodeFields(value));
    },
  });

  return (
    <form
      className="bg-card grid gap-6 rounded-2xl border p-6 shadow-xs"
      onSubmit={(event) => {
        event.preventDefault();
        void form.handleSubmit();
      }}
    >
      <form.Field name="name">
        {(field) => (
          <div className="grid gap-1.5">
            <Label htmlFor="name">Name</Label>
            <Input
              id="name"
              placeholder="Cordless drill"
              value={field.state.value}
              onChange={(e) => field.handleChange(e.target.value)}
              onBlur={field.handleBlur}
            />
            <FieldError errors={field.state.meta.errors} />
          </div>
        )}
      </form.Field>
      <div className="grid gap-5 sm:grid-cols-2">
        <form.Field name="category">
          {(field) => (
            <div className="grid gap-1.5">
              <Label>Category</Label>
              <Select
                value={field.state.value}
                onValueChange={(v) => {
                  const category = CATEGORIES.find((c) => c === v);
                  if (category !== undefined) field.handleChange(category);
                }}
              >
                <SelectTrigger className="w-full" aria-label="Category">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {CATEGORIES.map((c) => (
                    <SelectItem key={c} value={c}>
                      {categoryLabel[c]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}
        </form.Field>
        <form.Field name="condition">
          {(field) => (
            <div className="grid gap-1.5">
              <Label>Condition</Label>
              <Select
                value={field.state.value}
                onValueChange={(v) => {
                  const condition = CONDITIONS.find((c) => c === v);
                  if (condition !== undefined) field.handleChange(condition);
                }}
              >
                <SelectTrigger className="w-full" aria-label="Condition">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {CONDITIONS.map((c) => (
                    <SelectItem key={c} value={c}>
                      {conditionLabel[c]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}
        </form.Field>
      </div>
      <form.Field name="description">
        {(field) => (
          <div className="grid gap-1.5">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              rows={4}
              placeholder="Anything a borrower should know: battery count, bits included, quirks."
              value={field.state.value}
              onChange={(e) => field.handleChange(e.target.value)}
              onBlur={field.handleBlur}
            />
            <FieldError errors={field.state.meta.errors} />
          </div>
        )}
      </form.Field>
      <form.Field name="photos">
        {(field) => (
          <PhotoField photos={field.state.value} onChange={field.handleChange} />
        )}
      </form.Field>
      <form.Subscribe selector={(state) => state.isSubmitting}>
        {(isSubmitting) => (
          <Button
            type="submit"
            size="lg"
            disabled={isSubmitting}
            className="justify-self-start"
          >
            {isSubmitting ? "Saving…" : submitLabel}
          </Button>
        )}
      </form.Subscribe>
    </form>
  );
}
