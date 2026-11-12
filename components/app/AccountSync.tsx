"use client";

import { RedirectToSignIn, useAuth } from "@clerk/nextjs";
import { useMutation, useQuery } from "@confect/react";
import { useConvexAuth } from "convex/react";
import { Suspense, use } from "react";
import refs from "~/confect/_generated/refs";

/**
 * One provisioning call per Clerk user per page load. Caching the promise
 * lets `use()` suspend on it during render instead of firing it from an effect.
 */
const provisioning = new Map<string, Promise<null>>();

function Provision({
  userId,
  run,
}: {
  readonly userId: string;
  readonly run: () => Promise<null>;
}) {
  const pending = provisioning.get(userId) ?? run();
  provisioning.set(userId, pending);
  use(pending);
  return null;
}

/**
 * Renders nothing. Sends visitors without a session to sign-in and creates
 * the LendLoop account on first visit; live queries pick it up reactively.
 */
export function AccountSync() {
  const { isLoaded, isSignedIn, userId } = useAuth();
  const convexAuth = useConvexAuth();
  const viewer = useQuery(
    refs.public.users.viewer,
    convexAuth.isAuthenticated ? {} : "skip",
  );
  const provision = useMutation(refs.public.users.provision);

  if (isLoaded && !isSignedIn) return <RedirectToSignIn />;
  const needsAccount =
    viewer._tag === "Success" && viewer.value._tag === "Provisioning" && userId != null;
  return needsAccount ? (
    <Suspense>
      <Provision userId={userId} run={() => provision()} />
    </Suspense>
  ) : null;
}
