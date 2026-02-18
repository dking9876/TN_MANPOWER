import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { candidateFormSchema } from './candidate-schema';
import { subYears, format } from 'date-fns';

describe('candidateFormSchema — Extended Tests (Phase 3)', () => {
    beforeEach(() => {
        vi.useFakeTimers();
        vi.setSystemTime(new Date('2024-05-20'));
    });

    afterEach(() => {
        vi.useRealTimers();
    });

    const validData = {
        first_name: "John",
        last_name: "Doe",
        national_id: "ID12345",
        passport_number: "PASS12345",
        date_of_birth: format(subYears(new Date('2024-05-20'), 25), 'yyyy-MM-dd'),
        primary_phone: "123456789",
        emergency_phone: "987654321",
        primary_industry: "NURSING",
        profession: "Nurse",
        english_level: "GOOD",
        has_visited_other: false,
    };

    // --- Missing required fields ---

    it('fails if last_name is missing', () => {
        const { last_name, ...noLastName } = validData;
        const result = candidateFormSchema.safeParse(noLastName);
        expect(result.success).toBe(false);
    });

    it('fails if passport_number is missing', () => {
        const { passport_number, ...noPassport } = validData;
        const result = candidateFormSchema.safeParse(noPassport);
        expect(result.success).toBe(false);
    });

    it('fails if primary_phone is missing', () => {
        const { primary_phone, ...noPhone } = validData;
        const result = candidateFormSchema.safeParse(noPhone);
        expect(result.success).toBe(false);
    });

    it('fails if emergency_phone is missing', () => {
        const { emergency_phone, ...noEmergency } = validData;
        const result = candidateFormSchema.safeParse(noEmergency);
        expect(result.success).toBe(false);
    });

    it('fails if profession is missing', () => {
        const { profession, ...noProfession } = validData;
        const result = candidateFormSchema.safeParse(noProfession);
        expect(result.success).toBe(false);
    });

    // --- Format validation ---

    it('fails if passport_number contains special characters', () => {
        const result = candidateFormSchema.safeParse({
            ...validData,
            passport_number: "PASS-123!",
        });
        expect(result.success).toBe(false);
    });

    it('fails if last_name exceeds 40 characters', () => {
        const result = candidateFormSchema.safeParse({
            ...validData,
            last_name: "a".repeat(41),
        });
        expect(result.success).toBe(false);
    });

    it('fails if english_level is invalid', () => {
        const result = candidateFormSchema.safeParse({
            ...validData,
            english_level: "FLUENT",
        });
        expect(result.success).toBe(false);
    });

    // --- Boundary: exactly 18 ---

    it('passes for candidate exactly 18 years old', () => {
        const exactly18 = format(subYears(new Date('2024-05-20'), 18), 'yyyy-MM-dd');
        const result = candidateFormSchema.safeParse({
            ...validData,
            date_of_birth: exactly18,
        });
        expect(result.success).toBe(true);
    });

    // --- Optional fields ---

    it('accepts null for optional physical fields', () => {
        const result = candidateFormSchema.safeParse({
            ...validData,
            height: null,
            weight: null,
            shoe_size: null,
            pants_size: null,
            allergies: null,
        });
        expect(result.success).toBe(true);
    });

    it('accepts countries_visited as string array', () => {
        const result = candidateFormSchema.safeParse({
            ...validData,
            has_visited_other: true,
            countries_visited: ["USA", "Canada", "Mexico"],
        });
        expect(result.success).toBe(true);
    });

    it('accepts valid positive height and weight', () => {
        const result = candidateFormSchema.safeParse({
            ...validData,
            height: 175.5,
            weight: 80,
        });
        expect(result.success).toBe(true);
    });

    it('accepts all valid recruitment statuses', () => {
        const statuses = [
            'POTENTIAL_CANDIDATE', 'RECRUITMENT_STARTED', 'DOCUMENTS_RECEIVED',
            'SENT_TO_IVS', 'AWAITING_INTERVIEW', 'VISA_APPROVED',
            'HEALTH_INSURANCE_PURCHASED', 'FLIGHT_TICKET_PURCHASED',
            'ARRIVED_IN_ISRAEL', 'CANDIDATE_REJECTED',
        ];

        statuses.forEach((status) => {
            const result = candidateFormSchema.safeParse({
                ...validData,
                recruitment_status: status,
            });
            expect(result.success).toBe(true);
        });
    });

    it('fails for invalid recruitment status', () => {
        const result = candidateFormSchema.safeParse({
            ...validData,
            recruitment_status: 'INVALID_STATUS',
        });
        expect(result.success).toBe(false);
    });

    it('accepts all valid english levels', () => {
        const levels = ['NONE', 'BASIC', 'GOOD', 'EXCELLENT'];
        levels.forEach((level) => {
            const result = candidateFormSchema.safeParse({
                ...validData,
                english_level: level,
            });
            expect(result.success).toBe(true);
        });
    });

    it('accepts all valid industries', () => {
        const industries = ['NURSING', 'CONSTRUCTION', 'INDUSTRY', 'AGRICULTURE', 'COMMERCE', 'HOSPITALITY', 'SERVICES'];
        industries.forEach((industry) => {
            const result = candidateFormSchema.safeParse({
                ...validData,
                primary_industry: industry,
                profession: "General Worker",
            });
            expect(result.success).toBe(true);
        });
    });
});
