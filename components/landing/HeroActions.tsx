"use client";

import { SignInButton, useAuth } from "@clerk/nextjs";
import { ArrowRightIcon } from "lucide-react";
import Link from "next/link";
import { Button } from "~/components/ui/button";

/** Client-side, so the landing page itself stays in the static shell. */
export function HeroActions({ size = "lg" }: { readonly size?: "lg" | "sm" }) {
  const { isLoaded, isSignedIn } = useAuth();
  if (isLoaded && isSignedIn) {
    return (
      <Button asChild size={size}>
        <Link href="/tools">
          Open LendLoop <ArrowRightIcon />
        </Link>
      </Button>
    );
  }
  return (
    <SignInButton mode="modal" forceRedirectUrl="/tools">
      <Button size={size} variant={size === "lg" ? "default" : "outline"}>
        {size === "lg" ? "Sign in to borrow" : "Sign in"} <ArrowRightIcon />
      </Button>
    </SignInButton>
  );
}
