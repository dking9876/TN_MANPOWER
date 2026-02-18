import { test, expect } from '@playwright/test';
import { loginAsAdmin } from './helpers';

test.describe('Phase 2: Navigation & Sidebar', () => {
    test.beforeEach(async ({ page }) => {
        await loginAsAdmin(page);
    });

    test('should show sidebar with all main navigation links', async ({ page }) => {
        await expect(page.locator('nav >> text=Dashboard')).toBeVisible();
        await expect(page.locator('nav >> text=Candidates')).toBeVisible();
        await expect(page.locator('nav >> text=Alerts')).toBeVisible();
    });

    test('should show admin-only links for admin users', async ({ page }) => {
        // Admin should see User Management and Settings
        await expect(page.locator('nav >> text=User Management')).toBeVisible();
        await expect(page.locator('nav >> text=Settings')).toBeVisible();
    });

    test('should navigate to Candidates page', async ({ page }) => {
        await page.click('nav >> text=Candidates');
        await expect(page).toHaveURL(/.*candidates/, { timeout: 10000 });
    });

    test('should navigate to Alerts page', async ({ page }) => {
        await page.click('nav >> text=Alerts');
        await expect(page).toHaveURL(/.*alerts/, { timeout: 10000 });
    });

    test('should navigate to Dashboard', async ({ page }) => {
        // First navigate away
        await page.goto('/candidates');
        await page.waitForLoadState('networkidle');

        // Then click Dashboard
        await page.click('nav >> text=Dashboard');
        await expect(page).toHaveURL(/.*dashboard/, { timeout: 10000 });
    });

    test('should navigate to User Management', async ({ page }) => {
        await page.click('nav >> text=User Management');
        await expect(page).toHaveURL(/.*admin/, { timeout: 10000 });
    });

    test('should navigate to Settings', async ({ page }) => {
        await page.click('nav >> text=Settings');
        await expect(page).toHaveURL(/.*settings/, { timeout: 10000 });
    });
});
