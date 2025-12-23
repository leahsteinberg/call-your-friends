import { CustomFonts } from "@/constants/theme";
import { useUserSignals } from "@/hooks/useUserSignals";
import { CREAM, DARK_GREEN } from "@/styles/styles";
import { RootState } from "@/types";
import { CALL_TIME_PREFERENCE_SIGNAL_TYPE, SignalType, UserSignal, WALK_PATTERN_SIGNAL_TYPE, WORK_HOURS_SIGNAL_TYPE } from "@/types/userSignalsTypes";
import React, { useEffect, useState } from "react";
import { StyleSheet, Text, View } from "react-native";
import { useSelector } from "react-redux";
import CallTimePreferenceCard from "../SignalCards/CallTimePreferenceCard";
import SuggestedWalkBySteps from "../SignalCards/WalkingSignalCard";
import WorkHoursCard from "../SignalCards/WorkHoursCard";

export default function UserSignalSettings(): React.JSX.Element {
    const userId: string = useSelector((state: RootState) => state.auth.user.id);
    const [walkSignal, setWalkSignal] = useState<UserSignal<SignalType> | null>();
    const [workHoursSignal, setWorkHoursSignal] = useState<UserSignal<SignalType> | null>();
    const [callTimeSignal, setCallTimeSignal] = useState<UserSignal<SignalType> | null>();
    const { userSignals, isLoading } = useUserSignals();

    useEffect(() => {
        const walkUserSignals = userSignals
            .filter(signal => signal.type === WALK_PATTERN_SIGNAL_TYPE);
        if (walkUserSignals && walkUserSignals.length > 0) {
            setWalkSignal(walkUserSignals[0]);
        } else {
            setWalkSignal(null);
        }

        const workHoursUserSignals = userSignals
            .filter(signal => signal.type === WORK_HOURS_SIGNAL_TYPE);
        if (workHoursUserSignals && workHoursUserSignals.length > 0) {
            setWorkHoursSignal(workHoursUserSignals[0]);
        } else {
            setWorkHoursSignal(null);
        }

        const callTimeUserSignals = userSignals
            .filter(signal => signal.type === CALL_TIME_PREFERENCE_SIGNAL_TYPE);
        if (callTimeUserSignals && callTimeUserSignals.length > 0) {
            setCallTimeSignal(callTimeUserSignals[0]);
        } else {
            setCallTimeSignal(null);
        }
    }, [userSignals]);

    return (
        <View style={styles.container}>
            <View>
                <Text style={styles.signalText}></Text>
            </View>
            <SuggestedWalkBySteps userSignal={walkSignal}/>
            <WorkHoursCard userSignal={workHoursSignal}/>
            <CallTimePreferenceCard userSignal={callTimeSignal}/>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
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
