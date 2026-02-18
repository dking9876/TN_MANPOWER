import { describe, it, expect } from 'vitest';
import { alertResolutionSchema } from './alert-schema';

describe('Phase 4: alertResolutionSchema', () => {
    it('validates valid resolution data', () => {
        const result = alertResolutionSchema.safeParse({
            resolution_notes: 'Fixed document issue and updated candidate',
            update_last_updated_at: true,
        });
        expect(result.success).toBe(true);
    });

    it('validates resolution with update_last_updated_at = false', () => {
        const result = alertResolutionSchema.safeParse({
            resolution_notes: 'Acknowledged but no candidate update needed',
            update_last_updated_at: false,
        });
        expect(result.success).toBe(true);
    });

    it('fails if resolution_notes is empty', () => {
        const result = alertResolutionSchema.safeParse({
            resolution_notes: '',
            update_last_updated_at: true,
        });
        expect(result.success).toBe(false);
        if (!result.success) {
            expect(result.error.issues[0].message).toBe('Resolution notes are required');
        }
    });

    it('fails if resolution_notes is missing', () => {
        const result = alertResolutionSchema.safeParse({
            update_last_updated_at: true,
        });
        expect(result.success).toBe(false);
    });

    it('fails if update_last_updated_at is missing', () => {
        const result = alertResolutionSchema.safeParse({
            resolution_notes: 'Some notes',
        });
        expect(result.success).toBe(false);
    });
});
