import { CustomFonts } from "@/constants/theme";
import { useUserSignals } from "@/hooks/useUserSignals";
import { CREAM, DARK_GREEN } from "@/styles/styles";
import { RootState } from "@/types";
import { SignalType, UserSignal, WALK_PATTERN_SIGNAL_TYPE } from "@/types/userSignalsTypes";
import React, { useEffect, useState } from "react";
import { StyleSheet, Text, View } from "react-native";
import { useSelector } from "react-redux";
import SuggestedWalkBySteps from "../Settings/WalkingSignalCard";

export default function UserSignalSettings(): React.JSX.Element {
    const userId: string = useSelector((state: RootState) => state.auth.user.id);
    const [walkSignal, setWalkSignal] = useState<UserSignal<SignalType> | null>();
    const { userSignals, isLoading } = useUserSignals();
    
    useEffect(() => {
        const walkUserSignals = userSignals
            .filter(signal => signal.type === WALK_PATTERN_SIGNAL_TYPE);
        if (walkUserSignals && walkUserSignals.length > 0) {
            setWalkSignal(walkUserSignals[0]);
        } else {
            setWalkSignal(null);
        }
    }, [userSignals]);

    return (
        <View style={styles.container}>
            <View>
                <Text style={styles.signalText}>Hello</Text>
            </View>
            <SuggestedWalkBySteps userSignal={walkSignal}/>

            {/* {Platform.OS === 'ios' &&
                <SuggestedWalkBySteps userSignal={walkSignal}/>
            } */}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: CREAM,
        // padding: 20,
    },
    signalText:{
        fontSize: 24,
        fontWeight: 'bold',
        color: DARK_GREEN,
        fontFamily: CustomFonts.ztnaturemedium,
        marginBottom: 20,
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        color: DARK_GREEN,
        fontFamily: CustomFonts.ztnaturemedium,
        marginBottom: 20,
    },
});
