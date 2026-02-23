# Referrer Role Test Plan

This plan details the End-to-End (E2E) tests required to verify the new `REFERRER` role functionality, ensuring they are properly restricted and can perform their designated actions.

## Overview
We need to verify that:
1. Referrers can log in and are correctly routed to `/candidates/new`.
2. Referrers can successfully submit a new candidate.
3. Referrers **cannot** access `/dashboard`, `/candidates` (list view), `/alerts`, or `/admin/*`.
4. The sidebar for referrers only shows the "Add Candidate" link and "Sign out".
5. Admins can successfully create a new user with the `REFERRER` role.

## Proposed E2E Tests (Playwright)

### 1. `e2e/helpers.ts` update
- Add `loginAsReferrer(page: Page)` helper function. Requires a predefined referrer test account in the seeding process, or we can create one dynamically if a seed script is not explicitly enforcing one. (Assuming `referrer@tnmanpower.com` / `Referrer123!` for testing).

### 2. `e2e/referrer.spec.ts` (New File)
- **Test 1: Routing & Access Control**
  - Login as referrer.
  - Verify automatic redirect to `/candidates/new`.
  - Attempt direct navigation to `/dashboard` -> Verify redirect back to `/candidates/new`.
  - Attempt direct navigation to `/candidates` -> Verify redirect back to `/candidates/new`.
  - Attempt direct navigation to `/alerts` -> Verify redirect back to `/candidates/new`.
  - Attempt direct navigation to `/admin/users` -> Verify redirect back to `/candidates/new`.
- **Test 2: UI Restrictions (Sidebar)**
  - Login as referrer.
  - Check sidebar links: Verify "Dashboard", "Candidates" (table), "Alerts", and "User Management" are **not visible**.
  - Verify "Add Candidate" link **is visible**.
- **Test 3: Functional Usage**
  - Login as referrer (on `/candidates/new`).
  - Fill out the required candidate fields (Name, Phone, Passport, Industry, Profession).
  - Submit the form.
  - Verify success toast/message appears.
  - Verify the form resets or stays on the allowed page.

### 3. `e2e/admin.spec.ts` (Update Existing)
- **Test Addition:**
  - Login as admin.
  - Navigate to User Management.
  - Open "Create User" dialog.
  - Verify `Referrer` is an available option in the Role dropdown.

## Verification
- Run `npx playwright test e2e/referrer.spec.ts` to verify the new test suite passes.
- Run `npx playwright test e2e/admin.spec.ts` to ensure admin functionality hasn't degraded.
