import { test, expect } from '@playwright/test';
import { format, subYears } from 'date-fns';
import { loginAsAdmin } from './helpers';

test.describe('Candidate Management', () => {
    test.beforeEach(async ({ page }) => {
        await loginAsAdmin(page);
    });

    test('should create a new candidate and verify auto-creation of documents', async ({ page }) => {
        await page.goto('/candidates');
        await page.click('text=Add Candidate');

        const nationalId = `NID${Math.floor(Math.random() * 1000000)}`;
        const passportNum = `PASS${Math.floor(Math.random() * 1000000)}`;

        await page.fill('input[name="first_name"]', 'John');
        await page.fill('input[name="last_name"]', 'Doe');
        await page.fill('input[name="national_id"]', nationalId);
        await page.fill('input[name="passport_number"]', passportNum);

        const dob = format(subYears(new Date(), 25), 'yyyy-MM-dd');
        await page.fill('input[name="date_of_birth"]', dob);
        await page.fill('input[name="primary_phone"]', '12345678');
        await page.fill('input[name="emergency_phone"]', '87654321');

        // Select industry
        await page.click('button:has-text("Select industry")');
        await page.click('role=option[name="Nursing"]');

        // Select profession
        await page.waitForTimeout(500);
        await page.click('button:has-text("Select profession")');
        await page.click('role=option[name="Nurse"]');

        // Select level
        // English level defaults to "NONE", so we locate by index (3rd combobox)
        await page.locator('button[role="combobox"]').nth(2).click();
        await page.click('role=option[name="Good"]');

        await page.click('button:has-text("Create Candidate")');

        // Check success toast
        await expect(page.getByText('Candidate created successfully')).toBeVisible({ timeout: 15000 });

        // Verify in list
        await page.goto('/candidates');
        await expect(page.getByText(nationalId).first()).toBeVisible();

        // Navigate to details
        await page.getByText(nationalId).first().click();

        // Verify documents
        await page.click('button[role="tab"]:has-text("Documents")');
        await expect(page.getByText('Passport Copies')).toBeVisible();
        await expect(page.getByText('Police Report (Home)')).toBeVisible();
        await expect(page.getByText('Medical Report')).toBeVisible();
        await expect(page.getByText('Visa Application Form')).toBeVisible();
    });

    test('should show dynamic police reports for visited countries', async ({ page }) => {
        await page.goto('/candidates');
        await page.click('text=Add Candidate');

        const nationalId = `V${Math.floor(Math.random() * 1000000)}`;
        await page.fill('input[name="first_name"]', 'Visa');
        await page.fill('input[name="last_name"]', 'Traveller');
        await page.fill('input[name="national_id"]', nationalId);
        await page.fill('input[name="passport_number"]', `PV${Math.floor(Math.random() * 1000000)}`);
        await page.fill('input[name="date_of_birth"]', '1995-01-01');
        await page.fill('input[name="primary_phone"]', '12341234');
        await page.fill('input[name="emergency_phone"]', '43214321');

        // Select industry/profession
        await page.click('button:has-text("Select industry")');
        await page.click('role=option[name="Nursing"]');
        await page.waitForTimeout(500);
        await page.click('button:has-text("Select profession")');
        await page.click('role=option[name="Nurse"]');

        // Fill countries visited
        await page.getByLabel('Has visited other countries?').click();
        await page.getByPlaceholder('Dubai, Qatar, USA...').fill('Poland, Germany');

        await page.click('button:has-text("Create Candidate")');
        await expect(page.getByText('Candidate created successfully')).toBeVisible({ timeout: 15000 });

        // Navigate to details and verify dynamic docs
        await page.goto('/candidates');
        await page.getByText(nationalId).first().click();
        await page.click('button[role="tab"]:has-text("Documents")');

        await expect(page.getByText('Police Report (Poland)')).toBeVisible();
        await expect(page.getByText('Police Report (Germany)')).toBeVisible();
    });

    test('should auto-reject candidate from blacklisted country', async ({ page }) => {
        await page.goto('/candidates');
        await page.click('text=Add Candidate');

        const nationalId = `BL${Math.floor(Math.random() * 1000000)}`;

        await page.fill('input[name="first_name"]', 'Blacklist');
        await page.fill('input[name="last_name"]', 'Test');
        await page.fill('input[name="national_id"]', nationalId);
        await page.fill('input[name="passport_number"]', `PB${Math.floor(Math.random() * 1000000)}`);
        await page.fill('input[name="date_of_birth"]', '1990-01-01');
        await page.fill('input[name="primary_phone"]', '12345678');
        await page.fill('input[name="emergency_phone"]', '12345678');

        // Fill countries visited (Afghanistan is in DB blacklist)
        await page.getByLabel('Has visited other countries?').click();
        await expect(page.getByPlaceholder('Dubai, Qatar, USA...')).toBeVisible();
        await page.getByPlaceholder('Dubai, Qatar, USA...').fill('Afghanistan');

        // Professional info (required)
        await page.click('button:has-text("Select industry")');
        await page.click('role=option[name="Nursing"]');
        await page.waitForTimeout(500);
        await page.click('button:has-text("Select profession")');
        await page.click('role=option[name="Nurse"]');

        await page.click('button:has-text("Create Candidate")');

        // Verify rejection
        await expect(page.getByText('Candidate Rejected')).toBeVisible({ timeout: 15000 });
        await expect(page.getByText('Blacklisted')).toBeVisible();
    });
});
