import { expect, test, type Page } from "@playwright/test";
import { expectEmail } from "./inbox";
import { pageFor, USERS } from "./users";

/** Unique per run, so reruns against the same deployment don't collide. */
const toolName = `E2E ladder ${Date.now().toString(36)}`;

const listTool = async (page: Page, name: string) => {
  await page.goto("/listings/new");
  await page.getByLabel("Name").fill(name);
  await page.getByLabel("Description").fill("Created by the Playwright suite.");
  await page.getByRole("button", { name: "List it" }).click();
  await expect(page.getByRole("heading", { name, level: 1 })).toBeVisible();
  return page.url();
};

const loanCard = (page: Page, name: string) =>
  page.locator("article").filter({ hasText: name });

// Multi-user flows plus email round-trips through n8n take longer than the default 30 s.
test.describe.configure({ mode: "serial", timeout: 120_000 });

/** Earlier failed runs may have left listings behind; removing them cancels their requests. */
test.beforeAll(async ({ browser }) => {
  const ada = await pageFor(browser, "ada");
  await ada.goto("/listings");
  await expect(ada.getByRole("heading", { name: "Your shelf" })).toBeVisible();
  const stale = ada.getByRole("listitem").filter({ hasText: "E2E ladder" });
  await ada.waitForTimeout(2_000);
  // Each removal re-renders the list, so always take the first remaining one.
  const removeNext = async (): Promise<void> => {
    if ((await stale.count()) === 0) return;
    await stale.first().getByRole("button", { name: "Remove" }).click();
    await ada.waitForTimeout(800);
    return removeNext();
  };
  await removeNext();
  await ada.context().close();
});

test("visitors see only names and categories", async ({ page }) => {
  await page.goto("/");
  await expect(
    page.getByRole("heading", { name: "On the shelf right now" }),
  ).toBeVisible();
  // Lender names and availability are for signed-in neighbors only.
  await expect(page.getByText("Sign in to see who's lending")).toBeVisible();
  await page.goto("/tools");
  await expect(page).toHaveURL(/sign-in/);
});

test("list → request → approve → return, with emails", async ({ browser }) => {
  const page = await pageFor(browser, "ada");
  const toolUrl = await listTool(page, toolName);

  const ben = await pageFor(browser, "ben");
  await ben.goto(toolUrl);
  // The calendar preselects the first free days; the button names them ("Request Nov 12 – 14 · 3 days").
  await ben.getByRole("button", { name: /^Request / }).click();
  await expect(ben.getByText("Request sent to the owner")).toBeVisible();
  await ben.goto("/requests");
  await expect(loanCard(ben, toolName).getByText("Pending")).toBeVisible();
  // The lender's email stays hidden until approval.
  await expect(loanCard(ben, toolName).getByText(USERS.ada.email)).toHaveCount(0);

  await page.goto("/incoming");
  await loanCard(page, toolName).getByRole("button", { name: "Approve" }).click();
  // Approved loans move from "To decide" to "Out on loan".
  await page.getByRole("tab", { name: "Out on loan" }).click();
  await expect(loanCard(page, toolName).getByText(USERS.ben.email)).toBeVisible();

  await expectEmail(USERS.ada.email, `New request for your ${toolName}`);
  await expectEmail(USERS.ben.email, `Approved: ${toolName}`);
  // Live query: the loan leaves Ben's "Waiting" tab without a reload.
  await expect(loanCard(ben, toolName)).toHaveCount(0);
  await ben.getByRole("tab", { name: "Out with you" }).click();
  await expect(loanCard(ben, toolName).getByText(USERS.ada.email)).toBeVisible();

  await loanCard(page, toolName).getByRole("button", { name: "Mark returned" }).click();
  await page.getByRole("tab", { name: "History" }).click();
  await expect(loanCard(page, toolName).getByText("Returned").first()).toBeVisible();
  await expectEmail(USERS.ben.email, `Returned: ${toolName}`);

  // Leave the shared deployment as we found it.
  await page.goto("/listings");
  await page
    .getByRole("listitem")
    .filter({ hasText: toolName })
    .getByRole("button", { name: "Remove" })
    .click();
  await expect(page.getByText(toolName)).toHaveCount(0);
});

test("admins remove listings and grant Trusted Lender; others can't", async ({
  browser,
}) => {
  const doomed = `${toolName} (spam)`;
  const ada = await pageFor(browser, "ada");
  await listTool(ada, doomed);
  await ada.goto("/admin");
  await expect(ada.getByText("Only admins can do that.").first()).toBeVisible();

  const page = await pageFor(browser, "admin");
  await page.goto("/admin?tab=listings");
  await page
    .getByRole("row")
    .filter({ hasText: doomed })
    .getByRole("button", { name: "Remove" })
    .click();
  await expect(page.getByRole("row").filter({ hasText: doomed })).toHaveCount(0);

  await page.goto("/admin?tab=users");
  const toggle = page.getByRole("switch", { name: `Trusted Lender: ${USERS.ada.name}` });
  const before = await toggle.getAttribute("aria-checked");
  await toggle.click();
  await expect(toggle).not.toHaveAttribute("aria-checked", before ?? "");
  await toggle.click(); // and back
  await expect(toggle).toHaveAttribute("aria-checked", before ?? "");
});
