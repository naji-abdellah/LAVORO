import { cn, calculateMatchingScore, getStatusColor } from '../utils';

describe('cn (className utility)', () => {
    it('should merge class names', () => {
        expect(cn('class1', 'class2')).toBe('class1 class2');
    });

    it('should handle conditional classes', () => {
        expect(cn('base', true && 'active')).toBe('base active');
        expect(cn('base', false && 'inactive')).toBe('base');
    });

    it('should handle empty inputs', () => {
        expect(cn()).toBe('');
    });

    it('should filter out falsy values', () => {
        expect(cn('class1', null, undefined, 'class2')).toBe('class1 class2');
    });
});

describe('calculateMatchingScore', () => {
    it('should return 0 when no requirements', () => {
        expect(calculateMatchingScore(['JavaScript', 'React'], [])).toBe(0);
    });

    it('should return 100 when all requirements match', () => {
        const skills = ['JavaScript', 'React', 'TypeScript'];
        const requirements = ['JavaScript', 'React'];
        expect(calculateMatchingScore(skills, requirements)).toBe(100);
    });

    it('should return 50 when half requirements match', () => {
        const skills = ['JavaScript'];
        const requirements = ['JavaScript', 'Python'];
        expect(calculateMatchingScore(skills, requirements)).toBe(50);
    });

    it('should return 0 when no requirements match', () => {
        const skills = ['JavaScript', 'React'];
        const requirements = ['Python', 'Django'];
        expect(calculateMatchingScore(skills, requirements)).toBe(0);
    });

    it('should be case-insensitive', () => {
        const skills = ['javascript', 'REACT'];
        const requirements = ['JavaScript', 'React'];
        expect(calculateMatchingScore(skills, requirements)).toBe(100);
    });

    it('should handle partial matches', () => {
        const skills = ['JavaScript Developer'];
        const requirements = ['JavaScript'];
        expect(calculateMatchingScore(skills, requirements)).toBe(100);
    });

    it('should trim whitespace', () => {
        const skills = ['  JavaScript  ', 'React  '];
        const requirements = ['JavaScript', '  React'];
        expect(calculateMatchingScore(skills, requirements)).toBe(100);
    });
});

describe('getStatusColor', () => {
    it('should return correct color for PENDING', () => {
        expect(getStatusColor('PENDING')).toBe('bg-yellow-100 text-yellow-800');
    });

    it('should return correct color for INTERVIEW_SCHEDULED', () => {
        expect(getStatusColor('INTERVIEW_SCHEDULED')).toBe('bg-blue-100 text-blue-800');
    });

    it('should return correct color for ACCEPTED', () => {
        expect(getStatusColor('ACCEPTED')).toBe('bg-green-100 text-green-800');
    });

    it('should return correct color for REJECTED', () => {
        expect(getStatusColor('REJECTED')).toBe('bg-red-100 text-red-800');
    });

    it('should return correct color for ACTIVE', () => {
        expect(getStatusColor('ACTIVE')).toBe('bg-green-100 text-green-800');
    });

    it('should return correct color for CLOSED', () => {
        expect(getStatusColor('CLOSED')).toBe('bg-gray-100 text-gray-800');
    });

    it('should return correct color for SCHEDULED', () => {
        expect(getStatusColor('SCHEDULED')).toBe('bg-blue-100 text-blue-800');
    });

    it('should return correct color for COMPLETED', () => {
        expect(getStatusColor('COMPLETED')).toBe('bg-green-100 text-green-800');
    });

    it('should return correct color for CANCELLED', () => {
        expect(getStatusColor('CANCELLED')).toBe('bg-red-100 text-red-800');
    });

    it('should return default color for unknown status', () => {
        expect(getStatusColor('UNKNOWN')).toBe('bg-gray-100 text-gray-800');
    });
});
