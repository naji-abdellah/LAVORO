import type { Config } from 'jest';

const config: Config = {
    // Setup file for extended matchers
    setupFilesAfterEnv: ['<rootDir>/jest.setup.ts'],

    // Test environment for React components
    testEnvironment: 'jsdom',

    // Module name mapper for path aliases
    moduleNameMapper: {
        '^@/(.*)$': '<rootDir>/src/$1',
    },

    // Transform TypeScript and TSX files
    transform: {
        '^.+\\.(ts|tsx)$': ['ts-jest', {
            useESM: true,
        }],
    },

    // File extensions to consider
    moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json'],

    // Test file patterns
    testMatch: [
        '**/__tests__/**/*.(test|spec).(ts|tsx)',
        '**/*.(test|spec).(ts|tsx)',
    ],

    // Coverage configuration
    collectCoverageFrom: [
        'src/**/*.{ts,tsx}',
        '!src/**/*.d.ts',
        '!src/**/layout.tsx',
        '!src/app/api/**/*',
    ],

    // Ignore patterns
    testPathIgnorePatterns: [
        '/node_modules/',
        '/.next/',
    ],

    // Transform ignore patterns - don't transform node_modules except specific packages
    transformIgnorePatterns: [
        '/node_modules/(?!(lucide-react|clsx)/)',
    ],
};

export default config;
