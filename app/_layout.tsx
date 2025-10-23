import { WebLayout } from '@/components/WebLayout';
import { Stack } from 'expo-router';
import { Provider, useSelector } from 'react-redux';
import '../global.css';
import { store } from './store';



const InitialLayout = () => {
 const isAuthenticated = useSelector((state)=> state.auth.isAuthenticated);
// const isAuthenticated = true;
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
                <InitialLayout/>
            </Provider>
        </WebLayout>
    );
}