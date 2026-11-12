"use client";

import { SignInButton, useAuth } from "@clerk/nextjs";
import Link from "next/link";
import { Button } from "~/components/ui/button";

/** Client-side, so the landing page itself stays in the static shell. */
export function HeroActions() {
  const { isLoaded, isSignedIn } = useAuth();
  if (isLoaded && isSignedIn) {
    return (
      <Button asChild size="lg">
        <Link href="/tools">Browse tools</Link>
      </Button>
    );
  }
  return (
    <SignInButton mode="modal" forceRedirectUrl="/tools">
      <Button size="lg">Sign in to borrow</Button>
    </SignInButton>
  );
}
