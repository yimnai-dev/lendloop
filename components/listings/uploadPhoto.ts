import * as Effect from "effect/Effect";
import type * as Result from "effect/Result";
import * as Schema from "effect/Schema";
import { Id } from "~/confect/_generated/id";
import { MAX_PHOTO_BYTES, PHOTO_TYPES } from "~/shared/domain/Tool";

export class UploadError extends Schema.TaggedError<UploadError>()("UploadError", {
  message: Schema.String,
}) {}

const failed = () => new UploadError({ message: "Upload failed, please try again" });

const UploadResponse = Schema.Struct({ storageId: Id("_storage") });

/**
 * Checks the file early for fast feedback (the server re-checks from storage
 * metadata), uploads it to a one-time Convex URL, and returns the storage id.
 */
export const uploadPhoto = Effect.fn("uploadPhoto")(function* (
  file: File,
  getUploadUrl: () => Promise<Result.Result<string, unknown>>,
) {
  if (!PHOTO_TYPES.some((type) => type === file.type)) {
    return yield* new UploadError({ message: "Use a JPEG, PNG or WebP image" });
  }
  if (file.size > MAX_PHOTO_BYTES) {
    return yield* new UploadError({ message: "Photos must be 5 MB or smaller" });
  }
  const url = yield* Effect.tryPromise({ try: getUploadUrl, catch: failed }).pipe(
    Effect.flatMap((result) => Effect.mapError(Effect.fromResult(result), failed)),
  );
  const response = yield* Effect.tryPromise({
    try: () =>
      fetch(url, { method: "POST", headers: { "Content-Type": file.type }, body: file }),
    catch: failed,
  });
  if (!response.ok) return yield* failed();
  const json = yield* Effect.tryPromise({ try: () => response.json(), catch: failed });
  const { storageId } = yield* Schema.decodeUnknownEffect(UploadResponse)(json).pipe(
    Effect.mapError(failed),
  );
  return { storageId, url: URL.createObjectURL(file) };
});
