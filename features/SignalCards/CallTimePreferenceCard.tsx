import ToggleSwitch from "@/components/ToggleSwitch";
import { CustomFonts } from '@/constants/theme';
import { useAddUserSignalMutation, useRemoveUserSignalMutation } from "@/services/userSignalsApi";
import { BRIGHT_BLUE, CHARTREUSE, CREAM, DARK_GREEN } from "@/styles/styles";
import { RootState } from "@/types/redux";
import { CALL_TIME_PREFERENCE_SIGNAL_TYPE, CallTimePreferencePayload, SignalType, UserSignal } from "@/types/userSignalsTypes";
import { useEffect, useState } from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useSelector } from "react-redux";

interface CallTimePreferenceCardProps {
    userSignal?: UserSignal<SignalType> | null;
}

type TimeOfDay = "MORNING" | "AFTERNOON" | "EVENING" | "LATE_NIGHT";

const TIME_OPTIONS: { value: TimeOfDay; label: string }[] = [
    { value: "MORNING", label: "Morning" },
    { value: "AFTERNOON", label: "Afternoon" },
    { value: "EVENING", label: "Evening" },
    { value: "LATE_NIGHT", label: "Late Night" },
];

export default function CallTimePreferenceCard({ userSignal }: CallTimePreferenceCardProps) {
    const userId = useSelector((state: RootState) => state.auth.user.id);
    const [addUserSignal] = useAddUserSignalMutation();
    const [removeUserSignal] = useRemoveUserSignalMutation();
    const [isActive, setIsActive] = useState<boolean>(!!userSignal);
    const [optimisticActive, setOptimisticActive] = useState<boolean>(!!userSignal);
    const [selectedTimes, setSelectedTimes] = useState<TimeOfDay[]>(["EVENING"]);

    useEffect(() => {
        const newValue = !!userSignal;
        setIsActive(prevValue => prevValue !== newValue ? newValue : prevValue);
        setOptimisticActive(prevValue => prevValue !== newValue ? newValue : prevValue);

        // Load existing preferences if signal exists
        if (userSignal && userSignal.payload) {
            const payload = userSignal.payload as any;
            if (payload.preferredTimes) {
                setSelectedTimes(payload.preferredTimes);
            }
        }
    }, [userSignal]);

    const handleAddCallTimePreference = async () => {
        try {
            const payload: CallTimePreferencePayload = { preferredTimes: selectedTimes };
            await addUserSignal({
                userId,
                type: CALL_TIME_PREFERENCE_SIGNAL_TYPE,
                payload
            }).unwrap();
        } catch (error) {
            console.error("Error setting call time preference:", error);
            alert('Failed to set call time preference. Please try again.');
        }
    };

    const handleRemoveCallTimePreference = async () => {
        try {
            if (userSignal) {
                await removeUserSignal({ userId, signalId: userSignal.id }).unwrap();
            }
        } catch (error) {
            console.error("Error removing call time preference:", error);
            alert('Failed to remove call time preference. Please try again.');
        }
    };

    const handleToggle = async () => {
        const newValue = !optimisticActive;
        setOptimisticActive(newValue); // Optimistic update

        try {
            if (isActive) {
                await handleRemoveCallTimePreference();
            } else {
                await handleAddCallTimePreference();
            }
        } catch (error) {
            // Revert on error
            setOptimisticActive(!newValue);
            throw error;
        }
    };

    const toggleTimeSelection = (time: TimeOfDay) => {
        setSelectedTimes(prev => {
            if (prev.includes(time)) {
                // Don't allow deselecting if it's the only one selected
                if (prev.length === 1) return prev;
                return prev.filter(t => t !== time);
            } else {
                return [...prev, time];
            }
        });
    };

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.title}>
                    Preferred times for calls
                </Text>
            </View>

            {optimisticActive && (
                <View style={styles.timeOptionsContainer}>
                    {TIME_OPTIONS.map(option => (
                        <TouchableOpacity
                            key={option.value}
                            style={[
                                styles.timeOption,
                                selectedTimes.includes(option.value) && styles.timeOptionSelected
                            ]}
                            onPress={() => toggleTimeSelection(option.value)}
                        >
                            <Text style={[
                                styles.timeOptionText,
                                selectedTimes.includes(option.value) && styles.timeOptionTextSelected
                            ]}>
                                {option.label}
                            </Text>
                        </TouchableOpacity>
                    ))}
                </View>
            )}

            <View style={styles.toggleContainer}>
                <View style={styles.toggle}>
                    <ToggleSwitch
                        value={optimisticActive}
                        onValueChange={handleToggle}
                        activeColor={CHARTREUSE}
                        inactiveColor={CREAM}
                        thumbColor={CREAM}
                    />
                </View>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        backgroundColor: DARK_GREEN,
        padding: 16,
        marginVertical: 8,
        marginHorizontal: 15,
        borderRadius: 12,
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        elevation: 5,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 8,
    },
    title: {
        fontWeight: 'bold',
        color: CREAM,
        fontSize: 16,
        flex: 1,
        marginRight: 12,
        fontFamily: CustomFonts.ztnaturemedium,
    },
    toggle: {
        flex: 1,
        flexDirection: 'row',
    },
    toggleContainer: {
        justifyContent: 'flex-end',
        alignContent: 'flex-end',
        alignItems: 'flex-end',
        paddingBottom: 20,
    },
    timeOptionsContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 8,
        marginBottom: 16,
    },
    timeOption: {
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 16,
        backgroundColor: CREAM,
        borderWidth: 2,
        borderColor: CREAM,
    },
    timeOptionSelected: {
        backgroundColor: BRIGHT_BLUE,
        borderColor: BRIGHT_BLUE,
    },
    timeOptionText: {
        fontSize: 14,
        fontFamily: CustomFonts.ztnaturemedium,
        color: DARK_GREEN,
    },
    timeOptionTextSelected: {
        color: CREAM,
    },
});
