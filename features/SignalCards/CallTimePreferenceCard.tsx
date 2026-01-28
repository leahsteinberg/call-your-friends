import FlowerBlob from "@/assets/images/flower-blob.svg";
import { EventCard } from "@/components/EventCard/EventCard";
import TimezonePicker, { detectUserTimezone } from "@/components/TimezonePicker/TimezonePicker";
import ToggleSwitch from "@/components/ToggleSwitch";
import { CustomFonts } from '@/constants/theme';
import { useAddUserSignalMutation, useRemoveUserSignalMutation } from "@/services/userSignalsApi";
import { BOLD_BLUE, BOLD_BROWN, BURGUNDY, CREAM, PALE_BLUE } from "@/styles/styles";
import { RootState } from "@/types/redux";
import { CallTimePreferencePayload, SignalType, TIME_OF_DAY_PREFERENCE_SIGNAL_TYPE, UserSignal } from "@/types/userSignalsTypes";
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
    const [selectedTimezone, setSelectedTimezone] = useState<string>(detectUserTimezone());

    useEffect(() => {
        const newValue = !!userSignal;
        setIsActive(prevValue => prevValue !== newValue ? newValue : prevValue);
        setOptimisticActive(prevValue => prevValue !== newValue ? newValue : prevValue);

        if (userSignal && userSignal.payload) {
            const payload = userSignal.payload as CallTimePreferencePayload;
            if (payload.preferredTimes) {
                setSelectedTimes(payload.preferredTimes as TimeOfDay[]);
            }
            if (payload.timezone) {
                setSelectedTimezone(payload.timezone);
            }
        }
    }, [userSignal]);

    const savePreferences = async (times: TimeOfDay[], timezone?: string) => {
        try {
            const payload: CallTimePreferencePayload = {
                preferredTimes: times,
                timezone: timezone || selectedTimezone,
            };
            await addUserSignal({
                userId,
                type: TIME_OF_DAY_PREFERENCE_SIGNAL_TYPE,
                payload
            }).unwrap();
        } catch (error) {
            console.error("Error setting call time preference:", error);
            alert('Failed to save preferences. Please try again.');
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
        setOptimisticActive(newValue);

        try {
            if (isActive) {
                await handleRemoveCallTimePreference();
            } else {
                await savePreferences(selectedTimes);
            }
        } catch (error) {
            setOptimisticActive(!newValue);
            throw error;
        }
    };

    const toggleTimeSelection = async (time: TimeOfDay) => {
        const newTimes = selectedTimes.includes(time)
            ? selectedTimes.filter(t => t !== time)
            : [...selectedTimes, time];

        if (newTimes.length === 0) return;

        setSelectedTimes(newTimes);

        if (isActive && userSignal) {
            await savePreferences(newTimes);
        }
    };

    const handleTimezoneChange = async (timezone: string) => {
        setSelectedTimezone(timezone);

        if (isActive && userSignal) {
            await savePreferences(selectedTimes, timezone);
        }
    };

    return (
        <EventCard backgroundColor={BURGUNDY}>
            <EventCard.Header spacing="between" align="center">
                <EventCard.Title color={CREAM}>
                    Preferred call times
                </EventCard.Title>
            </EventCard.Header>

            <EventCard.Body>
                <TimezonePicker
                    selectedTimezone={selectedTimezone}
                    onTimezoneChange={handleTimezoneChange}
                />

                <EventCard.Description color={PALE_BLUE}>
                    When do you like to chat?
                </EventCard.Description>

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

                <View style={styles.toggleRow}>
                    <Text style={styles.toggleLabel}>
                        {optimisticActive ? 'Sharing with friends' : 'Not sharing'}
                    </Text>
                    <ToggleSwitch
                        value={optimisticActive}
                        onValueChange={handleToggle}
                        activeColor={PALE_BLUE}
                        inactiveColor={CREAM}
                    >
                        <FlowerBlob
                            width={30}
                            height={30}
                            fill={BOLD_BLUE}
                        />
                    </ToggleSwitch>
                </View>
            </EventCard.Body>
        </EventCard>
    );
}

const styles = StyleSheet.create({
    timeOptionsContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 8,
        marginTop: 12,
        marginBottom: 16,
    },
    timeOption: {
        paddingHorizontal: 14,
        paddingVertical: 8,
        borderRadius: 18,
        backgroundColor: 'transparent',
        borderWidth: 1.5,
        borderColor: PALE_BLUE,
    },
    timeOptionSelected: {
        backgroundColor: PALE_BLUE,
        borderColor: PALE_BLUE,
    },
    timeOptionText: {
        fontSize: 14,
        fontFamily: CustomFonts.ztnaturemedium,
        color: PALE_BLUE,
    },
    timeOptionTextSelected: {
        color: BOLD_BROWN,
    },
    toggleRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    toggleLabel: {
        fontSize: 14,
        color: CREAM,
        fontFamily: CustomFonts.ztnaturemedium,
        opacity: 0.8,
    },
});
