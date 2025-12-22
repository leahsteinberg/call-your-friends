import { WebLayout } from '@/components/WebLayout';
import { setBroadcastState } from '@/features/Broadcast/broadcastSlice';
import { useIsUserBroadcastingQuery } from '@/services/meetingApi';
import { RootState } from '@/types';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect } from 'react';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { Provider, useDispatch, useSelector } from 'react-redux';
import { PersistGate } from 'redux-persist/integration/react';
import '../global.css';
import { persistor, store } from './store';

// Prevent the splash screen from auto-hiding before font loading completes
SplashScreen.preventAutoHideAsync();


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
                <Stack.Screen name="login" options={{headerShown: false}}/>
                <Stack.Screen name="signup" options={{headerShown: false}}/>
            </Stack.Protected>
    </Stack>
    );
}

export default function RootLayout() {
    const [fontsLoaded, fontError] = useFonts({
        'Catamaran': require('../assets/images/fonts/Catamaran.otf'),
        'ZTNature-bold': require('../assets/images/fonts/ZTNature-Bold.otf'),
        'ZTNature-medium': require('../assets/images/fonts/ZTNature-Medium.otf'),
        'ZTNature-regular': require('../assets/images/fonts/ZTNature-Regular.otf'),
        'ZTNature-light': require('../assets/images/fonts/ZTNature-Light.otf'),
        'ZTNature-lightitalic': require('../assets/images/fonts/ZTNature-LightItalic.otf'),
        'ZTNature-extralight': require('../assets/images/fonts/ZTNature-ExtraLight.otf'),

    });

    useEffect(() => {
        if (fontsLoaded || fontError) {
            // Hide the splash screen once fonts are loaded or if there's an error
            SplashScreen.hideAsync();
        }
    }, [fontsLoaded, fontError]);

    // Don't render the app until fonts are loaded
    if (!fontsLoaded && !fontError) {
        return null;
    }

    return (
        <GestureHandlerRootView style={{ flex: 1 }}>
            <WebLayout>
                <Provider store={store}>
                    <PersistGate loading={null} persistor={persistor}>
                        <InitialLayout/>
                    </PersistGate>
                </Provider>
            </WebLayout>
        </GestureHandlerRootView>
    );
}