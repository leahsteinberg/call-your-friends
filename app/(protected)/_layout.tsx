import { BRIGHT_BLUE, BRIGHT_GREEN, DARK_BLUE, LIGHT_BEIGE } from "@/styles/styles";
import { Tabs } from "expo-router";
import { Check } from "lucide-react-native";

const Layout = () => {
    return (
        <Tabs
        screenOptions={{
            tabBarActiveTintColor: BRIGHT_BLUE,
            tabBarInactiveTintColor: DARK_BLUE,
            tabBarStyle: {
              backgroundColor: LIGHT_BEIGE,
              borderTopColor: BRIGHT_BLUE,
              borderTopWidth: 4,
              height: 60,
              // Add other ViewStyle properties as needed
            },
            headerShown: false, // Hide the header for all tab screens
          }}
        >
            <Tabs.Screen
                options={{
                    title: 'Home', // Title displayed on the tab label and header
                    tabBarLabel: 'MY FRIENDS', // Custom label for the tab
                    tabBarIcon: ({ color }) => <Check  color={BRIGHT_GREEN} size={23}/>, // Custom icon component
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
                    tabBarIcon: ({ color }) => <Check  color={BRIGHT_GREEN} size={23}/>,
                    tabBarHideOnKeyboard: true,
                }}
            />
            <Tabs.Screen
                name="profile"
                options={{
                    headerShown: false,
                    title: "MY WALKS",
                    tabBarIcon: ({ color }) => <Check  color={BRIGHT_GREEN} size={23}/>,
                    tabBarHideOnKeyboard: true,
                }}
            />

        </Tabs>
    );
};

export default Layout;