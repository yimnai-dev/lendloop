import { clerk, setupClerkTestingToken } from "@clerk/testing/playwright";
import type { Browser, Page } from "@playwright/test";

/**
 * Clerk test users (`+clerk_test` emails need no real inbox).
 * Created once with the Backend API; see README → Testing.
 */
export const USERS = {
  ada: { email: "ada+clerk_test@example.com", name: "Ada" },
  ben: { email: "ben+clerk_test@example.com", name: "Ben" },
  admin: { email: "admin+clerk_test@example.com", name: "Grace" },
} as const;

export type UserKey = keyof typeof USERS;

export const isUserKey = (value: string): value is UserKey => Object.hasOwn(USERS, value);

export const signInAs = async (page: Page, user: UserKey) => {
  await setupClerkTestingToken({ page });
  await page.goto("/");
  // Ticket-based sign-in via the Backend API: no password or email code involved.
  await clerk.signIn({ page, emailAddress: USERS[user].email });
};

/** A fresh browser context per person, like separate devices. */
export const pageFor = async (browser: Browser, user: UserKey) => {
  const context = await browser.newContext();
  const page = await context.newPage();
  await signInAs(page, user);
  return page;
};
