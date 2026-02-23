import { test, expect } from '@playwright/test';
import { loginAsAdmin, signOut } from './helpers';

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
        await signOut(page);

        // --- 2. RECRUITER VIEW & RESOLVE ---
        await page.goto('/login');
        await expect(page.locator('#email')).toBeVisible({ timeout: 10000 });
        await page.fill('#email', 'recruiter.alerts@tnmanpower.com');
        await page.fill('#password', 'Recruiter123!');
        await page.locator('button[type="submit"]').click();
        await page.waitForURL(/.*dashboard|.*alerts/, { timeout: 15000 });

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
        await page.waitForLoadState('networkidle');
        // Navigate to CandidateA via the View button in their row
        const candidateRow = page.locator('tr').filter({ hasText: 'IDA_TESTV1' });
        await expect(candidateRow).toBeVisible({ timeout: 10000 });
        await candidateRow.getByRole('button', { name: 'View' }).click();

        await page.waitForLoadState('networkidle');
        await page.getByRole('tab', { name: 'Documents' }).click();

        // Locate the Passport Copies Update button
        const updateBtn = page.locator('div').filter({ hasText: /^Passport Copies/ }).locator('button', { hasText: 'Update' }).first();
        await expect(updateBtn).toBeVisible({ timeout: 10000 });
        await updateBtn.click();
        await page.getByRole('combobox').click();
        await page.locator('div[role="option"]').filter({ hasText: /^Submitted$/ }).click();
        await page.fill('textarea', 'Verified via consolidated E2E');
        await page.getByRole('button', { name: 'Save Changes' }).click();
        await expect(page.getByText('Submitted').first()).toBeVisible({ timeout: 10000 });

        // Log out Recruiter
        await signOut(page);

        // --- 4. ADMIN VALIDATE RESOLUTION ---
        await loginAsAdmin(page);
        await page.goto('/alerts');
        await page.getByRole('combobox', { name: 'Status' }).or(page.locator('button:has-text("Unresolved")')).click();
        await page.locator('div[role="option"]').filter({ hasText: /^Resolved$/ }).click();
        const adminResolvedRow = page.locator('tr').filter({ hasText: 'CandidateA' });
        await expect(adminResolvedRow).toContainText('Test Company A - Alerts', { timeout: 15000 });
    });
});
