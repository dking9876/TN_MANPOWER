# Orchestration Plan: Referrer Role
**Mode:** PLANNING
**Project Type:** WEB

## Overview
Add a new `REFERRER` role to the system. This person's job is strictly to find new candidates and add them to the system. They are explicitly forbidden from viewing other candidates, alerts, dashboards, or performing any other actions.

## Success Criteria
- [ ] Admins can create users with the `REFERRER` role.
- [ ] Referrers can log in successfully.
- [ ] Referrers can access the `Add Candidate` form (`/candidates/new`).
- [ ] Referrers cannot access `/dashboard`, `/alerts`, `/admin/*`, or see other candidates.
- [ ] Referrers cannot see `Dashboard` or `Alerts` in the sidebar.

## Tech Stack
- Typescript / Next.js
- Supabase (PostgreSQL, RLS)

## File Structure Changes
- `src/lib/supabase/types.ts`: Enum updates
- `src/lib/supabase/middleware.ts`: Role-based routing restrictions
- `src/components/layout/sidebar.tsx`: Role-based navigation rendering
- `supabase/migrations/`: New migration file for updating `user_role` type and RLS policies.

## Task Breakdown

### 1. Database Schema & RLS Update
**Agent:** `database-architect`
**Skills:** `database-design`
**Input:** Requirement to add `REFERRER` role.
**Output:** SQL migration to alter `user_role` type and update RLS policies for `candidates`, `documents`, and `alerts` tables.
**Verify:** Check that `REFERRER` role exists in the database and RLS policies correctly block `SELECT` for other candidates and all access to `alerts`.

### 2. Frontend Types & Middleware Update
**Agent:** `backend-specialist`
**Skills:** `api-patterns`
**Input:** Database changes for the `REFERRER` role.
**Output:** Updated `src/lib/supabase/types.ts` and modified `middleware.ts` to redirect referrers away from restricted routes.
**Verify:** Typecheck passes, and a referrer user hitting `/dashboard` is redirected to `/candidates/new`.

### 3. Frontend UI Redaction (Sidebar & Forms)
**Agent:** `frontend-specialist`
**Skills:** `frontend-design`
**Input:** The new `REFERRER` role.
**Output:** Updated `sidebar.tsx` hiding standard links and showing "Add Candidate"; updated `user-form-dialog.tsx` to allow admins to assign the `REFERRER` role.
**Verify:** Referrer sees a locked-down UI with only the ability to add candidates.

### 4. Verification Check
**Agent:** `test-engineer`
**Skills:** `testing-patterns`, `vulnerability-scanner`
**Input:** Completed implementations.
**Output:** Green test suite and security scan.
**Verify:** Execute all checklist Python scripts.

## ✅ PHASE X: Verification
- [ ] `npm run lint` && `npx tsc --noEmit`
- [ ] `python .agent/scripts/checklist.py .`
- [ ] Manual test of Restricted Access
