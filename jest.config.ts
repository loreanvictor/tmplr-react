export default {
  preset: 'ts-jest',
  verbose: true,
  clearMocks: true,
  testEnvironment: 'jsdom',
  collectCoverageFrom: [
    'src/**/*.{ts,tsx}',
    '!src/**/*.test.{ts,tsx}',
  ],
}
