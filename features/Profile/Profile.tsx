import { CustomFonts } from "@/constants/theme";
import { RootState } from "@/types/redux";
import React from "react";
import { Platform, StyleSheet, Text, View } from 'react-native';
import { useSelector } from "react-redux";
import SuggestedWalkBySteps from "../StepTime/SuggestedWalkBySteps";
import TodayList from "../Today/TodayList";

export default function Profile(): React.JSX.Element {
    const userName = useSelector((state: RootState) => state.auth.user.name);

    return (
        <View style={styles.container}>
            <Text style={styles.greetingText}>Hi, {userName}</Text>
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
    greetingText: {
        // fontSize: 20,
        // fontWeight: '600',
        color: '#2D5016',
        marginTop: 8,
        marginHorizontal: 15,
        fontFamily: CustomFonts.catamaran,
        fontSize: 30,
        fontWeight: '600',
    },
    component: {}
});