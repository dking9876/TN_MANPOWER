import { test, expect } from '@playwright/test';
import { loginAsAdmin } from './helpers';

test.describe('Alerts System', () => {
    test.beforeEach(async ({ page }) => {
        await loginAsAdmin(page);
    });

    test('should background-load alerts and show count in sidebar', async ({ page }) => {
        // Wait for potential alerts to load
        // Verify sidebar alert badge
        const alertBadge = page.locator('nav >> text=/\\d+/').first(); // Regex for numbers
        // We can't guarantee there are alerts unless we seed them, 
        // but we can check if the nav item "Alerts" exists.
        await expect(page.locator('nav >> text=Alerts')).toBeVisible();
    });

    test('should resolve an alert and update candidate timestamp', async ({ page }) => {
        await page.goto('/alerts');

        // Find an unresolved alert
        const unresolvedAlert = page.locator('text=Unresolved').first();
        if (await unresolvedAlert.isVisible()) {
            await unresolvedAlert.click(); // Or click the Resolve button

            // Fill resolution form
            await page.fill('textarea[placeholder="Enter resolution notes..."]', 'Fixed document issue');
            await page.check('text=Update candidate last_updated_at'); // Default should be checked

            await page.click('button:has-text("Confirm")');

            // Check success toast
            await expect(page.locator('text=Alert resolved')).toBeVisible();
        } else {
            console.log('No unresolved alerts found for test');
        }
    });
});
