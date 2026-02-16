# T.N MANPOWER - Product Requirements Document
**Foreign Worker Recruitment Management System**

---

## 📋 Document Purpose

This document defines **WHAT** needs to be built and the **REQUIREMENTS** that must be met.

**You have full autonomy to:**
- Design the implementation workflow
- Choose how to break down the work
- Decide conversation structure
- Select implementation patterns and approaches
- Make all technical decisions within the specified tech stack

**This document provides:**
- Business requirements and goals
- Data model and business logic
- User roles and permissions
- UI/UX requirements (what, not how)
- Non-negotiable rules that must be enforced

**Before starting implementation, analyze this document and propose the optimal approach for building this system.**

---

## 🎯 Project Overview

### What We're Building
A web-based CRM system for managing the complete lifecycle of foreign worker recruitment - from initial candidate contact through documentation, visa processing, to arrival in Israel.

### Business Problems to Solve
1. **Documentation errors** → Proactive expiration alerts prevent expired documents
2. **Lost leads** → Automated staleness tracking ensures continuous follow-up
3. **Scattered data** → Centralized system with role-based access
4. **No visibility** → Real-time reporting and analytics

### Success Metrics
- Zero candidates with expired documents at visa interview stage
- No candidate goes >7 days without activity update
- All recruitment data accessible in one place
- Admins have full visibility across all recruiters

### Target Users
- **Recruiters:** 5-10 users, daily active, managing 50-200 candidates each
- **Admins:** 1-2 users, oversight and configuration
- **Desktop-first** workflow (recruiters at desks), basic mobile support nice to have

---

## 🛠 Tech Stack Requirements

### Required Technologies
These are **mandatory** - must use these specific technologies:

**Frontend:**
- Next.js 14+ with TypeScript and React
- Tailwind CSS for styling
- shadcn/ui for base UI components

**Backend/Database:**
- Supabase (PostgreSQL + Auth + Edge Functions)
- Supabase Auth for authentication

**Deployment:**
- Vercel

### Recommended Libraries
These are **suggested** - you can substitute with equivalent alternatives:

- Form handling: react-hook-form + zod (or alternative)
- Data fetching: TanStack Query (or alternative)
- Date handling: date-fns (or alternative)
- Icons: lucide-react (or alternative)
- Charts: recharts (or alternative for dashboard)

### Your Decisions
You choose:
- State management approach (Context, Zustand, Redux, etc.)
- Folder structure and file organization
- Component composition patterns
- API route structure
- Testing framework (if you want tests)
- Any additional libraries needed

---

## 👥 User Roles & Permissions

### Recruiter Role
**Can do:**
- ✅ Create new candidates
- ✅ Edit ANY candidate (not just their own - all candidates in system)
- ✅ View all candidates
- ✅ Manage documents for any candidate
- ✅ Change candidate status
- ✅ View their own alerts/notifications
- ✅ Export data to CSV

**Cannot do:**
- ❌ Access admin settings
- ❌ Manage users
- ❌ See other recruiters' alerts
- ❌ Configure system settings

### Admin Role
**Has all Recruiter permissions PLUS:**
- ✅ View ALL alerts across ALL recruiters ("God Mode")
- ✅ Manage users (create, deactivate, reset passwords)
- ✅ Configure system settings (alert thresholds, dropdown lists)
- ✅ Manage blacklisted countries
- ✅ Access audit logs
- ✅ View advanced analytics/reports across all recruiters

**Critical:** Admins must have complete visibility into all data, not just data they created.

---

## 💾 Database Schema

### users
Links to Supabase Auth for authentication.

```
id                  UUID        Primary Key, links to Supabase auth.users
email              STRING      Unique, required
full_name          STRING      Required
role               ENUM        'ADMIN' or 'RECRUITER', required
is_active          BOOLEAN     Default true
created_at         TIMESTAMP   Auto
last_login         TIMESTAMP   Nullable
```

---

### candidates
Core entity storing all candidate information.

```
id                    UUID        Primary Key
first_name           STRING      Max 40 chars, required
last_name            STRING      Max 40 chars, required
national_id          STRING      Unique, required
passport_number      STRING      Unique, required
date_of_birth        DATE        Required
age                  INTEGER     Auto-calculated from date_of_birth
primary_phone        STRING      Required
emergency_phone      STRING      Required
email                STRING      Optional

height               FLOAT       Optional
weight               FLOAT       Optional
shoe_size            STRING      Optional
pants_size           STRING      Optional
allergies            TEXT        Optional

primary_industry     ENUM        Required (see industry list below)
profession           STRING      Required, must be valid for industry
english_level        ENUM        Required: NONE, BASIC, GOOD, EXCELLENT

has_visited_other    BOOLEAN     Required
countries_visited    ARRAY       Array of strings, optional
is_blacklisted       BOOLEAN     Default false, auto-calculated

recruitment_status   ENUM        Required (see status list below)
created_by           UUID        FK → users.id
last_updated_by      UUID        FK → users.id
created_at           TIMESTAMP   Auto
last_updated_at      TIMESTAMP   Auto-update on any change (critical!)
```

