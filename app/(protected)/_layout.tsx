import Butterfly from "@/assets/images/butterfly.svg";
import FlowerBlob from "@/assets/images/flower-blob.svg";
import HighFiveStar from "@/assets/images/high-five-star.svg";

import { CustomFonts } from "@/constants/theme";
import { usePushNotifications } from "@/hooks/use-push-notifications";
import { BRIGHT_BLUE, DARK_GREEN, LIGHT_BURGUNDY, PALE_BLUE } from "@/styles/styles";
import { Tabs } from "expo-router";
import React from "react";
import { StyleSheet, Text, View } from "react-native";

const ICON_SIZE = 33;
const CIRCLE_SIZE = 70;

// Custom tab label that "pops" when selected
function TabLabel({ label, focused }: { label: string; focused: boolean }) {
    return (
        <Text
            style={[
                styles.tabLabel,
                focused && styles.tabLabelFocused
            ]}
        >
            {label}
        </Text>
    );
}

// Icon wrapper with animated circle background
function TabIconWithCircle({
    Icon,
    focused,
    color,
    width = ICON_SIZE,
    height = ICON_SIZE
}: {
    Icon: any;
    focused: boolean;
    color: string;
    width?: number;
    height?: number;
}) {


    return (
        <View style={styles.iconWrapper}>
            <Icon width={width} height={height} fill={color} />
        </View>
    );
}

const Layout = () => {
    usePushNotifications();



    return (
        <Tabs
        screenOptions={{
            tabBarActiveTintColor: BRIGHT_BLUE,
            tabBarInactiveTintColor: DARK_GREEN,
            tabBarStyle: {
              backgroundColor: LIGHT_BURGUNDY,
              borderTopColor: 'transparent',
              borderTopWidth: 0,
              height: 80,
              position: 'absolute',
              marginHorizontal: 15,
              bottom: 20,
              left: 20,
              right: 20,
              borderRadius: 40,
              paddingBottom: 10,
              paddingTop: 10,
              shadowColor: '#000',
              shadowOffset: {
                width: 0,
                height: 4,
              },
              shadowOpacity: 0.3,
              shadowRadius: 8,
              elevation: 10,
              overflow: 'visible',
            },
            headerShown: false,
          }}
        >
            <Tabs.Screen
                name="friends"
                options={{
                    title: 'Friends',
                    tabBarLabel: ({ focused }) => (
                        <TabLabel label="Friends" focused={focused} />
                    ),
                    tabBarIcon: ({ color, focused }) => (
                        <TabIconWithCircle
                            Icon={FlowerBlob}
                            focused={focused}
                            color={color}
                        />
                    ),
                    headerShown: false,
                    tabBarHideOnKeyboard: true,
                }}
            />
            <Tabs.Screen
                name="index"
                options={{
                    headerShown: false,
                    title: "Chats",
                    tabBarLabel: ({ focused }) => (
                        <TabLabel label="Chats" focused={focused} />
                    ),
                    tabBarIcon: ({ color, focused }) => (
                        <TabIconWithCircle
                            Icon={HighFiveStar}
                            focused={focused}
                            color={color}
                        />
                    ),
                    tabBarHideOnKeyboard: true,
                }}
            />
            <Tabs.Screen
                name="settings"
                options={{
                    title: 'Settings',
                    tabBarLabel: ({ focused }) => (
                        <TabLabel label="Settings" focused={focused} />
                    ),
                    tabBarIcon: ({ color, focused }) => (
                        <TabIconWithCircle
                            Icon={Butterfly}
                            focused={focused}
                            color={color}
                        />
                    ),
                    headerShown: false,
                    tabBarHideOnKeyboard: true,
                }}
            />
  



        </Tabs>
    );
};


const styles = StyleSheet.create({
    iconWrapper: {
        alignItems: 'center',
        justifyContent: 'center',
        width: CIRCLE_SIZE,
        height: CIRCLE_SIZE,
    },
    circle: {
        position: 'absolute',
        width: CIRCLE_SIZE,
        height: CIRCLE_SIZE,
        borderRadius: CIRCLE_SIZE / 2,
        backgroundColor: PALE_BLUE,
    },
    tabLabel: {
        fontFamily: CustomFonts.ztnatureregular,
        fontSize: 14,
        color: DARK_GREEN,
        paddingTop: 5,
    },
    tabLabelFocused: {
        fontFamily: CustomFonts.ztnaturebold,
        fontSize: 18,
        color: BRIGHT_BLUE,
        transform: [{ translateY: -3 }],
        textShadowColor: BRIGHT_BLUE,
        textShadowOffset: { width: 0, height: 0 },
        textShadowRadius: 8,
    },
});

export default Layout;