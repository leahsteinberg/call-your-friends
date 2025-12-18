import Butterfly from "@/assets/images/butterfly.svg";
import FlowerBlob from "@/assets/images/flower-blob.svg";
import HighFiveStar from "@/assets/images/high-five-star.svg";

import { CustomFonts } from "@/constants/theme";
import { usePushNotifications } from "@/hooks/use-push-notifications";
import { BRIGHT_BLUE, DARK_GREEN, LIGHT_BURGUNDY } from "@/styles/styles";
import { Tabs } from "expo-router";
import React from "react";
import { StyleSheet, View } from "react-native";
import Animated, { useAnimatedStyle, useSharedValue, withTiming } from "react-native-reanimated";

const ICON_SIZE = 33;
const CIRCLE_SIZE = 70;

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
    const scale = useSharedValue(0);

    React.useEffect(() => {
        scale.value = withTiming(focused ? 1 : 0, {
            duration: 400,
        });
    }, [focused, scale]);

    const circleStyle = useAnimatedStyle(() => ({
        transform: [{ scale: scale.value }],
        opacity: scale.value * 0.3,
    }));

    return (
        <View style={styles.iconWrapper}>
            <Animated.View style={[styles.circle, circleStyle]} />
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
            tabBarLabelStyle: {
                paddingTop: 5,
                fontSize: 15,
                fontFamily: CustomFonts.ztnatureregular,
            },
            headerShown: false,
          }}
        >
            <Tabs.Screen
                name="friends"
                options={{
                    title: 'Friends',
                    tabBarLabel: 'Friends',
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
                    tabBarLabel: 'Settings',
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
        backgroundColor: BRIGHT_BLUE,
    },
});

export default Layout;