**Recruitment Status Options:**
- POTENTIAL_CANDIDATE
- RECRUITMENT_STARTED
- DOCUMENTS_RECEIVED
- SENT_TO_IVS
- AWAITING_INTERVIEW
- VISA_APPROVED
- HEALTH_INSURANCE_PURCHASED
- FLIGHT_TICKET_PURCHASED
- ARRIVED_IN_ISRAEL
- CANDIDATE_REJECTED

**Industry Options:**
- NURSING
- CONSTRUCTION
- INDUSTRY
- AGRICULTURE
- COMMERCE
- HOSPITALITY
- SERVICES

**Industry → Profession Mapping:**
(Professions must match their industry)
- NURSING: Nurse, Caregiver
- CONSTRUCTION: Plasterer, Mason, Form Worker, Floor Layer, Heavy Equipment Operator
- INDUSTRY: General Worker
- AGRICULTURE: General Worker, Picker
- COMMERCE: Cashier, Sales Associate
- HOSPITALITY: Housekeeper, Kitchen Worker
- SERVICES: General Worker

---

### documents
Tracks document metadata. **No file uploads** - this is metadata only.

```
id                UUID        Primary Key
candidate_id      UUID        FK → candidates.id (cascade delete)
document_type     ENUM        PASSPORT, POLICE_CLEARANCE, HEALTH_DECLARATION, VISA
is_received       BOOLEAN     Default false
expiration_date   DATE        Required for PASSPORT and VISA, optional for others
received_date     DATE        Optional
notes             TEXT        Optional
```

**Business Rule:** Each candidate must have exactly 4 document records (one for each type).

---

### alerts
Stores all active and resolved alerts.

```
id                  UUID        Primary Key
candidate_id        UUID        FK → candidates.id (cascade delete)
assigned_to         UUID        FK → users.id (the recruiter who created candidate)
alert_type          ENUM        STALENESS or DOCUMENT_EXPIRATION
document_type       ENUM        Nullable, only for DOCUMENT_EXPIRATION alerts
alert_message       TEXT        Required
is_resolved         BOOLEAN     Default false
is_acknowledged     BOOLEAN     Default false
resolution_notes    TEXT        Optional
created_at          TIMESTAMP   Auto
resolved_at         TIMESTAMP   Nullable
```

---

### audit_logs
Tracks all changes for accountability.

```
id                UUID        Primary Key
user_id           UUID        FK → users.id
candidate_id      UUID        FK → candidates.id, nullable
action            STRING      CREATE, UPDATE, DELETE, STATUS_CHANGE
changed_fields    JSONB       What fields were modified
old_values        JSONB       Previous values
new_values        JSONB       New values
timestamp         TIMESTAMP   Auto
ip_address        STRING      Optional
```

---

### system_config
Stores system settings.

**You decide the structure:** Single table with JSONB, normalized tables, or hybrid approach.

**Must store:**
- Alert thresholds:
  - Staleness threshold (days)
  - Passport expiration warning (days)
  - Visa expiration warning (days)
  - Police clearance expiration warning (days)
  - Health declaration expiration warning (days)
- Blacklisted countries list
- Profession → Industry mapping (if not hardcoded)

---

## 🎯 Critical Business Logic

These are **NON-NEGOTIABLE** requirements that must be enforced.

### 1. Blacklist Check ⚠️ CRITICAL
**Trigger:** When creating or updating a candidate with `countries_visited` data

**Logic:**
```
IF any country in countries_visited matches a blacklisted country:
  SET is_blacklisted = true
  SET recruitment_status = 'CANDIDATE_REJECTED'
  SHOW warning to user
```

**Implementation:** Your choice (database trigger, application logic, or both), but it MUST be enforced.

---

### 2. Auto-Create Documents ⚠️ CRITICAL
**Trigger:** When a new candidate is created

**Logic:** Create 4 document records (one for each type), all with `is_received = false`

**Implementation:** Your choice (trigger or application), but it MUST happen.

---

### 3. Staleness Alert Generation
**Frequency:** Daily (scheduled job)

