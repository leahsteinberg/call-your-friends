// Modern @testing-library/react-native includes matchers by default

// Mock AsyncStorage
jest.mock('@react-native-async-storage/async-storage', () => ({
  setItem: jest.fn(() => Promise.resolve()),
  getItem: jest.fn(() => Promise.resolve(null)),
  removeItem: jest.fn(() => Promise.resolve()),
  clear: jest.fn(() => Promise.resolve()),
}));

// Mock Expo modules
jest.mock('expo-font', () => ({
  loadAsync: jest.fn(() => Promise.resolve()),
  isLoaded: jest.fn(() => true),
}));

jest.mock('expo-haptics', () => ({
  impactAsync: jest.fn(() => Promise.resolve()),
  notificationAsync: jest.fn(() => Promise.resolve()),
  selectionAsync: jest.fn(() => Promise.resolve()),
}));

jest.mock('expo-linking', () => ({
  canOpenURL: jest.fn(() => Promise.resolve(true)),
  openURL: jest.fn(() => Promise.resolve()),
}));

jest.mock('expo-notifications', () => ({
  requestPermissionsAsync: jest.fn(() => Promise.resolve({ status: 'granted' })),
  getPermissionsAsync: jest.fn(() => Promise.resolve({ status: 'granted' })),
  setNotificationHandler: jest.fn(),
}));

// Mock AppState
jest.mock('react-native/Libraries/AppState/AppState', () => ({
  currentState: 'active',
  addEventListener: jest.fn(() => ({
    remove: jest.fn(),
  })),
}));

// Mock Reanimated
jest.mock('react-native-reanimated', () => {
  const Reanimated = require('react-native-reanimated/mock');
  Reanimated.default.call = () => {};
  return Reanimated;
});

// Mock Redux Persist
jest.mock('redux-persist', () => ({
  persistReducer: jest.fn((config, reducer) => reducer),
  persistStore: jest.fn(() => ({})),
  FLUSH: 'FLUSH',
  REHYDRATE: 'REHYDRATE',
  PAUSE: 'PAUSE',
  PERSIST: 'PERSIST',
  PURGE: 'PURGE',
  REGISTER: 'REGISTER',
}));
