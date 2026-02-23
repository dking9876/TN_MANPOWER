import { test, expect } from '@playwright/test';
import { format, addDays, subDays } from 'date-fns';
import { loginAsAdmin } from './helpers';

test.describe('Candidate Documents Feature', () => {
    test.beforeEach(async ({ page }) => {
        await loginAsAdmin(page);
    });

    test('should configure document thresholds and verify expiration warnings', async ({ page }) => {
        // 1. Configure thresholds in Settings
        await page.goto('/admin/settings');
        await page.click('role=tab[name="Document Alerts"]');

        // Set Passport Copies to 10 days warning
        await page.getByRole('spinbutton', { name: 'Passport Copies' }).fill('10');

        // Set Medical Report to 0 days (Never Expires)
        await page.getByRole('spinbutton', { name: 'Medical Report' }).fill('0');

        await page.click('button:has-text("Save Thresholds")');
        await expect(page.getByText('Settings saved')).toBeVisible();

        // 2. Create/Find a candidate
        await page.goto('/candidates');
        await page.click('text=Add Candidate');

        const nid = `DOC${Math.floor(Math.random() * 1000000)}`;
        await page.fill('input[name="first_name"]', 'Document');
        await page.fill('input[name="last_name"]', 'Tester');
        await page.fill('input[name="national_id"]', nid);
        await page.fill('input[name="passport_number"]', `P${nid}`);
        await page.fill('input[name="date_of_birth"]', '1990-01-01');
        await page.fill('input[name="primary_phone"]', '12345678');
        await page.fill('input[name="emergency_phone"]', '12345678');

        // Select industry/profession
        await page.click('button:has-text("Select industry")');
        await page.click('role=option[name="Nursing"]');
        await page.waitForTimeout(500);
        await page.click('button:has-text("Select profession")');
        await page.click('role=option[name="Nurse"]');

        await page.click('button:has-text("Create Candidate")');
        await expect(page.getByText('Candidate created successfully')).toBeVisible({ timeout: 15000 });

        // 3. Navigate to Documents tab
        await page.goto('/candidates');
        await page.getByText(nid).first().click();
        await page.click('button[role="tab"]:has-text("Documents")');

        // 4. Test Passport Warning (Threshold is 10 days)
        // Set expiration to 5 days from now -> Should show warning
        const expiringSoonDate = format(addDays(new Date(), 5), 'yyyy-MM-dd');

        const passportCard = page.locator('div[data-slot="card"]').filter({ has: page.locator('[data-slot="card-title"]', { hasText: 'Passport Copies' }) });
        await passportCard.getByRole('button', { name: 'Update' }).click();

        // Open the Select
        await page.click('button[role="combobox"]:has-text("Pending"), button[role="combobox"]:has-text("Submitted")');
        await page.click('role=option[name="Submitted"]');

        await page.fill('input[type="date"]', expiringSoonDate);
        await page.click('button:has-text("Save Changes")');
        await expect(page.getByText('Document updated successfully')).toBeVisible();

        // Verify "Expiring Soon" badge and warning icon
        await expect(passportCard.getByText('Expiring Soon')).toBeVisible();
        await expect(passportCard.locator('svg').first()).toBeVisible();

        // 5. Test Medical Report (Threshold is 0 - Never Expires)
        // Set expiration to 1 day from now -> Should NOT show warning
        const almostExpiredDate = format(addDays(new Date(), 1), 'yyyy-MM-dd');

        const medicalCard = page.locator('div[data-slot="card"]').filter({ has: page.locator('[data-slot="card-title"]', { hasText: 'Medical Report' }) });
        await medicalCard.getByRole('button', { name: 'Update' }).click();

        await page.click('button[role="combobox"]:has-text("Pending"), button[role="combobox"]:has-text("Submitted")');
        await page.click('role=option[name="Submitted"]');

        await page.fill('input[type="date"]', almostExpiredDate);
        await page.click('button:has-text("Save Changes")');
        await expect(page.getByText('Document updated successfully')).toBeVisible();

        // Verify "Submitted" badge and NO warning
        await expect(medicalCard.getByText('Submitted')).toBeVisible();
        await expect(medicalCard.locator('svg.lucide-alert-triangle')).not.toBeVisible();
    });

    test('should handle dynamic police reports and automatic expired state', async ({ page }) => {
        await page.goto('/candidates');
        await page.click('text=Add Candidate');

        const nid = `DYN${Math.floor(Math.random() * 1000000)}`;
        await page.fill('input[name="first_name"]', 'Dynamic');
        await page.fill('input[name="last_name"]', 'Test');
        await page.fill('input[name="national_id"]', nid);
        await page.fill('input[name="passport_number"]', `PD${nid}`);
        await page.fill('input[name="date_of_birth"]', '1990-01-01');
        await page.fill('input[name="primary_phone"]', '11112222');
        await page.fill('input[name="emergency_phone"]', '22221111');

        // Select industry/profession
        await page.click('button:has-text("Select industry")');
        await page.click('role=option[name="Nursing"]');
        await page.waitForTimeout(500);
        await page.click('button:has-text("Select profession")');
        await page.click('role=option[name="Nurse"]');

        // Add visited countries
        await page.getByLabel('Has visited other countries?').click();
        await page.getByPlaceholder('Dubai, Qatar, USA...').fill('Oman');

        await page.click('button:has-text("Create Candidate")');
        await expect(page.getByText('Candidate created successfully')).toBeVisible({ timeout: 15000 });

        // Navigate to Documents
        await page.goto('/candidates');
        await page.getByText(nid).first().click();
        await page.click('button[role="tab"]:has-text("Documents")');

        // Verify dynamic police report
        await expect(page.getByText('Police Report (Oman)')).toBeVisible();

        // Test automatic "Expired" state
        const expiredDate = format(subDays(new Date(), 5), 'yyyy-MM-dd');

        const omanCard = page.locator('div[data-slot="card"]').filter({ has: page.locator('[data-slot="card-title"]', { hasText: 'Police Report (Oman)' }) });
        await omanCard.getByRole('button', { name: 'Update' }).click();

        await page.click('button[role="combobox"]:has-text("Pending"), button[role="combobox"]:has-text("Submitted")');
        await page.click('role=option[name="Submitted"]');

        await page.fill('input[type="date"]', expiredDate);
        await page.click('button:has-text("Save Changes")');

        // Verify automatic "Expired" badge
        await expect(omanCard.getByText('Expired')).toBeVisible();
    });
});