**Logic:**
```
FOR each candidate WHERE:
  last_updated_at < (NOW() - staleness_threshold_days)
  AND recruitment_status NOT IN ('ARRIVED_IN_ISRAEL', 'CANDIDATE_REJECTED')
  AND no unresolved staleness alert exists for this candidate

CREATE alert:
  type = STALENESS
  assigned_to = candidate.created_by
  message = "Candidate [Name] has not been updated in [X] days"
```

**Default threshold:** 7 days (must be configurable by admin)

---

### 4. Document Expiration Alert Generation
**Frequency:** Daily (scheduled job)

**Logic:**
```
FOR each document WHERE:
  expiration_date IS NOT NULL
  AND expiration_date < (NOW() + warning_threshold_days)
  AND expiration_date > NOW()
  AND no unresolved expiration alert exists for this document

CREATE alert:
  type = DOCUMENT_EXPIRATION
  document_type = document.type
  assigned_to = candidate.created_by
  message = "[Document Type] for [Candidate Name] expires in [X] days"
```

**Default thresholds (must be configurable by admin):**
- Passport: 90 days
- Visa: 30 days
- Police Clearance: 60 days
- Health Declaration: 60 days

---

### 5. Age Calculation & Validation ⚠️ CRITICAL
- Age must be auto-calculated from date_of_birth
- Age must be >= 18 (validation requirement)
- Implementation: Your choice (trigger, computed column, or application)

---

### 6. Audit Logging
**Requirement:** Log ALL changes to candidates and users

**Must capture:**
- Who made the change (user_id)
- What changed (field names)
- Old and new values
- When it happened (timestamp)

**Implementation:** Your choice (triggers, middleware, or application code)

---

### 7. Last Updated Timestamp ⚠️ CRITICAL
`last_updated_at` must update whenever:
- Any candidate field changes
- Candidate status changes
- User manually clicks "Log Activity" button (updates timestamp without changing data)
- Alert is resolved with "update timestamp" option checked

This timestamp is critical for staleness tracking.

---

## 📱 User Interface Requirements

### General Principles
**Must have:**
- Professional, business-oriented design
- Clean visual hierarchy
- Desktop-first (should work on tablets, full mobile optional)
- Loading states for all async operations
- Error states with clear messages
- Success confirmations for important actions
- Empty states when lists are empty

**Design freedom:**
- You choose colors, exact layouts, spacing
- You choose component patterns
- You choose navigation structure
- Just make it professional and usable

---

### Required Features by Area

#### Authentication
**Login page must have:**
- Email and password inputs
- Login button with loading state
- Error messages for failed login
- Redirect to dashboard on success

**Session requirements:**
- Session timeout after 2 hours of inactivity
- Lock account after 5 failed login attempts (admin must unlock)

---

#### Dashboard (Post-Login Landing)
**Must show:**
- Welcome message with user name
- Key metrics:
  - Total candidates
  - Breakdown by status
  - Unresolved alerts count
- Quick actions/shortcuts to common tasks

**For admins:**
- Metrics across ALL recruiters
- System-wide statistics

**Implementation:** You decide layout, exact metrics, visualization

---

#### Candidate Management
**List/Search page must have:**
- Search functionality (by name, passport number, or national ID)
- Filters:
  - Status (multi-select)
  - Industry (multi-select)
  - Recruiter (admin only, multi-select)
  - Blacklist status (checkbox)
- Table/list view showing:
  - Name
  - National ID
  - Passport Number
  - Age
  - Industry
  - Profession
  - Status (with visual indicator)
  - Blacklist indicator (if applicable)
  - Actions (view/edit/delete)
- Pagination (25-50 items per page)
- Add new candidate button
- Export to CSV button

**Candidate form (add/edit) must include:**

*Personal Information:*
- First Name* (required, max 40 chars)
- Last Name* (required, max 40 chars)
- National ID* (unique)
- Passport Number* (unique)
- Date of Birth* (age must be >= 18)
- Primary Phone*
- Emergency Phone*
- Email (optional)

*Physical Characteristics (all optional):*
- Height
- Weight
- Shoe Size
- Pants Size
- Allergies (text area)

*Professional:*
- Industry* (dropdown, required)
- Profession* (dropdown filtered by industry, required)
- English Level* (dropdown, required)

*Background Check:*
- Has visited other countries? (checkbox)
- If yes: Countries visited (multi-select or tags input)

**Behavior:**
- Real-time validation on all fields
- Show calculated age from DOB
- If blacklisted country selected → show warning
- On save → run blacklist check
- For new candidates → auto-create 4 document records

