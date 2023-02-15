import type { Config } from 'jest';

const config: Config = {
  verbose: true,
  preset: 'ts-jest',
  setupFilesAfterEnv: ['<rootDir>/jest.setup.ts'],
  moduleFileExtensions: ['ts', 'js'],
  testPathIgnorePatterns: ['node_modules/', 'dist'],
  transform: {
    '^.+\\.ts?$': [
      'ts-jest',
      {
        tsconfig: 'tsconfig.test.json'
      }
    ]
  },
  testMatch: ['**/*.test.(ts)'],
  moduleNameMapper: {
    '\\.(jpg|ico|jpeg|png|gif|eot|otf|webp|svg|ttf|woff|woff2|mp4|webm|wav|mp3|m4a|aac|oga)$':
      'identity-obj-proxy'
  },
  collectCoverage: true,
  collectCoverageFrom: [
    './src/**/*.{js,jsx,ts}',
    '!./src/**/_*.{js,jsx,ts}',
    '!**/*.d.ts',
    '!**/node_modules/**'
  ],
  coverageThreshold: {
    global: {
      branches: 0,
      functions: 0,
      lines: 0,
      statements: 0
    }
  },
  testEnvironment: 'jsdom'
};

export default config;
