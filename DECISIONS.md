# TN MANPOWER — Decision Log

> Technical and business decisions made during development. Read this at the start of each conversation.

---

## Project Decisions

| # | Date | Decision | Rationale |
|---|------|----------|-----------|
| D1 | 2026-02-16 | **Supabase region: eu-central-1** | Lowest latency to Israel (user confirmed) |
| D2 | 2026-02-16 | **Light mode only** (no dark mode) | User preference |
| D3 | 2026-02-16 | **English UI** | Hebrew can be added later via i18n |
| D4 | 2026-02-16 | **3 conversations** to complete project | Too large for single conversation |
| D5 | 2026-02-16 | **Seed sample candidates** | For development/testing convenience |
| D6 | 2026-02-16 | **Git repo** | Set up after scaffold |
| D7 | 2026-02-18 | **Admin Password Update** | Manual password set in UI for admin creation |
| D8 | 2026-02-18 | **Settings Keys matching DB** | Thresholds use `staleness_threshold_days`, etc. |

## Architecture Decisions

| # | Date | Decision | Rationale |
|---|------|----------|-----------|
| A1 | 2026-02-16 | **Zustand** for client state | Lightweight, no boilerplate |
| A2 | 2026-02-16 | **TanStack Query** for server state | Caching, refetching, optimistic updates |
| A3 | 2026-02-16 | **react-hook-form + zod** for forms | Best DX for complex multi-section forms |
| A4 | 2026-02-16 | **DB triggers** for business rules | Can't be bypassed, guaranteed enforcement |
| A5 | 2026-02-16 | **App-level validation** as second layer | User-facing error messages before DB round-trip |
| A6 | 2026-02-16 | **Edge Function + pg_cron** for alerts | Server-side daily job, no client dependency |
| A7 | 2026-02-16 | **DB audit trigger** on candidates table | Guaranteed logging without app code |
| A8 | 2026-02-16 | **Next.js route groups** | `(auth)` for login, `(app)` for authenticated pages |
| A9 | 2026-02-16 | **Supabase RLS** for access control | Row-level security enforced at DB layer |
| A10 | 2026-02-18 | **Supabase Admin Client** | Uses Service Role Key for secure user management |
| A11 | 2026-02-18 | **Server Actions for Auth** | Moves password reset/deletion to server-side |

## Business Logic Decisions

| # | Date | Decision | Rule |
|---|------|----------|------|
| B1 | 2026-02-16 | **Blacklist = DB trigger + UI warning** | Rule 1 |
| B2 | 2026-02-16 | **Auto-create 4 docs = DB trigger** | Rule 2 |
| B3 | 2026-02-16 | **Age check = zod + DB constraint** | Rule 3 |
| B4 | 2026-02-16 | **Audit log = DB trigger** | Rule 5 |
| B5 | 2026-02-16 | **last_updated_at = DB trigger** | Rule 6 |

---

## Supabase Project Details

| Key | Value |
|-----|-------|
| Project ID | `fgmamvzoueenisnuljze` |
| Region | eu-central-1 |
| Org ID | `uktoamrmgldkmygykhbs` |
| Status | ACTIVE_HEALTHY |
