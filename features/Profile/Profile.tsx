import React from "react";
import { Platform, StyleSheet, View } from 'react-native';
import SuggestedWalkBySteps from "../StepTime/SuggestedWalkBySteps";
import TodayList from "../Today/TodayList";
import SignOutButton from "./SignOutButton";

export default function Profile(): React.JSX.Element {
    return (
        <View style={styles.container}>
            <TodayList />
            {Platform.OS === 'ios' &&
                <SuggestedWalkBySteps/>
            }
            <SignOutButton />
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
    component: {}
});