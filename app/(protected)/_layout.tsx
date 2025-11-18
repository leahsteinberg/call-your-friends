import { usePushNotifications } from "@/hooks/use-push-notifications";
import { BRIGHT_BLUE, DARK_GREEN, LIGHT_BEIGE } from "@/styles/styles";
import { Tabs } from "expo-router";
import { Footprints, Sticker, TreePalm } from "lucide-react-native";

const ICON_SIZE = 33;

const Layout = () => {
    usePushNotifications();



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