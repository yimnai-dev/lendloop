import { expect, test, type Page } from "@playwright/test";
import { isUserKey, signInAs } from "./users";

/** Live queries keep a socket open, so wait for skeletons to go instead of network idle. */
const settle = async (page: Page) => {
  await expect(page.locator('[data-slot="skeleton"]')).toHaveCount(0, {
    timeout: 20_000,
  });
  await page.waitForTimeout(600);
};

/** Not a test: `SCREENS=1 bunx playwright test screens` writes screenshots for UI review. */
const PAGES = [
  "/tools",
  "/listings",
  "/requests",
  "/incoming",
  "/admin",
  "/admin?tab=users",
  "/admin?tab=automation",
  "/listings/new",
];

test("@screens capture", async ({ page }) => {
  test.setTimeout(120_000);
  const width = Number(process.env["SCREENS_WIDTH"] ?? 1280);
  await page.setViewportSize({ width, height: 900 });
  await page.goto("/");
  await settle(page);
  await page.screenshot({
    path: `screens/${width}-landing.png`,
    fullPage: true,
  });
  const user = process.env["SCREENS_USER"] ?? "admin";
  await signInAs(page, isUserKey(user) ? user : "admin");
  // Pages are captured one after another in the same tab, on purpose.
  for (const path of PAGES) {
    // oxlint-disable-next-line no-await-in-loop
    await page.goto(path);
    // oxlint-disable-next-line no-await-in-loop
    await settle(page);
    const name = path.replaceAll(/[/?=]/g, "_");
    // oxlint-disable-next-line no-await-in-loop
    await page.screenshot({
      path: `screens/${width}${name}.png`,
      fullPage: true,
    });
  }
  const firstTool = page.locator('a[href^="/tools/"]').first();
  await page.goto("/tools");
  await firstTool.click();
  await expect(page.getByRole("heading", { name: "Borrow it" })).toBeVisible({
    timeout: 20_000,
  });
  await settle(page);
  await page.screenshot({
    path: `screens/${width}_tool_detail.png`,
    fullPage: true,
  });
});
