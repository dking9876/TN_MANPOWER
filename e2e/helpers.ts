import { Page, expect } from '@playwright/test';

export async function loginAsAdmin(page: Page) {
    await page.goto('/login');
    await page.fill('#email', 'admin@tnmanpower.com');
    await page.fill('#password', 'Admin123!');
    await page.click('button[type="submit"]');
    await expect(page).toHaveURL(/.*dashboard/, { timeout: 15000 });
}
