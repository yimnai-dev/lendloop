"use client";

import { useAuth } from "@clerk/nextjs";
import { ConvexReactClient } from "convex/react";
import { ConvexProviderWithClerk } from "convex/react-clerk";
import { NuqsAdapter } from "nuqs/adapters/next/app";
import type { ReactNode } from "react";
import { publicEnv } from "~/lib/env";

const convex = new ConvexReactClient(publicEnv.convexUrl);

export function Providers({ children }: { readonly children: ReactNode }) {
  return (
    // Convex's documented API takes Clerk's hook itself and calls it inside.
    // oxlint-disable-next-line react/hooks
    <ConvexProviderWithClerk client={convex} useAuth={useAuth}>
      <NuqsAdapter>{children}</NuqsAdapter>
    </ConvexProviderWithClerk>
  );
}
