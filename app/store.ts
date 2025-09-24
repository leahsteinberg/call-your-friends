import counterReducer from '@/features/counter/counterSlice';
import { simpleApi } from '@/services/simpleApi';
import { configureStore } from '@reduxjs/toolkit';
import { setupListeners } from '@reduxjs/toolkit/query';


export const store = configureStore({
  reducer: {
    [simpleApi.reducerPath]: simpleApi.reducer,
    counter: counterReducer
  },
  middleware: (getDefaultMiddleware) => 
    getDefaultMiddleware().concat(simpleApi.middleware)
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

setupListeners(store.dispatch)

// export type AppThunk<ReturnType = void> = ThunkAction<
//   ReturnType,
//   RootState,
//   unknown,
//   Action<string>
// >;