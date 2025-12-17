import { CustomFonts } from "@/constants/theme";
import { useGetSignalsQuery } from "@/services/userSignalsApi";
import { CREAM, DARK_GREEN } from "@/styles/styles";
import { RootState } from "@/types";
import React, { useEffect } from "react";
import { Platform, StyleSheet, Text, View } from "react-native";
import { useSelector } from "react-redux";
import SuggestedWalkBySteps from "../StepTime/SuggestedWalkBySteps";
import AddMeetingsButton from "./AddMeetingsButton";

export default function Settings(): React.JSX.Element {
    const userId: string = useSelector((state: RootState) => state.auth.user.id);
    
    const {
        data: userSignals = [],
        isLoading,
        refetch
    } = useGetSignalsQuery({ userId });

    useEffect(() => {}, []);

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
