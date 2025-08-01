module.exports = {
  testEnvironment: 'node',
  testMatch: ['**/__tests__/**/*.unit.test.ts'],
  transform: {
    '^.+\\.ts$': ['ts-jest', {}]
  },
  moduleFileExtensions: ['ts', 'js'],
  collectCoverageFrom: [
    'src/**/*.{ts,js}',
    '!src/**/*.test.{ts,js}',
  ],
}; 