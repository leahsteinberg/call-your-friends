import { WebLayout } from '@/components/WebLayout';
import { setBroadcastState } from '@/features/Broadcast/broadcastSlice';
import { useIsUserBroadcastingQuery } from '@/services/meetingApi';
import { RootState } from '@/types';
import { Stack } from 'expo-router';
import { useEffect } from 'react';
import { Provider, useDispatch, useSelector } from 'react-redux';
import { PersistGate } from 'redux-persist/integration/react';
import '../global.css';
import { persistor, store } from './store';


const InitialLayout = () => {
 const dispatch = useDispatch();
 const isAuthenticated = useSelector((state: RootState)=> state.auth.isAuthenticated);
 const userId = useSelector((state: RootState)=> state.auth.user.id);

 // Sync broadcast state with backend on app startup
 const { data: broadcastStatus, isSuccess } = useIsUserBroadcastingQuery(
   { userId },
   { skip: !isAuthenticated || !userId }
 );

 useEffect(() => {
   if (isSuccess && broadcastStatus !== undefined) {
     dispatch(setBroadcastState(broadcastStatus.isBroadcasting));
   }
 }, [isSuccess, broadcastStatus, dispatch]);


  return (
    <Stack>
            <Stack.Protected guard={isAuthenticated}>
                <Stack.Screen name="(protected)" options={{headerShown: false}}/>
            </Stack.Protected>
            <Stack.Protected guard={!isAuthenticated}>
                <Stack.Screen name="index" options={{headerShown: false}}/>
                <Stack.Screen name="invite" options={{headerShown: false}}/>
                <Stack.Screen name="signup" options={{headerShown: false}}/>
            </Stack.Protected>
    </Stack>
    );
}

export default function RootLayout() {
    return (
        <WebLayout>
            <Provider store={store}>
            <PersistGate loading={null} persistor={persistor}>
                <InitialLayout/>
            </PersistGate>
            </Provider>
        </WebLayout>
    );
}