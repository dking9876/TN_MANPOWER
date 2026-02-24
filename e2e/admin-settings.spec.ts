import { test, expect } from '@playwright/test';
import { loginAsAdmin } from './helpers';

test.describe('Admin System Settings', () => {
    test.beforeEach(async ({ page }) => {
        await loginAsAdmin(page);
        await page.goto('/admin/settings');
        await page.waitForLoadState('networkidle');
    });

    test('should update Alert Thresholds', async ({ page }) => {
        await page.getByRole('tab', { name: /Alert Thresholds/i }).click();
        const input = page.locator('input[type="number"]').first();
        const newValue = '14';

        await input.fill(newValue);
        await page.getByRole('button', { name: /Save Thresholds/i }).click();

        // Verify persistence
        await page.reload();
        await page.getByRole('tab', { name: /Alert Thresholds/i }).click();
        await expect(input).toHaveValue(newValue);
    });

    test('should manage Blacklisted Countries', async ({ page }) => {
        await page.getByRole('tab', { name: /Countries/i }).click();

        // Use a known country from the list, e.g., "Sri Lanka" or search for one
        const countryName = "Sri Lanka";
        await page.getByPlaceholder(/Search countries/i).fill(countryName);

        const row = page.locator('div.flex.items-center.justify-between').filter({ hasText: countryName }).first();
        const switchBtn = row.getByRole('switch');
        const isInitiallyChecked = await switchBtn.getAttribute('aria-checked') === 'true';

        // Toggle
        await switchBtn.click();

        // Verify (wait for state change)
        await expect(switchBtn).toHaveAttribute('aria-checked', isInitiallyChecked ? 'false' : 'true', { timeout: 10000 });

        // Toggle back
        await switchBtn.click();
        await expect(switchBtn).toHaveAttribute('aria-checked', isInitiallyChecked ? 'true' : 'false', { timeout: 10000 });
    });

    test('should manage Professions', async ({ page }) => {
        await page.getByRole('tab', { name: /Professions/i }).click();
        const profName = `Prof-${Date.now()}`;

        // Fill name
        await page.getByPlaceholder(/e\.g\. Crane Operator/i).fill(profName);

        // Select Industry
        const trigger = page.locator('button:has-text("Select...")');
        await trigger.click();
        await page.getByRole('option', { name: "Construction" }).click();

        // Add
        const addButton = page.getByRole('button', { name: /^Add$/ });
        await expect(addButton).toBeEnabled({ timeout: 10000 });
        await addButton.click();

        // Verify
        await expect(page.getByText(profName)).toBeVisible({ timeout: 15000 });
        await page.waitForLoadState('networkidle');

        // Delete
        const badge = page.locator('span.inline-flex').filter({ hasText: profName });
        await badge.locator('button[title="Remove profession"]').click({ force: true }); // It's hidden until hover

        await expect(page.getByText(profName)).not.toBeVisible();
    });

    test('should manage Companies', async ({ page }) => {
        await page.getByRole('tab', { name: /Companies/i }).click();
        const companyName = `Company-${Date.now()}`;

        await page.getByPlaceholder(/Enter new company name/i).fill(companyName);
        await page.getByRole('button', { name: /Add Company/i }).click();

        await expect(page.getByText(companyName)).toBeVisible();

        // Delete
        const row = page.locator('div.flex.items-center.justify-between').filter({ hasText: companyName });
        await row.getByRole('button').click();

        await expect(page.getByText(companyName)).not.toBeVisible();
    });

    test('should manage Statuses', async ({ page }) => {
        await page.getByRole('tab', { name: /Statuses/i }).click();
        const statusName = `Status-${Date.now()}`;

        await page.getByPlaceholder(/Status label/i).fill(statusName);
        await page.getByRole('button', { name: /Add/i }).click();

        await expect(page.getByText(statusName, { exact: true })).toBeVisible({ timeout: 10000 });

        // Delete
        const row = page.locator('div.flex.items-center.justify-between').filter({ hasText: statusName }).first();
        await row.getByRole('button').click();

        // Wait for dialog and click delete
        const dialog = page.getByRole('dialog');
        await expect(dialog).toBeVisible();
        await dialog.getByRole('button', { name: /Delete/i }).click();

        await expect(page.getByText(statusName, { exact: true })).not.toBeVisible({ timeout: 10000 });
    });

    test('should update Document Thresholds', async ({ page }) => {
        await page.getByRole('tab', { name: /Document Alerts/i }).click();
        const input = page.locator('input[type="number"]').first();
        const newValue = '45';

        await input.fill(newValue);
        await page.getByRole('button', { name: /Save Thresholds/i }).click();

        // Verify persistence
        await page.reload();
        await page.getByRole('tab', { name: /Document Alerts/i }).click();
        await expect(input).toHaveValue(newValue);
    });

    test('should update Referrer Bonus Admin', async ({ page }) => {
        await page.getByRole('tab', { name: /Referrer Bonus/i }).click();
        const select = page.getByRole('combobox', { name: /Responsible Admin/i });

        await select.click();
        // Just pick the first admin in the list
        await page.getByRole('option').first().click();

        await page.getByRole('button', { name: /Save Assignment/i }).click();

        // Verify (no reload needed for basic check, but let's reload to be sure)
        await page.reload();
        await page.getByRole('tab', { name: /Referrer Bonus/i }).click();
        // Since we don't know the exact name easily, we just check it has a value
        await expect(select).not.toHaveText(/Select an admin/i);
    });
});
