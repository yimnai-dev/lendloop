type Issue = { readonly message: string } | string | undefined;

const messageOf = (issue: Issue) => (typeof issue === "string" ? issue : issue?.message);

/** First validation message for a field, from Standard Schema or custom validators. */
export function FieldError({ errors }: { readonly errors: ReadonlyArray<Issue> }) {
  const message = errors.map(messageOf).find((m) => m !== undefined);
  return message === undefined ? null : (
    <p role="alert" className="text-destructive text-sm">
      {message}
    </p>
  );
}
