import { defineConfig, devices } from "@playwright/test";

/**
 * E2E against a running stack: `bun run dev` (Next + Convex) and, for the
 * email assertions, `docker compose up` (n8n + resendev). Clerk test users
 * sign in with testing tokens, so no bot protection or email codes get in the way.
 */
export default defineConfig({
  testDir: "./e2e",
  globalSetup: "./e2e/global.setup.ts",
  fullyParallel: false,
  workers: 1,
  retries: process.env["CI"] === undefined ? 0 : 1,
  reporter: [["list"]],
  // Live queries wait on the Clerk → Convex token handshake after each full navigation.
  expect: { timeout: 15_000 },
  use: {
    baseURL: process.env["E2E_BASE_URL"] ?? "http://localhost:3000",
    trace: "retain-on-failure",
    ...devices["Desktop Chrome"],
    // Locally reuse installed Chrome; CI installs Playwright's Chromium.
    ...(process.env["CI"] === undefined ? { channel: "chrome" } : {}),
  },
  // Screenshot capture is a tool, not a test; opt in with SCREENS=1.
  ...(process.env["SCREENS"] === undefined ? { grepInvert: /@screens/ } : {}),
});
