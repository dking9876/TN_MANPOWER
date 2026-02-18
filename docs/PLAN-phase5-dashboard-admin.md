# Phase 5 — Dashboard & Admin

Build the Dashboard page (metrics, charts, activity log), User Management (CRUD), and System Settings (thresholds, blacklisted countries, professions).

> [!NOTE]
> Phase 6 (Polish & Deploy) is **excluded** per user request. This plan covers Phase 5 only.

---

## Proposed Changes

### 5.1 Dashboard Page

The existing placeholder at `/dashboard` will be replaced with a full metrics page.

#### Data Layer

#### [NEW] [use-dashboard.ts](file:///c:/Users/Daniel/Code_projects/TN_MANPOWER/src/lib/hooks/use-dashboard.ts)

TanStack Query hook that fetches all dashboard metrics in a single call via a **server action** or **API route**. Returns:

| Metric | Source Query |
|--------|-------------|
| Total candidates | `candidates.select('*', { count: 'exact', head: true })` |
| By status breakdown | `candidates.select('recruitment_status')` → group client-side |
| By industry breakdown | `candidates.select('primary_industry')` → group client-side |
| Monthly trend (6mo) | `candidates.select('created_at')` → bucket by month |
| Document completion | `documents.select('document_type, is_received')` → aggregate |
| Expiring documents | `documents.select('*').lt('expiration_date', threshold).gt('expiration_date', now)` |
| Alert summary | Two count queries: `is_resolved=false` and `is_resolved=true` |
| Recent activity | `audit_logs.select('*, user:user_id(full_name), candidate:candidate_id(first_name, last_name)').order('timestamp', desc).limit(15)` |

Single hook `useDashboardData()` returns all above in one object.

#### UI Components

#### [NEW] [stat-cards.tsx](file:///c:/Users/Daniel/Code_projects/TN_MANPOWER/src/components/dashboard/stat-cards.tsx)

4 stat cards in a responsive grid (`sm:grid-cols-2 lg:grid-cols-4`):
- **Total Candidates** — with trending indicator
- **In Progress** — candidates not in ARRIVED/REJECTED status
- **Open Alerts** — unresolved alert count
- **Arrived This Month** — candidates with ARRIVED status created this month

Each card: icon, label, value, optional trend badge. Uses teal/emerald accent colors.

#### [NEW] [status-chart.tsx](file:///c:/Users/Daniel/Code_projects/TN_MANPOWER/src/components/dashboard/status-chart.tsx)

Recharts **BarChart** — horizontal bars showing candidate count per recruitment status (10 statuses). Color-coded by category (active = teal, completed = emerald, rejected = red).

#### [NEW] [industry-chart.tsx](file:///c:/Users/Daniel/Code_projects/TN_MANPOWER/src/components/dashboard/industry-chart.tsx)

Recharts **PieChart** (donut variant) — candidates by industry (7 industries). Legend below chart. Teal-based color palette.

#### [NEW] [trend-chart.tsx](file:///c:/Users/Daniel/Code_projects/TN_MANPOWER/src/components/dashboard/trend-chart.tsx)

Recharts **AreaChart** — candidates created per month, last 6 months. Gradient fill, smooth curve.

#### [NEW] [document-completion.tsx](file:///c:/Users/Daniel/Code_projects/TN_MANPOWER/src/components/dashboard/document-completion.tsx)

Card showing overall document completion rate as a progress bar + percentage. Dropdown/select filter to drill into per-document-type (Passport, Visa, etc.). Also lists documents expiring within the threshold period.

#### [NEW] [alert-summary.tsx](file:///c:/Users/Daniel/Code_projects/TN_MANPOWER/src/components/dashboard/alert-summary.tsx)

Card with open vs resolved alert counts. Small donut or visual indicator. Link to `/alerts` page.

#### [NEW] [activity-feed.tsx](file:///c:/Users/Daniel/Code_projects/TN_MANPOWER/src/components/dashboard/activity-feed.tsx)

