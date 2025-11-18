import AsyncStorage from '@react-native-async-storage/async-storage';
import { combineReducers, configureStore } from '@reduxjs/toolkit';
import { setupListeners } from '@reduxjs/toolkit/query';
import { FLUSH, PAUSE, PERSIST, PURGE, REGISTER, REHYDRATE } from 'redux-persist';
import { persistReducer } from 'redux-persist';
import persistStore from 'redux-persist/es/persistStore';

// Reducers
import authReducer from '../features/Auth/authSlice';
import contactsReducer from '../features/Contacts/contactsSlice';
import meetingReducer from '../features/Meetings/meetingSlice';
import offerReducer from '../features/Offers/offerSlice';

// APIs
import { authApi } from '@/services/authApi';
import { contactsApi } from '@/services/contactsApi';
import { meetingApi } from '@/services/meetingApi';
import { notificationApi } from '@/services/notificationApi';
import { offerApi } from '@/services/offersApi';

const persistConfig = {
  key: 'root',
  storage: AsyncStorage,
  whitelist: ['auth'],
}


const rootReducer = combineReducers({
  [authApi.reducerPath]: authApi.reducer,
  [contactsApi.reducerPath]: contactsApi.reducer,
  [meetingApi.reducerPath]: meetingApi.reducer,
  [offerApi.reducerPath]: offerApi.reducer,
  [notificationApi.reducerPath]: notificationApi.reducer,
  auth: authReducer,
  contacts: contactsReducer,
  meeting: meetingReducer,
  offer: offerReducer,
  })

  const persistedReducer = persistReducer(persistConfig, rootReducer);



export const store = configureStore({
  reducer: persistedReducer,
    middleware: (getDefaultMiddleware) =>
      getDefaultMiddleware({
        serializableCheck: {
          ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER],
        },
      })
    .concat(authApi.middleware)
    .concat(contactsApi.middleware)
    .concat(meetingApi.middleware)
    .concat(offerApi.middleware)
    .concat(notificationApi.middleware)
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

setupListeners(store.dispatch);

export const persistor = persistStore(store);

// export type AppThunk<ReturnType = void> = ThunkAction<
//   ReturnType,
//   RootState,
//   unknown,
//   Action<string>
// >;