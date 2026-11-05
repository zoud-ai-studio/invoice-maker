import { expect, test } from "@playwright/test";

test("creates a line item and recalculates totals", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByLabel("Invoice number")).toHaveValue("INV-0001");
  await page.getByRole("button", { name: "Add line item" }).click();
  await page.getByLabel("Description 1").fill("Web Design");
  await page.getByLabel("Quantity 1").fill("1");
  await page.getByLabel("Unit price 1").fill("1500");
  await expect(page.getByLabel("Amount 1")).toHaveText("AED 1,500.00");
  await expect(page.getByText("AED 1,575.00", { exact: true })).toBeVisible();
  await page.getByLabel("Discount percentage").fill("10");
  await expect(page.getByText("AED 1,417.50", { exact: true })).toBeVisible();
});
