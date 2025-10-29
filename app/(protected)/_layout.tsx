import { Tabs } from "expo-router";
import { Check } from "lucide-react-native";

const Layout = () => {
    return (
        <Tabs
        screenOptions={{
            tabBarActiveTintColor: 'purple',
            tabBarInactiveTintColor: 'red',
            tabBarStyle: {
              backgroundColor: 'yellow',
              borderTopColor: 'green',
              height: 90,
              // Add other ViewStyle properties as needed
            },
            headerShown: false, // Hide the header for all tab screens
          }}
        >
            <Tabs.Screen
                options={{
                    title: 'Home', // Title displayed on the tab label and header
                    tabBarLabel: 'friends', // Custom label for the tab
                    tabBarIcon: ({ color }) => <Check  color="green" size={23}/>, // Custom icon component
                    headerShown: false,
                    tabBarHideOnKeyboard: true,
                  }}
                name="index"
            />
            <Tabs.Screen
                name="friendchats"
                options={{
                    headerShown: false,
                    title: "let's talk",
                    tabBarIcon: ({ color }) => <Check  color="green" size={23}/>,
                    tabBarHideOnKeyboard: true,
                }}
            />
        </Tabs>
    );
};

export default Layout;