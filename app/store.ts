import AsyncStorage from '@react-native-async-storage/async-storage';
import { combineReducers, configureStore } from '@reduxjs/toolkit';
import { setupListeners } from '@reduxjs/toolkit/query';
import { FLUSH, PAUSE, PERSIST, persistReducer, PURGE, REGISTER, REHYDRATE } from 'redux-persist';
import persistStore from 'redux-persist/es/persistStore';

// Reducers
import broadcastReducer from '@/features/Broadcast/broadcastSlice';
import authReducer from '../features/Auth/authSlice';
import contactsReducer from '../features/Contacts/contactsSlice';
import meetingReducer from '../features/Meetings/meetingSlice';
import userSignalReducer from '../features/Settings/userSignalsSlice';

// APIs
import { authApi } from '@/services/authApi';
import { callLoggingApi } from '@/services/callLoggingApi';
import { contactsApi } from '@/services/contactsApi';
import { meetingApi } from '@/services/meetingApi';
import { notificationApi } from '@/services/notificationApi';
import { offerApi } from '@/services/offersApi';
import { profileApi } from '@/services/profileApi';
import { userSignalsApi } from '@/services/userSignalsApi';

const persistConfig = {
  key: 'root',
  storage: AsyncStorage,
  whitelist: ['auth', 'broadcast'],
}


const rootReducer = combineReducers({
  [authApi.reducerPath]: authApi.reducer,
  [callLoggingApi.reducerPath]: callLoggingApi.reducer,
  [contactsApi.reducerPath]: contactsApi.reducer,
  [meetingApi.reducerPath]: meetingApi.reducer,
  [offerApi.reducerPath]: offerApi.reducer,
  [notificationApi.reducerPath]: notificationApi.reducer,
  [profileApi.reducerPath]: profileApi.reducer,
  [userSignalsApi.reducerPath]: userSignalsApi.reducer,
  auth: authReducer,
  broadcast: broadcastReducer,
  contacts: contactsReducer,
  meeting: meetingReducer,
  userSignal: userSignalReducer,
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
    .concat(callLoggingApi.middleware)
    .concat(contactsApi.middleware)
    .concat(meetingApi.middleware)
    .concat(offerApi.middleware)
    .concat(notificationApi.middleware)
    .concat(profileApi.middleware)
    .concat(userSignalsApi.middleware)
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

setupListeners(store.dispatch);

export const persistor = persistStore(store);
