# Orchestration Plan: Adding Companies

## Phase 1: Planning
- [x] Gather Requirements (id/name only, ON DELETE SET NULL, admins only)
- [x] Create Implementation Plan

## Phase 2: Implementation (Parallel execution after approval)
### Foundation Layer (Database & Security)
- **`database-architect`**
  - Execute SQL to create `companies` table.
  - Alter `candidates` table to add `company_id`.
  - Update `src/lib/supabase/types.ts`.
- **`security-auditor`**
  - Add RLS policies for `companies` table: `SELECT` for all authenticated, `INSERT/UPDATE/DELETE` for `user_role = 'ADMIN'`.

### Core Layer (Backend & Frontend)
- **`backend-specialist`**
  - Update `candidate-schema.ts`.
  - Update CRUD operations in Server Actions or Edge functions if required.
- **`frontend-specialist`**
  - Update Settings/Admin page to include Company management form and list.
  - Update Candidate forms (Create/Edit) to have the Company Dropdown.

### Polish Layer (Testing & DevOps)
- **`test-engineer`**
  - Run verification scripts: `vulnerability-scanner`, `lint-and-validate`.
  - Test UI components and verify DB constraints.
