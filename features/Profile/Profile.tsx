import { CustomFonts } from "@/constants/theme";
import { CORNFLOWER_BLUE } from "@/styles/styles";
import { RootState } from "@/types/redux";
import React from "react";
import { Platform, StyleSheet, Text, View } from 'react-native';
import { useSelector } from "react-redux";
import SuggestedWalkBySteps from "../StepTime/SuggestedWalkBySteps";
import BroadcastNowButton from '../Today/BroadcastNowButton';
import TodayList from "../Today/TodayList";

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
                <BroadcastNowButton />
            </View>


            <TodayList />
            {Platform.OS === 'ios' &&
                <SuggestedWalkBySteps/>
            }
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
        // overflow: 'scroll',
        flex: 1,
    },
    headerContainer: {
        flexDirection: 'row',
        //alignItems: 'center',
        marginBottom: 20,

        justifyContent: 'space-between',

    },
    // flowerStyle: {
    //     position: 'absolute',
    //     zIndex: 0,
    //     marginTop: -10,
    //     marginLeft: -4,
    //     transform: [{ rotate: '15deg' }],
    // },
    greetingText: {
        // fontSize: 20,
        // fontWeight: '600',
        color: CORNFLOWER_BLUE,
        //marginLeft: 80,

        marginTop: 37,
        marginHorizontal: 15,
        fontFamily: CustomFonts.ztnaturebold,
        fontSize: 50,
        fontWeight: '600',
        zIndex: 1,
    },
    component: {}
});