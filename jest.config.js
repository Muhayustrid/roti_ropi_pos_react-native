module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  testMatch: ['**/__tests__/**/*.test.ts', '**/__tests__/**/*.test.tsx'],
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
    '^react-native$': '<rootDir>/src/__mocks__/react-native.ts',
    '^expo-router$': '<rootDir>/src/__mocks__/expo-router.ts',
    '^expo-status-bar$': '<rootDir>/src/__mocks__/expo-status-bar.ts',
    '^@expo/vector-icons/MaterialIcons$': '<rootDir>/src/__mocks__/@expo/vector-icons.ts',
    '^@expo/vector-icons$': '<rootDir>/src/__mocks__/@expo/vector-icons.ts',
  },
  transform: {
    '^.+\\.tsx?$': ['ts-jest', {
      tsconfig: {
        jsx: 'react-jsx',
        module: 'commonjs',
      }
    }],
  },
};
