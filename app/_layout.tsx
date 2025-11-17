import { WebLayout } from '@/components/WebLayout';
import { configureNotificationHandler, registerForPushNotificationsAsync, setupNotificationListeners } from '@/services/notificationsService';
import { RootState } from '@/types';
import { Stack } from 'expo-router';
import { useEffect, useState } from 'react';
import { Platform } from 'react-native';
import { Provider, useSelector } from 'react-redux';
import { PersistGate } from 'redux-persist/integration/react';
import '../global.css';
import { persistor, store } from './store';


const InitialLayout = () => {
 const isAuthenticated = useSelector((state: RootState)=> state.auth.isAuthenticated);
 const [expoPushToken, setExpoPushToken] = useState<string>('');

  useEffect(() => {
    console.log("In LAYOUT   TTT")

    if (Platform.OS === 'android' || Platform.OS === 'ios') {
        return;
    }
    console.log("DOING NOTIFS!!")
    // Configure notification handler
    configureNotificationHandler();

    // Register for push notifications

    registerForPushNotificationsAsync()
      .then(token => {
        if (token) {
          setExpoPushToken(token);
          console.log('Successfully registered for push notifications:', token);
        }
      })
      .catch((error: any) => {
        console.error('Failed to register for push notifications:', error);
      });

    // Setup notification listeners
    const cleanup = setupNotificationListeners(
      (notification) => {
        console.log('Notification received:', notification);
      },
      (response) => {
        console.log('Notification response:', response);
      }
    );
    return cleanup;
  }, []);

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