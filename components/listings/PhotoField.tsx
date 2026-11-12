"use client";

import { useMutation } from "@confect/react";
import * as Effect from "effect/Effect";
import { XIcon } from "lucide-react";
import { toast } from "sonner";
import { Button } from "~/components/ui/button";
import { Label } from "~/components/ui/label";
import refs from "~/confect/_generated/refs";
import type { Photo } from "~/confect/views";
import { MAX_TOOL_PHOTOS, PHOTO_TYPES } from "~/shared/domain/Tool";
import { uploadPhoto } from "./uploadPhoto";

type Props = {
  readonly photos: ReadonlyArray<Photo>;
  readonly onChange: (photos: ReadonlyArray<Photo>) => void;
};

export function PhotoField({ photos, onChange }: Props) {
  const generateUploadUrl = useMutation(refs.public.tools.generateUploadUrl);
  const remaining = MAX_TOOL_PHOTOS - photos.length;

  const upload = async (files: ReadonlyArray<File>) => {
    const uploads = files.slice(0, remaining).map((file) =>
      uploadPhoto(file, () => generateUploadUrl()).pipe(
        Effect.tapError((error) => Effect.sync(() => toast.error(error.message))),
        Effect.option,
      ),
    );
    const results = await Effect.runPromise(Effect.all(uploads, { concurrency: 3 }));
    const added = results.flatMap((r) => (r._tag === "Some" ? [r.value] : []));
    onChange([...photos, ...added]);
  };

  return (
    <div className="grid gap-2">
      <Label htmlFor="photos">Photos (up to {MAX_TOOL_PHOTOS})</Label>
      <div className="grid grid-cols-3 gap-2">
        {photos.map((photo) => (
          <div key={photo.storageId} className="relative">
            {/* oxlint-disable-next-line nextjs/no-img-element */}
            <img
              src={photo.url}
              alt=""
              className="aspect-square rounded-md object-cover"
            />
            <Button
              type="button"
              size="icon"
              variant="secondary"
              aria-label="Remove photo"
              className="absolute top-1 right-1 size-7"
              onClick={() =>
                onChange(photos.filter((p) => p.storageId !== photo.storageId))
              }
            >
              <XIcon />
            </Button>
          </div>
        ))}
      </div>
      {remaining > 0 && (
        <input
          id="photos"
          type="file"
          multiple
          accept={PHOTO_TYPES.join(",")}
          className="text-sm"
          onChange={(event) => {
            void upload([...(event.target.files ?? [])]);
            event.target.value = "";
          }}
        />
      )}
    </div>
  );
}
