import { test, expect } from '@playwright/test';
import { loginAsAdmin, signOut } from './helpers';

test.describe('Admin User Management', () => {
    test.beforeEach(async ({ page }) => {
        await loginAsAdmin(page);
        await page.goto('/admin/users');
        await page.waitForLoadState('networkidle');
    });

    test('should manage user lifecycle (create, edit, toggle, delete)', async ({ page }) => {
        const testUserEmail = `test-${Date.now()}@example.com`;
        const testUserName = `User-${Date.now()}`;
        const updatedUserName = `Updated-${Date.now()}`;

        // 1. Create User
        await page.getByRole('button', { name: /Add User/i }).click();
        await expect(page.getByRole('dialog')).toBeVisible();

        await page.fill('#fullName', testUserName);
        await page.fill('#email', testUserEmail);
        await page.fill('#password', 'TestPassword123!');
        await page.fill('#confirmPassword', 'TestPassword123!');

        // Select Recruiter role (default)
        await page.getByRole('button', { name: /Create User/i }).click();

        // Verify creation
        await expect(page.getByText(testUserEmail)).toBeVisible({ timeout: 15000 });
        await expect(page.getByText(testUserName)).toBeVisible();

        // 2. Edit User
        const userRow = page.locator('tr').filter({ hasText: testUserEmail });
        await userRow.locator('button').click(); // The dropdown trigger
        await page.getByRole('menuitem', { name: /Edit/i }).click();

        await page.fill('#fullName', updatedUserName);
        await page.getByRole('button', { name: /Save Changes/i }).click();

        // Verify edit persistence
        await expect(page.getByText(updatedUserName)).toBeVisible();
        await page.reload();
        await expect(page.getByText(updatedUserName)).toBeVisible();

        // 3. Toggle Status (Deactivate)
        await userRow.locator('button').click();
        await page.getByRole('menuitem', { name: /Deactivate/i }).click();

        // Use a more specific selector for the status badge change
        await expect(userRow.getByText(/Inactive/i)).toBeVisible({ timeout: 15000 });

        // Verify Activate menu item appears
        await userRow.locator('button').click();
        await expect(page.getByRole('menuitem', { name: /Activate/i })).toBeVisible({ timeout: 10000 });
        await page.keyboard.press('Escape'); // Close menu

        // 4. Delete User
        await userRow.locator('button').click();
        await page.getByRole('menuitem', { name: /Delete/i }).click();

        // Confirm deletion
        await page.getByRole('button', { name: /Delete User/i }).click();

        // Verify deletion
        await expect(page.getByText(testUserEmail)).not.toBeVisible({ timeout: 15000 });
    });
});