Timeline-style list of last 15 audit log entries. Each entry shows: user name, action (CREATE/UPDATE/DELETE/STATUS_CHANGE), candidate name, timestamp (relative via `date-fns`). Scrollable with "View all" link.

#### Page Assembly

#### [MODIFY] [page.tsx](file:///c:/Users/Daniel/Code_projects/TN_MANPOWER/src/app/(app)/dashboard/page.tsx)

Replace the placeholder with a client component wrapper that:
1. Renders stat cards row
2. Two-column grid: Status bar chart (left) + Industry donut (right)
3. Full-width trend chart
4. Two-column: Document completion (left) + Alert summary (right)
5. Full-width activity feed

---

### 5.2 User Management (Admin Only)

#### Data Layer

#### [NEW] [use-users.ts](file:///c:/Users/Daniel/Code_projects/TN_MANPOWER/src/lib/hooks/use-users.ts)

TanStack Query hooks:
- `useUsers()` — fetch all users from `public.users`
- `useCreateUser()` — mutation: calls a **server action** that uses Supabase Admin API (`supabase.auth.admin.createUser()`) + inserts into `public.users`
- `useUpdateUser()` — mutation: update `public.users` (name, role)
- `useResetPassword()` — mutation: calls `supabase.auth.admin.updateUserById()` with new password
- `useToggleUserActive()` — mutation: update `is_active` in `public.users`
- `useDeleteUser()` — mutation: calls `supabase.auth.admin.deleteUser()` + delete from `public.users`

> [!IMPORTANT]
> User creation/deletion/password-reset require the **Supabase service role key** (admin-level). These operations MUST go through **Next.js Server Actions** (not client-side). The service role key stays server-side only.

#### Server Actions

#### [NEW] [user-actions.ts](file:///c:/Users/Daniel/Code_projects/TN_MANPOWER/src/lib/actions/user-actions.ts)

`"use server"` module with:
- `createUserAction(data)` — validates admin role, calls `auth.admin.createUser()`, inserts `public.users` row
- `deleteUserAction(userId)` — validates admin role, calls `auth.admin.deleteUser()`, deletes `public.users` row
- `resetPasswordAction(userId, newPassword)` — validates admin role, calls `auth.admin.updateUserById()`
- `toggleUserActiveAction(userId, isActive)` — validates admin role, updates `public.users`
- `updateUserAction(userId, data)` — validates admin role, updates `public.users`

Each action checks that the calling user is an ADMIN before proceeding.

#### UI Components

#### [NEW] [user-list.tsx](file:///c:/Users/Daniel/Code_projects/TN_MANPOWER/src/components/admin/user-list.tsx)

Table view of all users: Name, Email, Role, Status (Active/Inactive), Last Login, Created At. Action dropdown per row: Edit, Reset Password, Deactivate/Activate, Delete (with confirmation dialog).

#### [NEW] [user-form-dialog.tsx](file:///c:/Users/Daniel/Code_projects/TN_MANPOWER/src/components/admin/user-form-dialog.tsx)

Shared dialog for Create and Edit user:
- **Create mode**: Full name, Email, Password (manual), Confirm Password, Role (ADMIN/RECRUITER)
- **Edit mode**: Full name, Role (email read-only, password not shown)
- Zod validation schema

#### [NEW] [reset-password-dialog.tsx](file:///c:/Users/Daniel/Code_projects/TN_MANPOWER/src/components/admin/reset-password-dialog.tsx)

Dialog: New Password, Confirm Password fields. Calls `resetPasswordAction`.

#### [NEW] [delete-user-dialog.tsx](file:///c:/Users/Daniel/Code_projects/TN_MANPOWER/src/components/admin/delete-user-dialog.tsx)

Confirmation dialog with user name. Prevents deleting yourself. Calls `deleteUserAction`.

#### Page Assembly

#### [MODIFY] [page.tsx](file:///c:/Users/Daniel/Code_projects/TN_MANPOWER/src/app/(app)/admin/users/page.tsx)

