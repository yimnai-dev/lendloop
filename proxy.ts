import { clerkMiddleware } from "@clerk/nextjs/server";

/**
 * Only attaches Clerk's session handling. Authorization is resource-based:
 * every query and mutation checks the caller inside Convex, and the signed-in
 * shell redirects visitors without a session (see `AccountGate`).
 */
export default clerkMiddleware();

export const config = {
  matcher: [
    // Skip Next internals and static files.
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    "/(api|trpc)(.*)",
  ],
};
