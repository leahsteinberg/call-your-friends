import { ReactElement } from 'react';
import { render, RenderOptions } from '@testing-library/react-native';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import { store as appStore } from '@/app/store';

/**
 * Custom render function that wraps components with Redux Provider
 * and other necessary providers for testing
 */
export function renderWithProviders(
  ui: ReactElement,
  {
    preloadedState = {},
    store = appStore,
    ...renderOptions
  }: {
    preloadedState?: any;
    store?: typeof appStore;
  } & Omit<RenderOptions, 'wrapper'> = {}
) {
  function Wrapper({ children }: { children: React.ReactNode }) {
    return <Provider store={store}>{children}</Provider>;
  }

  return { store, ...render(ui, { wrapper: Wrapper, ...renderOptions }) };
}

/**
 * Creates a mock store for testing Redux-connected components
 */
export function createMockStore(preloadedState = {}) {
  return configureStore({
    reducer: appStore.getState,
    preloadedState,
    middleware: (getDefaultMiddleware) =>
      getDefaultMiddleware({
        serializableCheck: false,
      }),
  });
}

// Re-export everything from React Native Testing Library
export * from '@testing-library/react-native';
