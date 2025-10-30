import { WebLayout } from '@/components/WebLayout';
import { Stack } from 'expo-router';
import { Provider, useSelector } from 'react-redux';
import { PersistGate } from 'redux-persist/integration/react';
import '../global.css';
import { persistor, store } from './store';




const InitialLayout = () => {
 const isAuthenticated = useSelector((state)=> state.auth.isAuthenticated);
  return (
    <Stack>
            <Stack.Protected guard={isAuthenticated}>
                <Stack.Screen name="(protected)" options={{headerShown: false}}/>
            </Stack.Protected>
            <Stack.Protected guard={!isAuthenticated}>
                <Stack.Screen name="index" options={{headerShown: false}}/>
                <Stack.Screen name="invite" options={{headerShown: false}}/>
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