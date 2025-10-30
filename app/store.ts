import { combineReducers, configureStore } from '@reduxjs/toolkit';
import { setupListeners } from '@reduxjs/toolkit/query';
import { persistReducer } from 'redux-persist';
import persistStore from 'redux-persist/es/persistStore';
import storage from 'redux-persist/lib/storage'; // defaults to localStorage for web

//import AsyncStorage from '@react-native-community/async-storage';

// Reducers
import authReducer from '../features/Auth/authSlice';
import contactsReducer from '../features/Contacts/contactsSlice';
import meetingReducer from '../features/Meetings/meetingSlice';
import offerReducer from '../features/Offers/offerSlice';

// APIs
import { authApi } from '@/services/authApi';
import { contactsApi } from '@/services/contactsApi';
import { meetingApi } from '@/services/meetingApi';
import { offerApi } from '@/services/offersApi';

const persistConfig = {
  key: 'root',
  storage,
  whitelist: ['auth'],
}


const rootReducer = combineReducers({
  [authApi.reducerPath]: authApi.reducer,
  [contactsApi.reducerPath]: contactsApi.reducer,
  [meetingApi.reducerPath]: meetingApi.reducer,
  [offerApi.reducerPath]: offerApi.reducer,
  auth: authReducer,
  contacts: contactsReducer,
  meeting: meetingReducer,
  offer: offerReducer,
  })

  const persistedReducer = persistReducer(persistConfig, rootReducer);



export const store = configureStore({
  reducer: persistedReducer,
    middleware: (getDefaultMiddleware) => 
      getDefaultMiddleware()
    .concat(authApi.middleware)
    .concat(contactsApi.middleware)
    .concat(meetingApi.middleware)
    .concat(offerApi.middleware)
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