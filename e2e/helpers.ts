import { Page, expect } from '@playwright/test';

/** Navigates to /login, waits for the form, fills credentials and asserts landing on dashboard. */
export async function loginAsAdmin(page: Page) {
    await page.goto('/login');
    await page.waitForLoadState('networkidle');
    await page.fill('#email', 'admin@tnmanpower.com');
    await page.fill('#password', 'Admin123!');
    await page.click('button[type="submit"]');
    // Wait for URL to change to dashboard, with a fallback for slow hydration
    await expect(page).toHaveURL(/.*dashboard|.*candidates/, { timeout: 20000 });
}

export async function loginAsReferrer(page: Page) {
    await page.goto('/login');
    await expect(page.locator('#email')).toBeVisible({ timeout: 10000 });
    await page.fill('#email', 'referrer@tnmanpower.com');
    await page.fill('#password', 'Referrer123!');
    await page.locator('button[type="submit"]').click();
    // Referrer is redirected by middleware from /dashboard to /candidates/new
    await expect(page).toHaveURL(/.*candidates\/new/, { timeout: 20000 });
}

/** Signs out from any authenticated page and waits for redirect to /login. */
export async function signOut(page: Page) {
    const signOutBtn = page.getByText('Sign out').or(page.locator('button[title="Sign out"]')).first();
    await signOutBtn.click();
    await expect(page).toHaveURL(/.*login/, { timeout: 10000 });
    await page.waitForLoadState('networkidle');
}

/**
 * Creates a referrer test user via the Admin UI.
 * Logs in as admin, navigates to User Management, creates the user, then signs out.
 */
export async function createReferrerUser(page: Page) {
    await loginAsAdmin(page);

    await page.goto('/admin/users');
    await page.waitForLoadState('networkidle');

    // Wait for the user list to render
    await expect(page.getByText('admin@tnmanpower.com')).toBeVisible({ timeout: 15000 });

    // Check if referrer user already exists
    const referrerExists = await page.getByText('referrer@tnmanpower.com').isVisible().catch(() => false);
    if (referrerExists) {
        // Sign out so the next test can log in fresh
        await signOut(page);
        return;
    }

    // Click "Add User" button
    await page.getByRole('button', { name: /Add User/i }).click();

    // Wait for dialog to open
    await expect(page.getByRole('dialog')).toBeVisible({ timeout: 5000 });

    // Fill the form
    await page.fill('#fullName', 'Test Referrer');
    await page.fill('#email', 'referrer@tnmanpower.com');
    await page.fill('#password', 'Referrer123!');
    await page.fill('#confirmPassword', 'Referrer123!');

    // Select REFERRER role: click the combobox, then choose "Referrer"
    const roleCombobox = page.getByRole('dialog').locator('button[role="combobox"]');
    await roleCombobox.click();
    await page.getByRole('option', { name: 'Referrer' }).click();

    // Submit the form
    await page.getByRole('dialog').getByRole('button', { name: /Create User/i }).click();

    // Wait for user to appear in the list (confirms successful creation)
    await expect(page.getByText('referrer@tnmanpower.com')).toBeVisible({ timeout: 15000 });

    // Sign out so the next test can log in fresh
    await signOut(page);
}

