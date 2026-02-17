# Task: Add Test Data to TN MANPOWER Project

The objective is to seed the database with a diverse set of test data to demonstrate system functionality, including candidate management, document tracking, alert generation, and blacklist enforcement.

## Data Characteristics
- **Candidates**: 20+ new candidates across all industries and statuses.
- **Diversity**: Mix of ages (18-60), english levels, and gender-neutral names.
- **Edge Cases**:
    - Blacklisted candidate (visited Iran or Syria).
    - Stale candidates (last updated > 7 days ago).
    - Expiring documents (Passport/Visa expiring within 30-90 days).
    - Resolved and unresolved alerts.

## SQL Implementation Plan

### 1. New Candidates
I will insert 20 candidates with randomized but valid data.
The trigger `tr_candidates_auto_create_docs` will automatically create the 4 required documents for each.

### 2. Document Updates
After inserting candidates, I will update some of their documents to simulate:
- Received documents with upcoming expiration dates.
- Expired documents.

### 3. Alerts
I will manually insert some alerts to show they appear in the dashboard and alerts page.

### 4. Audit Logs
The trigger `tr_candidates_audit_insert` will automatically handle audit logs for the new candidates.

## Verification
- Check candidate list for diversity.
- Verify alerts are visible.
- Check blacklist status for specific candidates.
