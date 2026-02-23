import { test, expect } from '@playwright/test';
import { format, subYears } from 'date-fns';
import { loginAsReferrer, createReferrerUser, loginAsAdmin } from './helpers';

// Force serial execution: setup must run before all other tests
test.describe.configure({ mode: 'serial' });

/**
 * Setup: Create the referrer test user via Admin UI (runs first).
 */
test('setup: create referrer test user via admin', async ({ page }) => {
    await createReferrerUser(page);
});

/**
 * Referrer Role: Routing & Access Control
 * Verifies that a referrer is redirected away from all restricted routes.
 */
test.describe('Referrer Role: Routing & Access Control', () => {
    test.beforeEach(async ({ page }) => {
        await loginAsReferrer(page);
    });

    test('should redirect referrer to /candidates/new on login', async ({ page }) => {
        // loginAsReferrer already asserts URL is /candidates/new
        await expect(page).toHaveURL(/.*candidates\/new/);
    });

    test('should redirect referrer away from /dashboard', async ({ page }) => {
        await page.goto('/dashboard');
        await expect(page).toHaveURL(/.*candidates\/new/, { timeout: 10000 });
    });

    test('should NOT redirect referrer away from /candidates (list view)', async ({ page }) => {
        await page.goto('/candidates');
        await expect(page).toHaveURL(/.*candidates/, { timeout: 10000 });
        // Should show the candidates table
        await expect(page.locator('h1')).toHaveText('Candidates');
    });

    test('should redirect referrer away from /alerts', async ({ page }) => {
        await page.goto('/alerts');
        await expect(page).toHaveURL(/.*candidates\/new/, { timeout: 10000 });
    });

    test('should redirect referrer away from /admin/users', async ({ page }) => {
        await page.goto('/admin/users');
        await expect(page).toHaveURL(/.*candidates\/new/, { timeout: 10000 });
    });

    test('should redirect referrer away from /admin/settings', async ({ page }) => {
        await page.goto('/admin/settings');
        await expect(page).toHaveURL(/.*candidates\/new/, { timeout: 10000 });
    });
});

/**
 * Referrer Role: UI Restrictions (Sidebar)
 * Verifies the sidebar only shows "Add Candidate" and "Sign out" for referrers.
 */
test.describe('Referrer Role: UI Restrictions', () => {
    test.beforeEach(async ({ page }) => {
        await loginAsReferrer(page);
    });

    test('should NOT show Dashboard link in sidebar', async ({ page }) => {
        await expect(page.locator('nav >> text=Dashboard')).not.toBeVisible();
    });

    test('should show Candidates list link in sidebar', async ({ page }) => {
        await expect(page.locator('nav >> text=Candidates')).toBeVisible();
    });

    test('should NOT show Alerts link in sidebar', async ({ page }) => {
        await expect(page.locator('nav >> text=Alerts')).not.toBeVisible();
    });

    test('should NOT show User Management link in sidebar', async ({ page }) => {
        await expect(page.locator('nav >> text=User Management')).not.toBeVisible();
    });

    test('should NOT show Settings link in sidebar', async ({ page }) => {
        await expect(page.locator('nav >> text=Settings')).not.toBeVisible();
    });

    test('should show Add Candidate link in sidebar', async ({ page }) => {
        await expect(page.locator('nav >> text=Add Candidate')).toBeVisible();
    });

    test('should show Sign out button', async ({ page }) => {
        const signOut = page.getByText('Sign out').or(page.locator('button[title="Sign out"]')).first();
        await expect(signOut).toBeVisible();
    });
});

/**
 * Referrer Role: Functional Usage
 * Verifies the referrer can successfully submit a new candidate.
 */
test.describe('Referrer Role: Functional Usage', () => {
    test('should submit a new candidate successfully', async ({ page }) => {
        await loginAsReferrer(page);

        const nationalId = `REF${Math.floor(Math.random() * 1000000)}`;
        const passportNum = `PREF${Math.floor(Math.random() * 1000000)}`;

        // Fill personal info
        await page.fill('input[name="first_name"]', 'Referred');
        await page.fill('input[name="last_name"]', 'Candidate');
        await page.fill('input[name="national_id"]', nationalId);
        await page.fill('input[name="passport_number"]', passportNum);

        const dob = format(subYears(new Date(), 30), 'yyyy-MM-dd');
        await page.fill('input[name="date_of_birth"]', dob);
        await page.fill('input[name="primary_phone"]', '11223344');
        await page.fill('input[name="emergency_phone"]', '55667788');

        // Select industry
        await page.click('button:has-text("Select industry")');
        await page.click('role=option[name="Construction"]');

        // Select profession
        await page.waitForTimeout(500);
        await page.click('button:has-text("Select profession")');
        await page.waitForTimeout(500);
        // Click the first available profession option
        await page.locator('[role="option"]').first().click();

        // Submit
        await page.click('button:has-text("Create Candidate")');

        // Verify success
        await expect(page.getByText('Candidate created successfully')).toBeVisible({ timeout: 15000 });

        // Now verify it appears in the list
        await page.goto('/candidates');
        const candidateRow = page.getByRole('row', { name: nationalId });
        await expect(candidateRow).toBeVisible({ timeout: 15000 });
        await expect(candidateRow.getByText('Referred Candidate')).toBeVisible();
    });
});

/**
 * Admin Role: Referrer User Management
 * Verifies that admins can see the Referrer role option when creating users.
 */
test.describe('Admin: Referrer Role in User Management', () => {
    test('should show Referrer as a role option in create user dialog', async ({ page }) => {
        await loginAsAdmin(page);

        await page.goto('/admin/users');
        await page.waitForLoadState('networkidle');

        // Open the create user dialog
        await page.click('button:has-text("Add User"), button:has-text("Create User")');
        await page.waitForTimeout(500);

        // Open role dropdown
        await page.locator('button[role="combobox"]').click();

        // Verify Referrer option exists
        await expect(page.locator('role=option[name="Referrer"]')).toBeVisible();

        // Also verify other roles are still present
        await expect(page.locator('role=option[name="Admin"]')).toBeVisible();
        await expect(page.locator('role=option[name="Recruiter"]')).toBeVisible();
    });
});