**Candidate detail view must show:**
- All candidate information
- Status with visual indicator
- Blacklist status (if applicable)
- Created by / at
- Last updated by / at
- Document section (see below)
- Actions: Edit, Delete (with confirmation), Change Status, "Log Activity" button

---

#### Document Management
**In candidate detail view, must show all 4 documents with:**
- Document type
- Received status (yes/no)
- Expiration date (if applicable)
- Visual indicator:
  - Not received (gray or neutral)
  - Received but no expiration (if required → warning)
  - Expiring soon (based on threshold → warning)
  - Expired (error state)
  - Valid (success state)
- Notes field
- Actions:
  - Mark as received / unreceived
  - Add/edit expiration date
  - Add/edit notes

**Validation:**
- Expiration date required for PASSPORT and VISA when marking as received
- Expiration date must be future date

---

#### Alerts System
**Alerts page must have:**
- List of alerts showing:
  - Alert icon/badge (color-coded by type)
  - Alert message
  - Candidate name (clickable → candidate detail)
  - Created date/time
  - Status (resolved/unresolved)
  - Actions: Resolve button (if unresolved)
- Filters:
  - Alert type (all / staleness / expiration)
  - Status (all / unresolved / resolved)
  - Date range
  - Search by candidate name
- Badge showing count of unresolved alerts (display in navigation)

**Resolve alert flow:**
- Resolution notes (required, text area)
- Checkbox: "Update candidate last_updated_at" (checked by default)
- Confirm/Cancel buttons
- On confirm: Mark as resolved, save notes, optionally update timestamp

---

#### Admin: User Management
**User management page must have:**
- List of users showing:
  - Email
  - Full Name
  - Role
  - Active Status
  - Last Login
  - Created Date
  - Actions: Edit, Reset Password, Activate/Deactivate
- Add new user button
- Filters: Role, Status

**Add/Edit user form:**
- Email* (unique, required)
- Full Name* (required)
- Role* (Admin/Recruiter dropdown)
- Initial Password* (new users only)
- Password requirements display
- Password strength indicator

**Reset password functionality:**
- Show user email
- Generate random password button OR manual entry
- Copy password button
- Password must meet requirements: min 8 chars, 1 uppercase, 1 lowercase, 1 number

---

#### Admin: System Settings
**Must have:**
- Alert threshold configuration:
  - Staleness threshold (days input)
  - Passport expiration warning (days input)
  - Visa expiration warning (days input)
  - Police clearance expiration warning (days input)
  - Health declaration expiration warning (days input)
  - Save button
  - Display "Last updated by [name] on [date]"

- Blacklisted countries management:
  - List all countries
  - Checkbox for each to blacklist/unblacklist
  - Visual indicator for blacklisted
  - Show count of affected active candidates
  - Save button

**Implementation:** You decide if these are tabs, separate pages, or single page with sections

---

#### Admin: Reports & Analytics
**Must have:**
- Filters:
  - Date range (created/updated/completed dates)
  - Status (multi-select)
  - Industry (multi-select)
  - Recruiter (multi-select)
  - Apply filters button

- Visualizations (you choose chart types):
  - Candidates by status
  - Candidates by industry
  - Recruitment timeline (over time)
  - Top recruiters by activity (admin only)

- Data table:
  - Filtered results
  - Export to CSV button (respects filters)

---

## ✅ Validation Rules

### Candidate Fields
- `first_name`, `last_name`: Required, max 40 chars, alphanumeric + spaces
- `national_id`: Required, unique across system, alphanumeric
- `passport_number`: Required, unique across system, alphanumeric
- `date_of_birth`: Required, valid date, must result in age >= 18
- `primary_phone`, `emergency_phone`: Required, valid phone format
- `email`: Optional, must be valid email format if provided
- `height`, `weight`: Optional, positive numbers only
- `english_level`: Required, must be one of: NONE, BASIC, GOOD, EXCELLENT
- `primary_industry`: Required, must be valid industry
- `profession`: Required, must be valid for selected industry

### User Fields
- `email`: Required, unique, valid email format
- `full_name`: Required, minimum 2 characters
- `password`: Minimum 8 characters, must contain 1 uppercase, 1 lowercase, 1 number
- `role`: Required, must be ADMIN or RECRUITER

### Document Fields
- `expiration_date`: Required for PASSPORT and VISA types when marking as received
- `expiration_date`: Must be future date when provided

### Security
- XSS protection on all inputs
- SQL injection prevention (parameterized queries)
- CSRF protection
- HTTPS only in production
- Row Level Security (RLS) in Supabase for data access control

---

## 📊 CSV Export Specification

