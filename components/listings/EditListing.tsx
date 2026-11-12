"use client";

import { useMutation, useQuery } from "@confect/react";
import * as Result from "effect/Result";
import { useRouter } from "next/navigation";
import { QueryView } from "~/components/app/QueryView";
import type { Id } from "~/confect/_generated/id";
import refs from "~/confect/_generated/refs";
import { toastResult } from "~/lib/mutationResult";
import { ToolForm } from "./ToolForm";

export function EditListing({ toolId }: { readonly toolId: Id<"tools"> }) {
  const detail = useQuery(refs.public.tools.get, { toolId });
  const update = useMutation(refs.public.tools.update);
  const router = useRouter();
  return (
    <QueryView result={detail}>
      {({ tool }) =>
        tool.isMine ? (
          <ToolForm
            initial={tool}
            submitLabel="Save changes"
            onSubmit={async ({ photos, ...fields }) => {
              const photoIds = photos.map((p) => p.storageId);
              const result = await toastResult(
                update({ toolId, ...fields, photoIds }),
                "Saved",
              );
              if (Result.isSuccess(result)) router.push("/listings");
            }}
          />
        ) : (
          <p className="text-muted-foreground">You can only edit your own listings.</p>
        )
      }
    </QueryView>
  );
}
