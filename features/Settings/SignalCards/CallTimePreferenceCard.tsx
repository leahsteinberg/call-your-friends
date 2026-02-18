import { EventCard } from "@/components/EventCard/EventCard";
import TimezonePicker, { detectUserTimezone } from "@/components/TimezonePicker/TimezonePicker";
import { CustomFonts } from '@/constants/theme';
import { useAddUserSignalMutation } from "@/services/userSignalsApi";
import { BOLD_BROWN, BURGUNDY, CREAM, PALE_BLUE } from "@/styles/styles";
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
    const [selectedTimes, setSelectedTimes] = useState<TimeOfDay[]>(["EVENING"]);
    const [selectedTimezone, setSelectedTimezone] = useState<string>(detectUserTimezone());

    useEffect(() => {
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

    const toggleTimeSelection = async (time: TimeOfDay) => {
        const newTimes = selectedTimes.includes(time)
            ? selectedTimes.filter(t => t !== time)
            : [...selectedTimes, time];

        if (newTimes.length === 0) return;

        setSelectedTimes(newTimes);
        await savePreferences(newTimes);
    };

    const handleTimezoneChange = async (timezone: string) => {
        setSelectedTimezone(timezone);
        await savePreferences(selectedTimes, timezone);
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
});
