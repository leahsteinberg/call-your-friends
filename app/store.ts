import { authApi } from '@/services/authApi';
import { contactsApi } from '@/services/contactsApi';
import { configureStore } from '@reduxjs/toolkit';
import { setupListeners } from '@reduxjs/toolkit/query';
import authReducer from '../features/Auth/authSlice';
import contactsReducer from '../features/Contacts/contactsSlice';

export const store = configureStore({
  reducer: {
    [authApi.reducerPath]: authApi.reducer,
    [contactsApi.reducerPath]: contactsApi.reducer,
    auth: authReducer,
    contacts: contactsReducer
    },
    middleware: (getDefaultMiddleware) => 
      getDefaultMiddleware().concat(authApi.middleware).concat(contactsApi.middleware),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

setupListeners(store.dispatch);

// export type AppThunk<ReturnType = void> = ThunkAction<
//   ReturnType,
//   RootState,
//   unknown,
//   Action<string>
// >;