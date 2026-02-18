import { IconSymbol } from "@/components/ui/icon-symbol";
import { CustomFonts } from "@/constants/theme";
import { usePushNotifications } from "@/hooks/use-push-notifications";
import { FUN_BLUE } from "@/styles/styles";
import { BlurView } from "expo-blur";
import { GlassView } from "expo-glass-effect";
import { Tabs } from "expo-router";
import React from "react";
import { StyleSheet, Text } from "react-native";

const supportsGlass = false;//isLiquidGlassAvailable();
console.log("supports glass -", supportsGlass)

const ICON_SIZE = 26;
const INACTIVE_COLOR = 'grey';//'rgba(254, 251, 234, 0.45)';

function TabLabel({ label, focused, focusedColor }: { label: string; focused: boolean; focusedColor: string }) {
    return (
        <Text
            style={[
                styles.tabLabel,
                focused && { ...styles.tabLabelFocused, color: focusedColor },
            ]}
        >
            {label}
        </Text>
    );
}

function TabIcon({ name, focused, activeColor }: {
    name: string;
    focused: boolean;
    activeColor: string;
}) {
    return (
        <IconSymbol
            name={name as any}
            size={ICON_SIZE}
            fill='transparent'
            color={focused ? activeColor : INACTIVE_COLOR}
            weight={focused ? 'semibold' : 'regular'}
        />
    );
}

const Layout = () => {
    usePushNotifications();

    return (
        <Tabs
        initialRouteName="index"
        screenOptions={{
            tabBarStyle: {
              backgroundColor: 'transparent',
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
              overflow: 'hidden',
            },
            tabBarBackground: () => (
              supportsGlass ? (
                <GlassView
                   style={StyleSheet.absoluteFill}
                   glassEffectStyle="clear"
                />
              ) : (
                <BlurView
                  intensity={80}
                  tint="light"
                  style={StyleSheet.absoluteFill}
                />
              )
            ),
            headerShown: false,
          }}
        >
            <Tabs.Screen
                name="friends"
                options={{
                    title: 'Friends',
                    tabBarLabel: ({ focused }) => (
                        <TabLabel label="Friends" focused={focused} focusedColor={FUN_BLUE} />
                    ),
                    tabBarIcon: ({ focused }) => (
                        <TabIcon name="person.2.fill" focused={focused} activeColor={FUN_BLUE} />
                    ),
                    headerShown: false,
                    tabBarHideOnKeyboard: true,
                }}
            />
            <Tabs.Screen
                name="index"
                options={{
                    title: "Chats",
                    tabBarLabel: ({ focused }) => (
                        <TabLabel label="Chats" focused={focused} focusedColor={FUN_BLUE} />
                    ),
                    tabBarIcon: ({ focused }) => (
                        <TabIcon name="message.fill" focused={focused} activeColor={FUN_BLUE} />
                    ),
                    headerShown: false,
                    tabBarHideOnKeyboard: true,
                }}
            />
            <Tabs.Screen
                name="settings"
                options={{
                    title: 'Settings',
                    tabBarLabel: ({ focused }) => (
                        <TabLabel label="Settings" focused={focused} focusedColor={FUN_BLUE} />
                    ),
                    tabBarIcon: ({ focused }) => (
                        <TabIcon name="gear" focused={focused} activeColor={FUN_BLUE} />
                    ),
                    headerShown: false,
                    tabBarHideOnKeyboard: true,
                }}
            />
        </Tabs>
    );
};


const styles = StyleSheet.create({
    tabLabel: {
        fontFamily: CustomFonts.ztnaturebold,
        fontSize: 18,
        color: INACTIVE_COLOR,
        padding: 5,
    },
    tabLabelFocused: {
        fontSize: 18,
        //transform: [{ translateY: -8 }],
    },
});

export default Layout;
