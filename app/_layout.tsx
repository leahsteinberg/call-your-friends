import { Stack } from 'expo-router';
import { Provider, useSelector } from 'react-redux';
import { store } from './store';


const InitialLayout = () => {
  const isAuthenticated = useSelector((state)=> state.auth.isAuthenticated);
  return (
   <Stack>
    <Stack.Protected guard={isAuthenticated}>
        <Stack.Screen name="(protected)" options={{headerShown: true}}/>
    </Stack.Protected>
    <Stack.Protected guard={!isAuthenticated}>
        <Stack.Screen name="index" options={{headerShown: true}}/>
    </Stack.Protected>
   </Stack>);
}

export default function RootLayout() {
    return (
        <Provider store={store}>
            <InitialLayout/>
        </Provider>
    );
}