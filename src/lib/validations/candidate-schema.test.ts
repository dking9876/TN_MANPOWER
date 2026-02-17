import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { candidateFormSchema } from './candidate-schema';
import { subYears, format } from 'date-fns';

describe('candidateFormSchema', () => {
    beforeEach(() => {
        // Tell vitest to use fake timers
        vi.useFakeTimers();
        // Set system time to a fixed date: 2024-05-20
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

    it('validates a correct candidate data', () => {
        const result = candidateFormSchema.safeParse(validData);
        expect(result.success).toBe(true);
    });

    it('fails if candidate is under 18', () => {
        const under18Data = {
            ...validData,
            date_of_birth: format(subYears(new Date('2024-05-20'), 17), 'yyyy-MM-dd'),
        };
        const result = candidateFormSchema.safeParse(under18Data);
        expect(result.success).toBe(false);
        if (!result.success) {
            expect(result.error.issues[0].message).toBe("Candidate must be at least 18 years old");
        }
    });

    it('fails if first_name is longer than 40 characters', () => {
        const longNameData = {
            ...validData,
            first_name: "a".repeat(41),
        };
        const result = candidateFormSchema.safeParse(longNameData);
        expect(result.success).toBe(false);
    });

    it('fails if national_id contains special characters', () => {
        const invalidIdData = {
            ...validData,
            national_id: "ID-123",
        };
        const result = candidateFormSchema.safeParse(invalidIdData);
        expect(result.success).toBe(false);
    });

    it('validates email only if provided', () => {
        const emptyEmailData = { ...validData, email: "" };
        const nullEmailData = { ...validData, email: null };
        const invalidEmailData = { ...validData, email: "not-an-email" };

        expect(candidateFormSchema.safeParse(emptyEmailData).success).toBe(true);
        expect(candidateFormSchema.safeParse(nullEmailData).success).toBe(true);
        expect(candidateFormSchema.safeParse(invalidEmailData).success).toBe(false);
    });

    it('fails if primary_industry is invalid', () => {
        const invalidIndustryData = {
            ...validData,
            primary_industry: "INVALID_INDUSTRY",
        };
        const result = candidateFormSchema.safeParse(invalidIndustryData);
        expect(result.success).toBe(false);
    });
});
