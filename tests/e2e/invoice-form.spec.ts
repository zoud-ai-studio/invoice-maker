import { expect, test } from "@playwright/test";

async function saveInvoice(page, client = "Acme") {
  await page.getByRole("button", { name: "Create invoice" }).click();
  await page.getByLabel("Client name").fill(client);
  await page.getByRole("button", { name: "Add line item" }).click();
  await page.getByLabel("Description 1").fill("Design");
  await page.getByLabel("Quantity 1").fill("1");
  await page.getByLabel("Unit price 1").fill("100");
  await page.getByRole("button", { name: "Save invoice" }).click();
}

test("persists, opens, duplicates, and deletes saved invoices", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByText("No invoices to display.")).toBeVisible();
  await saveInvoice(page);
  await expect(page.getByText("Acme")).toBeVisible();
  await page.reload();
  await expect(page.getByText("Acme")).toBeVisible();
  await page.getByRole("button", { name: "Open INV-0001" }).click();
  await expect(page.getByLabel("Description 1")).toHaveValue("Design");
  await page.getByRole("button", { name: "Back to invoices" }).click();
  await page.getByRole("button", { name: "Duplicate" }).click();
  await expect(page.getByLabel("Invoice number")).toHaveValue("INV-0002");
  await page.getByRole("button", { name: "Save invoice" }).click();
  await expect(page.getByText("INV-0002")).toBeVisible();
  await page.getByRole("button", { name: "Delete" }).first().click();
  await expect(page.getByRole("dialog")).toBeVisible();
  await page.getByRole("button", { name: "Cancel" }).click();
  await expect(page.getByText("INV-0002")).toBeVisible();
  await page.getByRole("button", { name: "Delete" }).first().click();
  await page.getByRole("button", { name: "Delete invoice" }).click();
  await expect(page.getByText("INV-0002")).not.toBeVisible();
});

test("saves a valid invoice when returning to the invoice list", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("button", { name: "Create invoice" }).click();
  await page.getByLabel("Client name").fill("Saved on return");
  await page.getByRole("button", { name: "Back to invoices" }).click();
  await expect(page.getByText("Saved on return")).toBeVisible();
  await page.reload();
  await expect(page.getByText("Saved on return")).toBeVisible();
});

test("creates a line item and recalculates totals", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("button", { name: "Create invoice" }).click();
  await expect(page.getByLabel("Invoice number")).toHaveValue("INV-0001");
  await page.getByRole("button", { name: "Add line item" }).click();
  await page.getByLabel("Description 1").fill("Web Design");
  await page.getByLabel("Quantity 1").fill("1");
  await page.getByLabel("Unit price 1").fill("1500");
  await expect(page.getByLabel("Amount 1")).toHaveText("AED 1,500.00");
  await expect(page.getByRole("region", { name: "Invoice details" }).getByText("AED 1,575.00", { exact: true })).toBeVisible();
  await page.getByLabel("Discount percentage").fill("10");
  await expect(page.getByRole("region", { name: "Invoice details" }).getByText("AED 1,417.50", { exact: true })).toBeVisible();
});

test("does not apply an invalid discount or VAT to totals", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("button", { name: "Create invoice" }).click();
  await page.getByRole("button", { name: "Add line item" }).click();
  await page.getByLabel("Quantity 1").fill("1");
  await page.getByLabel("Unit price 1").fill("500");
  await expect(page.getByRole("region", { name: "Invoice details" }).getByText("AED 525.00", { exact: true })).toBeVisible();

  await page.getByLabel("Discount percentage").fill("150");
  await expect(page.getByLabel("Discount percentage")).toHaveAttribute("aria-invalid", "true");
  await expect(page.getByRole("region", { name: "Invoice details" }).getByText("AED 525.00", { exact: true })).toBeVisible();

  await page.getByLabel("VAT percentage").fill("150");
  await expect(page.getByLabel("VAT percentage")).toHaveAttribute("aria-invalid", "true");
  await expect(page.locator(".form-card .grand-total dd")).toHaveText("AED 500.00");
});

test("keeps invalid numeric text on the field and never crashes", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("button", { name: "Create invoice" }).click();
  await page.getByRole("button", { name: "Add line item" }).click();

  for (const field of ["Quantity 1", "Unit price 1"]) {
    for (const value of ["99999999999999999999999", "1e21", "0.0000001"]) {
      await page.getByLabel(field).fill(value);
      await expect(page.getByLabel(field)).toHaveAttribute("aria-invalid", "true");
    }
    await expect(page.getByText(/Enter a value up to 12 whole digits|Enter a base-10 decimal number|Use no more than 6 decimal places/).first()).toBeVisible();
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

test("prints a clean A4 invoice document", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("button", { name: "Create invoice" }).click();
  await page.getByLabel("Business name").fill("Zoud Studio");
  await page.getByLabel("Business address line 1").fill("Dubai Design District");
  await page.getByLabel("Client name").fill("Acme LLC");
  await page.getByLabel("Client address line 1").fill("Sheikh Zayed Road");
  await page.getByRole("button", { name: "Add line item" }).click();
  await page.getByLabel("Description 1").fill("Brand design");
  await page.getByLabel("Quantity 1").fill("1");
  await page.getByLabel("Unit price 1").fill("1250");

  await page.evaluate(() => {
    window.print = () => { document.documentElement.dataset.printRequested = "true"; };
  });
  await page.getByRole("button", { name: "Print invoice" }).click();
  await expect(page.locator("html")).toHaveAttribute("data-print-requested", "true");

  await page.emulateMedia({ media: "print" });
  await expect(page.getByTestId("print-invoice")).toBeVisible();
  await expect(page.getByTestId("print-invoice")).toContainText("Zoud Studio");
  await expect(page.getByTestId("print-invoice")).toContainText("Dubai Design District");
  await expect(page.getByTestId("print-invoice")).toContainText("Acme LLC");
  await expect(page.getByTestId("print-invoice")).toContainText("Sheikh Zayed Road");
  await expect(page.getByTestId("print-invoice")).toContainText("INV-0001");
  await expect(page.getByTestId("print-invoice")).toContainText("Brand design");
  await expect(page.getByTestId("print-invoice")).toContainText("AED 1,250.00");
  await expect(page.getByRole("button", { name: "Print invoice" })).toBeHidden();
  await expect(page.getByLabel("Business name")).toBeHidden();
  await expect.poll(() => page.getByTestId("print-invoice").evaluate((element) => element.scrollWidth <= element.clientWidth)).toBe(true);
});

for (const width of [375, 768, 1280]) {
  test(`keeps the invoice form within the viewport at ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 900 });
    await page.goto("/");
    await page.getByRole("button", { name: "Create invoice" }).click();
    await page.getByRole("button", { name: "Add line item" }).click();
    await expect.poll(() => page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
    await expect(page.getByLabel("Description 1")).toBeVisible();
  });
}
