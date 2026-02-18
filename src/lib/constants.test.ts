import { describe, it, expect } from 'vitest';
import {
    INDUSTRIES,
    INDUSTRY_PROFESSIONS,
    ENGLISH_LEVELS,
    RECRUITMENT_STATUS,
    STATUS_COLORS,
    DOCUMENT_TYPES,
    ALERT_TYPES,
} from './constants';

describe('Phase 1: Constants Integrity', () => {
    describe('INDUSTRIES', () => {
        it('should have 7 industry categories', () => {
            expect(Object.keys(INDUSTRIES)).toHaveLength(7);
        });

        it('should contain all required industries', () => {
            const expected = ['NURSING', 'CONSTRUCTION', 'INDUSTRY', 'AGRICULTURE', 'COMMERCE', 'HOSPITALITY', 'SERVICES'];
            expect(Object.keys(INDUSTRIES)).toEqual(expect.arrayContaining(expected));
        });
    });

    describe('INDUSTRY_PROFESSIONS', () => {
        it('should have a profession array for every industry', () => {
            Object.keys(INDUSTRIES).forEach((industry) => {
                expect(INDUSTRY_PROFESSIONS[industry as keyof typeof INDUSTRIES]).toBeDefined();
                expect(INDUSTRY_PROFESSIONS[industry as keyof typeof INDUSTRIES].length).toBeGreaterThan(0);
            });
        });

        it('should have correct professions for NURSING', () => {
            expect(INDUSTRY_PROFESSIONS.NURSING).toEqual(['Nurse', 'Caregiver']);
        });

        it('should have correct professions for CONSTRUCTION', () => {
            expect(INDUSTRY_PROFESSIONS.CONSTRUCTION).toEqual([
                'Plasterer', 'Mason', 'Form Worker', 'Floor Layer', 'Heavy Equipment Operator',
            ]);
        });
    });

    describe('ENGLISH_LEVELS', () => {
        it('should have 4 levels', () => {
            expect(Object.keys(ENGLISH_LEVELS)).toHaveLength(4);
        });

        it('should contain NONE, BASIC, GOOD, EXCELLENT', () => {
            expect(Object.keys(ENGLISH_LEVELS)).toEqual(['NONE', 'BASIC', 'GOOD', 'EXCELLENT']);
        });
    });

    describe('RECRUITMENT_STATUS', () => {
        it('should have 10 status options', () => {
            expect(Object.keys(RECRUITMENT_STATUS)).toHaveLength(10);
        });

        it('should include terminal statuses', () => {
            expect(RECRUITMENT_STATUS).toHaveProperty('ARRIVED_IN_ISRAEL');
            expect(RECRUITMENT_STATUS).toHaveProperty('CANDIDATE_REJECTED');
        });
    });

    describe('STATUS_COLORS', () => {
        it('should have a color class for every recruitment status', () => {
            Object.keys(RECRUITMENT_STATUS).forEach((status) => {
                expect(STATUS_COLORS[status as keyof typeof RECRUITMENT_STATUS]).toBeDefined();
                expect(STATUS_COLORS[status as keyof typeof RECRUITMENT_STATUS]).toContain('bg-');
            });
        });
    });

    describe('DOCUMENT_TYPES', () => {
        it('should have exactly 4 document types', () => {
            expect(Object.keys(DOCUMENT_TYPES)).toHaveLength(4);
        });

        it('should contain PASSPORT, POLICE_CLEARANCE, HEALTH_DECLARATION, VISA', () => {
            expect(Object.keys(DOCUMENT_TYPES)).toEqual([
                'PASSPORT', 'POLICE_CLEARANCE', 'HEALTH_DECLARATION', 'VISA',
            ]);
        });
    });

    describe('ALERT_TYPES', () => {
        it('should have exactly 2 alert types', () => {
            expect(Object.keys(ALERT_TYPES)).toHaveLength(2);
        });

        it('should contain STALENESS and DOCUMENT_EXPIRATION', () => {
            expect(ALERT_TYPES).toEqual({
                STALENESS: 'Staleness',
                DOCUMENT_EXPIRATION: 'Document Expiration',
            });
        });
    });
});
