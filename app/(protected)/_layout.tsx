import {
    usePostRegisterPushMutation
} from "@/services/notificationApi";
import { configureNotificationHandler, registerForPushNotificationsAsync, setupNotificationListeners } from "@/services/notificationsService";
import { BRIGHT_BLUE, DARK_GREEN, LIGHT_BEIGE } from "@/styles/styles";
import { Tabs } from "expo-router";
import { Footprints, Sticker, TreePalm } from "lucide-react-native";
import { useEffect, useState } from "react";
import {
    Platform
} from "react-native";
import { useSelector } from "react-redux";
const ICON_SIZE = 33;

const Layout = () => {
    const userId: string = useSelector((state: RootState) => state.auth.user.id);
    const [expoPushToken, setExpoPushToken] = useState<string>('');
    const [postRegisterPushToken] = usePostRegisterPushMutation();
   
     useEffect(() => {
        console.log("Layout private - use effect -- notifs")
   
       if (Platform.OS === 'web') {
           return;
       }
       console.log("configure notif handler (in layout)")
       // Configure notification handler
       configureNotificationHandler();
   
       // Register for push notifications
       registerForPushNotificationsAsync()
         .then(token => {
            console.log("is there at token??", token)
           if (token) {
             setExpoPushToken(token);
             const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
             console.log("aobut to do network call with pushtoken,")
             postRegisterPushToken({pushToken: token, userId, timezone});
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
        <Tabs
        screenOptions={{
            tabBarActiveTintColor: BRIGHT_BLUE,
            tabBarInactiveTintColor: DARK_GREEN,
            tabBarStyle: {
              backgroundColor: LIGHT_BEIGE,
              borderTopColor: BRIGHT_BLUE,
              borderTopWidth: 4,
              height: 90,
            },
            headerShown: false,
          }}
        >
            <Tabs.Screen
                options={{
                    title: 'Home',
                    tabBarLabel: 'MY FRIENDS',
                    tabBarIcon: ({ color }) => <Sticker  color={color} size={ICON_SIZE}/>, // Custom icon component
                    headerShown: false,
                    tabBarHideOnKeyboard: true,
                  }}
                name="index"
            />
            <Tabs.Screen
                name="friendchats"
                options={{
                    headerShown: false,
                    title: "MY CHATS",
                    tabBarIcon: ({ color }) => <TreePalm  color={color} size={ICON_SIZE}/>,
                    tabBarHideOnKeyboard: true,
                }}
            />
            <Tabs.Screen
                name="profile"
                options={{
                    headerShown: false,
                    title: "MY WALKS",
                    tabBarIcon: ({ color }) => <Footprints  color={color} size={ICON_SIZE} />,
                    tabBarHideOnKeyboard: true,
                }}
            />

        </Tabs>
    );
};

export default Layout;