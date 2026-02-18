import { test, expect } from '@playwright/test';
import { loginAsAdmin } from './helpers';

test.describe('Phase 5: Admin Pages', () => {
    test.beforeEach(async ({ page }) => {
        await loginAsAdmin(page);
    });

    test('should navigate to User Management page', async ({ page }) => {
        // Click User Management in sidebar
        await page.click('text=User Management');
        await expect(page).toHaveURL(/.*admin/, { timeout: 10000 });

        // Verify user list is visible
        await expect(page.getByText('admin@tnmanpower.com')).toBeVisible({ timeout: 10000 });
    });

    test('should display user list with proper columns', async ({ page }) => {
        await page.goto('/admin');
        await page.waitForLoadState('networkidle');

        // Check for user data
        await expect(page.getByText('admin@tnmanpower.com')).toBeVisible({ timeout: 10000 });
        await expect(page.getByText('System Administrator')).toBeVisible();
        await expect(page.getByText('ADMIN').first()).toBeVisible();
    });

    test('should navigate to Settings page', async ({ page }) => {
        // Look for Settings link in sidebar
        await page.click('text=Settings');
        await expect(page).toHaveURL(/.*settings/, { timeout: 10000 });
    });

    test('should display alert threshold settings', async ({ page }) => {
        await page.goto('/settings');
        await page.waitForLoadState('networkidle');

        // Check for threshold configuration fields
        await expect(page.getByText(/Staleness|threshold/i).first()).toBeVisible({ timeout: 10000 });
    });

    test('should display blacklisted countries section', async ({ page }) => {
        await page.goto('/settings');
        await page.waitForLoadState('networkidle');

        // Check for blacklisted countries section
        await expect(page.getByText(/Blacklist|Countries/i).first()).toBeVisible({ timeout: 10000 });
    });
});
