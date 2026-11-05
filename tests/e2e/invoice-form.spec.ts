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

test("keeps invalid numeric text on the field and never crashes", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("button", { name: "Add line item" }).click();

  for (const field of ["Quantity 1", "Unit price 1"]) {
    for (const value of ["99999999999999999999999", "1e21", "0.0000001"]) {
      await page.getByLabel(field).fill(value);
      await expect(page.getByLabel(field)).toHaveAttribute("aria-invalid", "true");
    }
    await expect(page.getByText(/Enter a value up to 12 whole digits|Enter a base-10 decimal number|Use no more than 6 decimal places/)).toBeVisible();
  }

  await page.getByLabel("Unit price 1").fill("-1000");
  await expect(page.getByLabel("Unit price 1")).toHaveAttribute("aria-invalid", "true");
  await expect(page.getByText("Enter a non-negative value.")).toBeVisible();
  await page.getByLabel("Discount percentage").fill("150");
  await expect(page.getByLabel("Discount percentage")).toHaveAttribute("aria-invalid", "true");
  await expect(page.getByText("Enter a value from 0 to 100.")).toBeVisible();
  await page.getByLabel("VAT percentage").fill("-20");
  await expect(page.getByLabel("VAT percentage")).toHaveAttribute("aria-invalid", "true");
});
