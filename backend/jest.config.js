/** @type {import('jest').Config} */
export default {
  testEnvironment: 'node',
  transform: {},
  moduleFileExtensions: ['js', 'mjs'],
  testMatch: ['**/*.test.js'],
  coveragePathIgnorePatterns: ['/node_modules/', '/src/server.js'],
  collectCoverageFrom: ['src/**/*.js', '!src/**/*.test.js'],
  testTimeout: 10000,
  setupFilesAfterEnv: ['<rootDir>/tests/setup.js']
};
