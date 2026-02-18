import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { documentFormSchema } from './document-schema';
import { addDays, subDays, format } from 'date-fns';

describe('Phase 4: documentFormSchema', () => {
    beforeEach(() => {
        vi.useFakeTimers();
        vi.setSystemTime(new Date('2024-06-15'));
    });

    afterEach(() => {
        vi.useRealTimers();
    });

    const futureDate = format(addDays(new Date('2024-06-15'), 90), 'yyyy-MM-dd');
    const pastDate = format(subDays(new Date('2024-06-15'), 10), 'yyyy-MM-dd');

    // --- Happy Path ---

    it('validates a received HEALTH_DECLARATION without expiration', () => {
        const result = documentFormSchema.safeParse({
            document_type: 'HEALTH_DECLARATION',
            is_received: true,
            expiration_date: null,
        });
        expect(result.success).toBe(true);
    });

    it('validates a received PASSPORT with future expiration', () => {
        const result = documentFormSchema.safeParse({
            document_type: 'PASSPORT',
            is_received: true,
            expiration_date: futureDate,
        });
        expect(result.success).toBe(true);
    });

    it('validates a received VISA with future expiration', () => {
        const result = documentFormSchema.safeParse({
            document_type: 'VISA',
            is_received: true,
            expiration_date: futureDate,
        });
        expect(result.success).toBe(true);
    });

    it('validates a non-received PASSPORT without expiration', () => {
        const result = documentFormSchema.safeParse({
            document_type: 'PASSPORT',
            is_received: false,
            expiration_date: null,
        });
        expect(result.success).toBe(true);
    });

    it('validates a received POLICE_CLEARANCE without expiration', () => {
        const result = documentFormSchema.safeParse({
            document_type: 'POLICE_CLEARANCE',
            is_received: true,
            expiration_date: null,
        });
        expect(result.success).toBe(true);
    });

    // --- Error Cases ---

    it('fails if received PASSPORT has no expiration date', () => {
        const result = documentFormSchema.safeParse({
            document_type: 'PASSPORT',
            is_received: true,
            expiration_date: null,
        });
        expect(result.success).toBe(false);
        if (!result.success) {
            const expIssue = result.error.issues.find(i => i.path.includes('expiration_date'));
            expect(expIssue).toBeDefined();
            expect(expIssue!.message).toBe('Expiration date is required for this document type');
        }
    });

    it('fails if received VISA has no expiration date', () => {
        const result = documentFormSchema.safeParse({
            document_type: 'VISA',
            is_received: true,
            expiration_date: null,
        });
        expect(result.success).toBe(false);
    });

    it('fails if expiration date is in the past', () => {
        const result = documentFormSchema.safeParse({
            document_type: 'PASSPORT',
            is_received: true,
            expiration_date: pastDate,
        });
        expect(result.success).toBe(false);
        if (!result.success) {
            const expIssue = result.error.issues.find(i => i.path.includes('expiration_date'));
            expect(expIssue).toBeDefined();
        }
    });

    it('fails for invalid document type', () => {
        const result = documentFormSchema.safeParse({
            document_type: 'INVALID_TYPE',
            is_received: false,
        });
        expect(result.success).toBe(false);
    });
});
