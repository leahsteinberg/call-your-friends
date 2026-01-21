import { CustomFonts } from "@/constants/theme";
import { APP_BACKGROUND_COLOR, APP_HEADER_TEXT_COLOR } from "@/styles/styles";
import { RootState } from "@/types/redux";
import { GlassView, isLiquidGlassAvailable } from "expo-glass-effect";
import React from "react";
import { Platform, StyleSheet, Text, View } from 'react-native';
import { useSelector } from "react-redux";
import TodayList from "../Today/TodayList";

const safePadding = Platform.OS === 'ios' ? 60 : 10;
const supportsGlass = isLiquidGlassAvailable();

export default function Profile(): React.JSX.Element {
    const userName = useSelector((state: RootState) => state.auth.user.name);
    const getGreetingText = () => {return userName ? `Hi, ${userName}` : 'Loyal';}
    return (
        <View style={styles.container}>
            <View>
                <GlassView
                  style={[styles.headerContainer]}
                >
                <Text style={styles.greetingText}>{getGreetingText()}</Text>
                </GlassView>
            </View>
            <TodayList />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        minHeight: 400,
        minWidth: 300,
        justifyContent: 'space-between',
        backgroundColor: APP_BACKGROUND_COLOR,
        flex: 1,
    },
    headerContainer: {
        flexDirection: 'row',
        paddingHorizontal: 10,
        zIndex: 99,
        paddingBottom: 8,
        justifyContent: 'space-between',
        marginHorizontal: 15,
        borderRadius: 20,
    },
    greetingText: {
        color: APP_HEADER_TEXT_COLOR,
        fontFamily: CustomFonts.ztnaturebold,
        fontSize: 36,
        fontWeight: '600',
    },
    component: {

    }
});