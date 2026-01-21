import CloudIcon from "@/assets/images/cloud-icon.svg";
import SmileyFace from "@/assets/images/smiley-face.svg";
import SpeechBubbles from "@/assets/images/speech-bubbles.svg";
import { CustomFonts } from "@/constants/theme";
import { DEV_FLAG } from "@/environment";
import { usePushNotifications } from "@/hooks/use-push-notifications";
import { BOLD_BLUE, BURGUNDY, PALE_BLUE } from "@/styles/styles";
import { BlurView } from "expo-blur";
import { GlassView, isLiquidGlassAvailable } from "expo-glass-effect";
import { Tabs } from "expo-router";
import React from "react";
import { StyleSheet, Text, View } from "react-native";

const supportsGlass = isLiquidGlassAvailable();
console.log("supports glass -", supportsGlass)

const ICON_SIZE = 33;
const CIRCLE_SIZE = 70;

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

function TabIcon({
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
        initialRouteName="index"
        screenOptions={{
            tabBarActiveTintColor: BURGUNDY,
            tabBarInactiveTintColor: BOLD_BLUE,
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
                  //tintColor={CREAM}
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
                        <TabLabel label="Friends" focused={focused} />
                    ),
                    tabBarIcon: ({ color, focused }) => (
                        <TabIcon
                            Icon={SmileyFace}
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
                    title: "Chats",
                    tabBarLabel: ({ focused }) => (
                        <TabLabel label="Chats" focused={focused} />
                    ),
                    tabBarIcon: ({ color, focused }) => (
                        <TabIcon                            Icon={SpeechBubbles}
                            focused={focused}
                            color={color}
                            height={ICON_SIZE+ 10}
                            width={ICON_SIZE+10}
                        />
                    ),
                    headerShown: false,
                    tabBarHideOnKeyboard: true,
                }}
            />
            <Tabs.Screen
                name="settings"
                options={{
                    title: 'Settings',
                    href: DEV_FLAG ? undefined : null,// hide behind dev flag
                    tabBarLabel: ({ focused }) => (
                        <TabLabel label="Settings" focused={focused} />
                    ),
                    tabBarIcon: ({ color, focused }) => (
                        <TabIcon
                            Icon={CloudIcon}
                            focused={focused}
                            color={color}
                            height={ICON_SIZE+ 15}
                            width={ICON_SIZE+15}
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
        margin: 20,
    },
    circle: {
        position: 'absolute',
        width: CIRCLE_SIZE,
        height: CIRCLE_SIZE,
        borderRadius: CIRCLE_SIZE / 2,
        backgroundColor: PALE_BLUE,
    },
    tabLabel: {
        fontFamily: CustomFonts.ztnaturebold,
        fontSize: 18,
        color: BOLD_BLUE,
        padding: 5,
    },
    tabLabelFocused: {
        fontFamily: CustomFonts.ztnaturebold,
        fontSize: 22,
        color: BURGUNDY,
        transform: [{ translateY: -8 }],
    },
});

export default Layout;