**Filename format:** `TN_Manpower_Export_{YYYY-MM-DD}_{HH-mm}.csv`

**Must include these columns:**
First Name, Last Name, National ID, Passport Number, Date of Birth, Age, Primary Phone, Emergency Phone, Email, Height, Weight, English Level, Industry, Profession, Recruitment Status, Has Visited Other Countries, Countries Visited, Is Blacklisted, Passport Received, Passport Expiration, Police Clearance Received, Police Clearance Expiration, Health Declaration Received, Health Declaration Expiration, Visa Received, Visa Expiration, Created By, Created At, Last Updated By, Last Updated At

**Requirements:**
- Must respect current filters (only export filtered/visible data)
- UTF-8 encoding
- Properly quote text fields containing commas
- Timestamp in filename for uniqueness

---

## 🎓 Initial Seed Data

**Admin user:**
```
Email: admin@tnmanpower.com
Password: Admin123!
Full Name: System Administrator
Role: ADMIN
```

**System config (default values):**
```
Staleness threshold: 7 days
Passport expiration warning: 90 days
Visa expiration warning: 30 days
Police clearance expiration warning: 60 days
Health declaration expiration warning: 60 days
```

**You decide:**
- What countries to seed
- Which (if any) to mark as blacklisted
- Whether to add sample candidate data for testing

---

## ⚠️ Critical Rules (Non-Negotiable)

These 9 rules MUST be enforced. Everything else is flexible.

1. ✅ **Blacklist check must auto-reject** - Candidates visiting blacklisted countries automatically set to CANDIDATE_REJECTED with is_blacklisted = true
2. ✅ **4 documents must auto-create** - Every new candidate gets 4 document records (one per type)
3. ✅ **Age validation must enforce 18+** - Cannot create candidate under 18 years old
4. ✅ **Unique constraints enforced** - national_id and passport_number must be unique
5. ✅ **All changes must be logged** - Audit logs capture all candidate and user modifications
6. ✅ **last_updated_at must update** - Whenever candidate is edited (any field change or status change)
7. ✅ **Recruiters can edit any candidate** - Not restricted to candidates they created
8. ✅ **Admins see all data** - Complete visibility across all recruiters' candidates and alerts
9. ✅ **Alerts assigned to creator** - Alerts go to the recruiter who created the candidate

---

## 💡 Suggested Implementation Areas

These are **suggestions** to help you think about the work. You can reorganize these however makes sense.

**Foundation:**
- Project setup & configuration
- Database schema & triggers
- Authentication system

**Core Features:**
- Candidate CRUD operations
- Document tracking
- Alert generation system

**Admin Features:**
- User management
- System configuration
- Reports & analytics

**Polish:**
- Error handling & loading states
- UI/UX refinements
- Testing & verification
- Deployment

**You are free to reorganize, combine, or split these areas differently based on your analysis.**

---

## 📚 Environment & Deployment

**Required environment variables:**
```
NEXT_PUBLIC_SUPABASE_URL=<your_supabase_project_url>
NEXT_PUBLIC_SUPABASE_ANON_KEY=<your_supabase_anon_key>
SUPABASE_SERVICE_ROLE_KEY=<your_service_role_key>
```

**Deployment target:** Vercel (must support Next.js 14+ app router)


## 🤝 Working Together

### When to Ask Questions
- ❓ Requirements are unclear or contradictory
- ❓ You need specific data or credentials
- ❓ You see a better approach than what's documented
- ❓ You encounter conflicts between requirements
- ❓ Business logic needs clarification
- ❓ You need me to make a decision

### What I Expect
- 🎯 All functional requirements met
- 🎯 All critical rules enforced
- 🎯 All validation rules implemented
- 🎯 Professional, usable UI
- 🎯 Clear communication about your approach
- 🎯 Questions when something is unclear

### What You Have Freedom Over
- 🎨 Exact UI design (colors, layouts, spacing)
- 📁 File structure and organization
- 🧩 Component architecture
- 🛠️ Implementation patterns
- ⚡ Performance optimizations
- 📚 Additional helpful features
- 🧪 Testing approach

---

## 🚀 Next Steps

**Analyze this PRD and propose:**
1. **Your recommended approach** for building this system
2. **How you want to structure the work** (phases, features, iterations?)
3. **How we should collaborate** (conversations, checkpoints, reviews?)
4. **What files/artifacts you'll create** for tracking progress
5. **Questions you have** about the requirements
6. **Technical decisions** you need me to make upfront
7. **Your implementation plan**

**Don't start coding yet** - let's align on approach first.

---

**END OF REQUIREMENTS**
