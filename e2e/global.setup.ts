import { clerkSetup } from "@clerk/testing/playwright";

/** Fetches a Clerk testing token (needs CLERK_SECRET_KEY + publishable key in env). */
export default async function globalSetup() {
  await clerkSetup();
}
