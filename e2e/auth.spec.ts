import { test, expect } from '@playwright/test';
import { loginAsAdmin } from './helpers';

test.describe('Authentication', () => {
    test('should login successfully as admin', async ({ page }) => {
        await loginAsAdmin(page);

        // Verify admin elements are visible
        await expect(page.locator('text=ADMIN').first()).toBeVisible();
        await expect(page.locator('text=User Management').first()).toBeVisible();
    });

    test('should show error for invalid credentials', async ({ page }) => {
        await page.goto('/login');

        await page.fill('#email', 'wrong@example.com');
        await page.fill('#password', 'WrongPass123!');
        await page.click('button[type="submit"]');

        // Verify toast or error message
        await expect(page.locator('text=Invalid email or password')).toBeVisible();
    });
});
