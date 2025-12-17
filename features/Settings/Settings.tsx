import { CustomFonts } from "@/constants/theme";
import { useGetSignalsQuery } from "@/services/userSignalsApi";
import { CREAM, DARK_GREEN } from "@/styles/styles";
import React, { useEffect } from "react";
import { Dimensions, Platform, StyleSheet, Text, View } from "react-native";
import SuggestedWalkBySteps from "../StepTime/SuggestedWalkBySteps";
import AddMeetingsButton from "./AddMeetingsButton";

const SCREEN_HEIGHT = Dimensions.get('window').height;
const DRAWER_HEIGHT = SCREEN_HEIGHT * 0.5; // 50% of screen height
const SWIPE_THRESHOLD = 50; // pixels to swipe down before closing

export default function Settings(): React.JSX.Element {
    const getUserSignals = useGetSignalsQuery();

    useEffect(() => {


    }, []);

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Settings</Text>
            {Platform.OS === 'ios' &&
                <SuggestedWalkBySteps/>
            }
            <AddMeetingsButton/>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: CREAM,
        padding: 20,
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        color: DARK_GREEN,
        fontFamily: CustomFonts.ztnaturemedium,
        marginBottom: 20,
    },
});
