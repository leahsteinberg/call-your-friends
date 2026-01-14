module.exports = {
  preset: 'react-native',
  setupFilesAfterEnv: ['<rootDir>/tests/setupTests.ts'],
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json'],
  testMatch: ['<rootDir>/tests/**/*.test.{ts,tsx}'],
  transformIgnorePatterns: [
    'node_modules/(?!(react-native|@react-native|@react-navigation|expo|@expo|@unimodules|react-redux|@reduxjs/toolkit)/)',
  ],
  testPathIgnorePatterns: ['/node_modules/', '/ios/', '/android/'],
  collectCoverageFrom: [
    '**/*.{ts,tsx}',
    '!**/node_modules/**',
    '!**/ios/**',
    '!**/android/**',
    '!**/tests/**',
    '!**/*.config.{js,ts}',
    '!**/coverage/**',
    '!**/.expo/**',
  ],
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/$1',
    '\\.(jpg|jpeg|png|gif|svg)$': '<rootDir>/tests/__mocks__/fileMock.js',
  },
  testEnvironment: 'node',
};