Replace placeholder with `UserList` component + "Add User" button.

---

### 5.3 System Settings (Admin Only)

#### Data Layer

#### [NEW] [use-settings.ts](file:///c:/Users/Daniel/Code_projects/TN_MANPOWER/src/lib/hooks/use-settings.ts)

TanStack Query hooks:
- `useSystemConfig()` — fetch all rows from `system_config`
- `useUpdateConfig()` — mutation: upsert `system_config` rows
- `useBlacklistedCountries()` — fetch from `blacklisted_countries` table
- `useToggleBlacklist()` — mutation: toggle `is_blacklisted` for a country
- `useProfessions()` — fetch from `industry_professions` table
- `useAddProfession()` / `useDeleteProfession()` — mutations

#### UI Components

#### [NEW] [alert-thresholds-section.tsx](file:///c:/Users/Daniel/Code_projects/TN_MANPOWER/src/components/settings/alert-thresholds-section.tsx)

Form with two number inputs:
- Staleness threshold (days)
- Document expiration warning threshold (days)
- Save button that upserts into `system_config`

#### [NEW] [blacklisted-countries-section.tsx](file:///c:/Users/Daniel/Code_projects/TN_MANPOWER/src/components/settings/blacklisted-countries-section.tsx)

Searchable list of all ~90 countries. Each row: country name + toggle switch (blacklisted/not). Search bar to filter. Changes save immediately (optimistic toggle).

#### [NEW] [professions-section.tsx](file:///c:/Users/Daniel/Code_projects/TN_MANPOWER/src/components/settings/professions-section.tsx)

Grouped by industry (7 groups). Each group shows its professions with delete button. "Add Profession" button per group (inline input + industry select). 

#### Page Assembly

#### [MODIFY] [page.tsx](file:///c:/Users/Daniel/Code_projects/TN_MANPOWER/src/app/(app)/admin/settings/page.tsx)

Replace placeholder with three sections in a tabbed layout (using shadcn Tabs):
- **Alert Thresholds** tab
- **Blacklisted Countries** tab
- **Professions** tab

---

### 5.4 Supporting Changes

#### [MODIFY] [types.ts](file:///c:/Users/Daniel/Code_projects/TN_MANPOWER/src/lib/supabase/types.ts)

Regenerate types if any schema changes are made (unlikely — all tables already exist).

#### Environment Variable

> [!IMPORTANT]
> The **service role key** (`SUPABASE_SERVICE_ROLE_KEY`) is needed for user management server actions. This must be added to `.env.local` and Vercel environment variables. It should be the `service_role` key from Supabase project settings.

---

## Verification Plan

### Automated Checks

| Check | Command |
|-------|---------|
| TypeScript | `npx tsc --noEmit` |
| Build | `npm run build` |

### Browser Smoke Tests

After `npm run dev`, verify in the browser:

1. **Dashboard** — Navigate to `/dashboard`:
   - Stat cards show real counts (not "—")
   - Bar chart renders with status distribution
   - Donut chart renders with industry distribution
   - Area chart shows 6-month trend
   - Document completion shows percentage + filter works
   - Activity feed shows audit log entries with user names

2. **User Management** — Navigate to `/admin/users`:
   - User table shows admin + recruiter accounts
   - Click "Add User" → form dialog opens → create user with password → user appears in table
   - Click Edit → change role → save → table updates
   - Click Reset Password → set new password → login with new password works
   - Click Deactivate → user marked inactive → user can't login
   - Click Activate → user active again
   - Delete a test user → user removed (prevent self-deletion)

3. **System Settings** — Navigate to `/admin/settings`:
   - Alert Thresholds tab: change staleness days → save → refresh → value persists
   - Blacklisted Countries tab: toggle a country → refresh → toggle persists
   - Professions tab: add a profession → appears in list → delete → removed

4. **Access Control** — Login as recruiter → verify `/admin/users` and `/admin/settings` are not accessible (redirect or 403)
