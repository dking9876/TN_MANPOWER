import { test, expect } from '@playwright/test';

test('has title', async ({ page }) => {
    await page.goto('/');

    // Expect a title "to contain" a substring.
    // Note: Adjust this expected title to match your actual app title if known, 
    // otherwise this test might fail initially, which is fine (Red-Green-Refactor).
    await expect(page).toHaveTitle(/Manpower/i);
});

test('check for main heading', async ({ page }) => {
    await page.goto('/');
    // Check if there is a main heading
    await expect(page.locator('h1')).toBeVisible();
});
