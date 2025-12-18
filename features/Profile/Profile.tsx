import { CustomFonts } from "@/constants/theme";
import { CORNFLOWER_BLUE, CREAM } from "@/styles/styles";
import { RootState } from "@/types/redux";
import React from "react";
import { Platform, StyleSheet, Text, View } from 'react-native';
import { useSelector } from "react-redux";
import TodayList from "../Today/TodayList";
const safePadding = Platform.OS === 'ios' ? 60 : 10;

export default function Profile(): React.JSX.Element {
    const userName = useSelector((state: RootState) => state.auth.user.name);

    return (
        <View style={styles.container}>
            <View style={styles.headerContainer}>
                <View>
                <Text style={styles.greetingText}>Hi, {userName}</Text>
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
        maxHeight: '100%',
        maxWidth: '100%',
        width: '100%',
        justifyContent: 'space-between',
        //overflow: 'scroll',
        
        flex: 1,
    },
    headerContainer: {
        flexDirection: 'row',
        //alignItems: 'center',
        //marginBottom: 20,
        zIndex: 99, // Sit above the scrolling TodayList
        position: 'relative', // Create stacking context
        backgroundColor: CREAM, // Opaque background to hide content underneath
        paddingBottom: 8, // Extra padding so background extends
        // paddingTop: -safePadding,
        justifyContent: 'space-between',

    },

    greetingText: {
        color: CORNFLOWER_BLUE,
        marginHorizontal: 15,
        fontFamily: CustomFonts.ztnaturebold,
        fontSize: 50,
        fontWeight: '600',
    },
    component: {

    }
});