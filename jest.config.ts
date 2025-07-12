export default {
  moduleFileExtensions: ['js', 'json', 'ts'],
  rootDir: '.',
  testRegex: '.*\\.spec\\.ts$',
  transform: {
    '^.+\\.(t|j)s$': 'ts-jest',
  },
  coverageDirectory: './coverage',
  testEnvironment: 'node',
  collectCoverage: true,
  collectCoverageFrom: [
    'src/**/*.ts',
    '!src/main.ts',
    '!src/**/dto/*.ts',
    '!src/**/interfaces/*.ts',
  ],
  coveragePathIgnorePatterns: [
    '.*\\.module\\.ts$',
    '.*\\.dto\\.ts$',
    '.*\\.guard\\.ts$',
    '.*\\.decorator\\.ts$',
  ],
};
