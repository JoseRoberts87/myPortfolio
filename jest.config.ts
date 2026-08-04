import type { Config } from 'jest';
import nextJest from 'next/jest';

const createJestConfig = nextJest({
  // Provide the path to your Next.js app to load next.config.js and .env files in your test environment
  dir: './',
});

// Add any custom config to be passed to Jest
const config: Config = {
  coverageProvider: 'v8',
  testEnvironment: 'jsdom',
  // Add more setup options before each test is run
  setupFilesAfterEnv: ['<rootDir>/jest.setup.ts'],
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
  },
  testMatch: [
    '**/__tests__/**/*.[jt]s?(x)',
    '**/?(*.)+(spec|test).[jt]s?(x)',
  ],
  // Playwright end-to-end specs live in /e2e and must not be run by Jest.
  testPathIgnorePatterns: ['<rootDir>/node_modules/', '<rootDir>/e2e/'],
  collectCoverageFrom: [
    'src/**/*.{js,jsx,ts,tsx}',
    '!src/**/*.d.ts',
    '!src/**/*.stories.{js,jsx,ts,tsx}',
    '!src/**/__tests__/**',
  ],
  // json-summary feeds scripts/coverage-ratchet.mjs (coverage/coverage-summary.json).
  coverageReporters: ['text', 'lcov', 'json-summary'],
  // Enforced coverage floor. DO NOT hand-edit these numbers — they are managed by
  // the ratchet (scripts/coverage-ratchet.mjs): `npm run coverage:ratchet` raises
  // them to just below current coverage, and CI (`coverage:check`) fails if
  // coverage drops below the floor or the floor drifts stale. Ratchet only goes up.
  coverageThreshold: {
    global: {
      statements: 83,
      branches: 83,
      functions: 83,
      lines: 83,
    },
  },
};

// createJestConfig is exported this way to ensure that next/jest can load the Next.js config which is async
export default createJestConfig(config);
