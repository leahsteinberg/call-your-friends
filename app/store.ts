import { authApi } from '@/services/authApi';
import { contactsApi } from '@/services/contactsApi';
import { meetingApi } from '@/services/meetingApi';
import { configureStore } from '@reduxjs/toolkit';
import { setupListeners } from '@reduxjs/toolkit/query';
import authReducer from '../features/Auth/authSlice';
import contactsReducer from '../features/Contacts/contactsSlice';
import meetingReducer from '../features/Meetings/meetingSlice';

export const store = configureStore({
  reducer: {
    [authApi.reducerPath]: authApi.reducer,
    [contactsApi.reducerPath]: contactsApi.reducer,
    [meetingApi.reducerPath]: meetingApi.reducer,
    auth: authReducer,
    contacts: contactsReducer,
    meeting: meetingReducer,
    },
    middleware: (getDefaultMiddleware) => 
      getDefaultMiddleware()
    .concat(authApi.middleware)
    .concat(contactsApi.middleware)
    .concat(meetingApi.middleware),
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