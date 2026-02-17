import { test, expect } from '@playwright/test';
import { format, subYears } from 'date-fns';
import { loginAsAdmin } from './helpers';

test.describe('Debug Candidate', () => {
    test.beforeEach(async ({ page }) => {
        await loginAsAdmin(page);
    });

    test.only('should fill form and submit', async ({ page }) => {
        console.log('Starting debug test...');
        page.on('console', msg => console.log('BROWSER:', msg.text()));

        await page.goto('/candidates');
        await page.click('text=Add Candidate');

        await page.fill('input[name="first_name"]', 'Debug');
        await page.fill('input[name="last_name"]', 'User');
        await page.fill('input[name="national_id"]', `DBG${Date.now()}`);
        await page.fill('input[name="passport_number"]', `PASS${Date.now()}`);
        await page.fill('input[name="date_of_birth"]', '1990-01-01');
        await page.fill('input[name="primary_phone"]', '12345678');
        await page.fill('input[name="emergency_phone"]', '87654321');

        console.log('Filling selects...');
        // Industry
        await page.click('button[role="combobox"]:has-text("Select industry")');
        await page.click('div[role="option"]:has-text("Nursing")');

        // Profession
        await expect(page.locator('button[role="combobox"]:has-text("Select profession")')).toBeEnabled();
        await page.click('button[role="combobox"]:has-text("Select profession")');
        await page.click('div[role="option"]:has-text("Nurse")');

        // English
        // Fallback to index if named selector fails. 0=Industry, 1=Profession, 2=English
        try {
            await page.locator('button[role="combobox"]').nth(2).click({ timeout: 2000 });
        } catch (e) {
            console.log('Failed to click English with index. Dumping form HTML...');
            const formHtml = await page.locator('form').innerHTML();
            console.log('FORM HTML:', formHtml);
            throw e;
        }
        await page.click('div[role="option"]:has-text("Good")');

        console.log('Clicking submit...');
        await page.click('button[type="submit"]');

        console.log('Waiting for success...');
        try {
            await expect(page.getByText(/created successfully/i)).toBeVisible({ timeout: 10000 });
            console.log('Success!');
        } catch (e) {
            console.log('Usage failed. Checking errors.');
            const errors = await page.locator('.text-destructive').allTextContents();
            console.log('Errors:', errors);

            // Check if we are still on the same page
            console.log('URL:', page.url());

            // Screenshot
            await page.screenshot({ path: 'debug-failure.png', fullPage: true });
            throw e;
        }
    });
});
