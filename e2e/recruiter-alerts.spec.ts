import { test, expect } from '@playwright/test';
import { loginAsAdmin } from './helpers';

test.describe('Company-Based Alerts RBAC', () => {

    test('Admin and Recruiter Unified Flow', async ({ page }) => {
        // --- 1. ADMIN VIEW ALL ---
        await loginAsAdmin(page);
        await page.goto('/alerts');
        await page.waitForLoadState('networkidle');
        // Wait for potential background generation/propagation
        await page.waitForTimeout(5000);
        await expect(page.locator('tr').filter({ hasText: 'CandidateA' })).toBeVisible({ timeout: 20000 });
        await expect(page.locator('tr').filter({ hasText: 'CandidateB' })).toBeVisible({ timeout: 15000 });

        // Log out admin
        await page.click('button:has-text("Sign out")');
        await expect(page).toHaveURL(/.*login/, { timeout: 10000 });
        await page.waitForLoadState('networkidle');

        // --- 2. RECRUITER VIEW & RESOLVE ---
        await page.goto('/login');
        await page.fill('#email', 'recruiter.alerts@tnmanpower.com');
        await page.fill('#password', 'Recruiter123!');
        await page.click('button[type="submit"]');

        // Go to Alerts page
        await page.goto('/alerts');

        // Verify RBAC: Can see A, cannot see B
        await expect(page.getByText('Test staleness alert for CandidateA in Company A')).toBeVisible({ timeout: 15000 });
        await expect(page.getByText('Test staleness alert for CandidateB in Company B')).not.toBeVisible();

        // Resolve CandidateA Alert
        const row = page.locator('tr').filter({ hasText: 'CandidateA' });
        await row.getByRole('button', { name: 'Resolve' }).click();
        await page.fill('textarea', 'Tested resolution via consolidated E2E');
        await page.locator('button[role="checkbox"]').click(); // Uncheck timestamp update
        await page.getByRole('button', { name: 'Resolve Alert' }).click();
        await expect(page.getByText('Alert resolved')).toBeVisible({ timeout: 10000 });

        // Check Resolved Tab as Recruiter
        await page.getByRole('combobox', { name: 'Status' }).or(page.locator('button:has-text("Unresolved")')).click();
        await page.locator('div[role="option"]').filter({ hasText: /^Resolved$/ }).click();

        const resolvedRow = page.locator('tr').filter({ hasText: 'CandidateA' });
        await expect(resolvedRow).toContainText('Test Company A - Alerts', { timeout: 10000 });

        // --- 3. RECRUITER DOCUMENT UPDATE ---
        await page.goto('/candidates');
        await page.getByText('IDA_TESTV1').first().waitFor({ state: 'visible' });
        await page.getByText('IDA_TESTV1').first().click();

        await page.click('button[role="tab"]:has-text("Documents")');
        const docCard = page.locator('.card').filter({ hasText: 'Passport Copies' });
        await docCard.getByRole('button', { name: 'Update' }).click();
        await page.getByRole('combobox').click();
        await page.locator('div[role="option"]').filter({ hasText: /^Submitted$/ }).click();
        await page.fill('textarea', 'Verified via consolidated E2E');
        await page.getByRole('button', { name: 'Save Changes' }).click();
        await expect(docCard.getByText('Submitted')).toBeVisible({ timeout: 10000 });

        // Log out Recruiter
        const signOutBtn = page.getByText('Sign out').or(page.locator('button[title="Sign out"]')).first();
        await signOutBtn.click();
        await expect(page).toHaveURL(/.*login/, { timeout: 10000 });
        await page.waitForLoadState('networkidle');

        // --- 4. ADMIN VALIDATE RESOLUTION ---
        await loginAsAdmin(page);
        await page.goto('/alerts');
        await page.getByRole('combobox', { name: 'Status' }).or(page.locator('button:has-text("Unresolved")')).click();
        await page.locator('div[role="option"]').filter({ hasText: /^Resolved$/ }).click();
        const adminResolvedRow = page.locator('tr').filter({ hasText: 'CandidateA' });
        await expect(adminResolvedRow).toContainText('Test Company A - Alerts', { timeout: 15000 });
    });
});
