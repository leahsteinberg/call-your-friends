import { CustomFonts } from "@/constants/theme";
import { useUserSignals } from "@/hooks/useUserSignals";
import { CREAM, DARK_GREEN } from "@/styles/styles";
import { RootState } from "@/types";
import React, { useEffect } from "react";
import { Platform, StyleSheet, View } from "react-native";
import { useSelector } from "react-redux";
import SuggestedWalkBySteps from "../StepTime/SuggestedWalkBySteps";

export default function UserSignalSettings(): React.JSX.Element {
    const userId: string = useSelector((state: RootState) => state.auth.user.id);

    const { userSignals, isLoading } = useUserSignals();
    
    useEffect(() => {
        console.log("in use effect settings -", userSignals);

    }, [userSignals]);

    return (
        <View style={styles.container}>
            {Platform.OS === 'ios' &&
                <SuggestedWalkBySteps/>
            }
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: CREAM,
        // padding: 20,
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        color: DARK_GREEN,
        fontFamily: CustomFonts.ztnaturemedium,
        marginBottom: 20,
    },
});
