import { CustomFonts } from "@/constants/theme";
import { APP_BACKGROUND_COLOR, APP_HEADER_TEXT_COLOR } from "@/styles/styles";
import { RootState } from "@/types/redux";
import React from "react";
import { Platform, StyleSheet, Text, View } from 'react-native';
import { useSelector } from "react-redux";
import TodayList from "../Today/TodayList";
const safePadding = Platform.OS === 'ios' ? 60 : 10;

export default function Profile(): React.JSX.Element {
    const userName = useSelector((state: RootState) => state.auth.user.name);
    const getGreetingText = () => {return userName ? `Hi, ${userName}` : 'Loyal';}
    return (
        <View style={styles.container}>
            <View style={styles.headerContainer}>
                <View>
                <Text style={styles.greetingText}>{getGreetingText()}</Text>
                {/* <FlowersWithStem
                    style={styles.flowerStyle}
                    fill={PALE_BLUE}
                    height={150}
                    width={150}
                /> */}
                </View>
                {/* <BroadcastNowButton /> */}
            </View>
            <TodayList />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        minHeight: 400,
        minWidth: 300,
        // maxHeight: '100%',
        // maxWidth: '100%',
        //width: '100%',
        justifyContent: 'space-between',
        backgroundColor: APP_BACKGROUND_COLOR,
        flex: 1,
    },
    headerContainer: {
        flexDirection: 'row',
        zIndex: 99, // Sit above the scrolling TodayList
        paddingBottom: 8, // Extra padding so background extends
        justifyContent: 'space-between',
        marginHorizontal: 15,

    },
    greetingText: {
        color: APP_HEADER_TEXT_COLOR,
        fontFamily: CustomFonts.ztnaturebold,
        fontSize: 50,
        fontWeight: '600',
    },
    component: {

    }
});