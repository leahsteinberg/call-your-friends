import Butterfly from "@/assets/images/butterfly.svg";
import FlowerBlob from "@/assets/images/flower-blob.svg";
import HighFiveStar from "@/assets/images/high-five-star.svg";

import { CustomFonts } from "@/constants/theme";
import { usePushNotifications } from "@/hooks/use-push-notifications";
import { BRIGHT_BLUE, CREAM, DARK_GREEN, PALE_BLUE } from "@/styles/styles";
import { Tabs } from "expo-router";
import { StyleSheet } from "react-native";
const ICON_SIZE = 33;

const Layout = () => {
    usePushNotifications();



    return (
        <Tabs
        screenOptions={{
            tabBarActiveTintColor: BRIGHT_BLUE,
            tabBarInactiveTintColor: DARK_GREEN,
            tabBarStyle: {
              backgroundColor: CREAM,
              borderTopColor: PALE_BLUE,
              borderTopWidth: 5,
              height: 90,
            },
            tabBarLabelStyle: {
                paddingTop: 10,
                fontSize: 15,
                fontFamily: CustomFonts.ztnatureregular,
            },
            headerShown: false,
          }}
        >
            <Tabs.Screen
                name="index"
                options={{
                    headerShown: false,
                    title: "Chats",
                    tabBarIcon: ({ color }) => <HighFiveStar fill={color}/>,
                    tabBarHideOnKeyboard: true,
                }}
            />
            <Tabs.Screen
                name="friends"
                options={{
                    title: 'Friends',
                    tabBarLabel: 'Friends',
                    tabBarIcon: ({ color }) => <FlowerBlob
                        width={ICON_SIZE}
                        height={ICON_SIZE}
                        fill={color}
                    />,
                    headerShown: false,
                    tabBarHideOnKeyboard: true,
                }}
            />
            <Tabs.Screen
                name="settings"
                options={{
                    title: 'Settings',
                    tabBarLabel: 'Settings',
                    tabBarIcon: ({ color }) => <Butterfly
                        width={ICON_SIZE}
                        height={ICON_SIZE}
                        fill={color}
                    />,
                    headerShown: false,
                    tabBarHideOnKeyboard: true,
                }}
            />
  



        </Tabs>
    );
};


const styles = StyleSheet.create({


});

export default Layout;