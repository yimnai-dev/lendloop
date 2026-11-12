"use client";

import { useMutation } from "@confect/react";
import * as Result from "effect/Result";
import { useRouter } from "next/navigation";
import refs from "~/confect/_generated/refs";
import { toastResult } from "~/lib/mutationResult";
import { ToolForm, type ToolFormValues } from "./ToolForm";

const EMPTY: ToolFormValues = {
  name: "",
  category: "hand_tools",
  condition: "good",
  description: "",
  photos: [],
};

export function NewListing() {
  const create = useMutation(refs.public.tools.create);
  const router = useRouter();
  return (
    <ToolForm
      initial={EMPTY}
      submitLabel="List it"
      onSubmit={async ({ photos, ...fields }) => {
        const result = await toastResult(
          create({ ...fields, photoIds: photos.map((p) => p.storageId) }),
          "Listed! Neighbors can see it now.",
        );
        if (Result.isSuccess(result)) router.push(`/tools/${result.success}`);
      }}
    />
  );
}
