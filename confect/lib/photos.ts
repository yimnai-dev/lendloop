import * as Effect from "effect/Effect";
import * as Option from "effect/Option";
import { InvalidRequest } from "../../shared/domain/errors";
import { MAX_PHOTO_BYTES, MAX_TOOL_PHOTOS, PHOTO_TYPES } from "../../shared/domain/Tool";
import type { Id } from "../_generated/id";
import { DatabaseReader, StorageReader, StorageWriter } from "../_generated/services";

/** Deleting a blob that is already gone still reaches the goal state. */
export const deleteQuietly = (photoId: Id<"_storage">) =>
  Effect.flatMap(StorageWriter, (storage) => storage.delete(photoId)).pipe(
    Effect.catchTag("BlobNotFoundError", () => Effect.void),
  );

const isAllowedType = (contentType: string | undefined) =>
  PHOTO_TYPES.some((type) => type === contentType);

/**
 * Validates uploads from stored metadata, not from what the client claimed.
 * Rejected uploads are deleted so they don't linger in storage.
 */
export const validatePhotos = Effect.fn("validatePhotos")(function* (
  photoIds: ReadonlyArray<Id<"_storage">>,
) {
  if (photoIds.length > MAX_TOOL_PHOTOS) {
    return yield* new InvalidRequest({ reason: `At most ${MAX_TOOL_PHOTOS} photos` });
  }
  const reader = yield* DatabaseReader;

  for (const photoId of photoIds) {
    const meta = yield* reader
      .table("_storage")
      .get(photoId)
      .pipe(Effect.option, Effect.map(Option.getOrUndefined));
    if (meta === undefined) {
      return yield* new InvalidRequest({ reason: "Photo upload not found" });
    }
    if (!isAllowedType(meta.contentType) || meta.size > MAX_PHOTO_BYTES) {
      yield* deleteQuietly(photoId);
      return yield* new InvalidRequest({
        reason: "Photos must be JPEG, PNG or WebP and at most 5 MB",
      });
    }
  }
});

/** Signed download URLs for a tool's photos (skips any that were deleted). */
export const photoUrls = Effect.fn("photoUrls")(function* (
  photoIds: ReadonlyArray<Id<"_storage">>,
) {
  const storage = yield* StorageReader;
  const urls = yield* Effect.forEach(photoIds, (photoId) =>
    storage.getUrl(photoId).pipe(Effect.option),
  );
  return urls.flatMap((url) => (Option.isSome(url) ? [url.value.toString()] : []));
});
