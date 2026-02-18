import { EventCard } from "@/components/EventCard/EventCard";
import ToggleSwitch from "@/components/ToggleSwitch";
import { CustomFonts } from '@/constants/theme';
import { useAddUserSignalMutation, useRemoveUserSignalMutation } from "@/services/userSignalsApi";
import { BURGUNDY, CREAM, PALE_BLUE } from "@/styles/styles";
import { RootState } from "@/types/redux";
import { SignalType, UserSignal, WORK_HOURS_SIGNAL_TYPE, WorkHoursPayload } from "@/types/userSignalsTypes";
import { useEffect, useState } from "react";
import { StyleSheet, Text, View } from "react-native";
import { useSelector } from "react-redux";

interface WorkHoursCardProps {
    userSignal?: UserSignal<SignalType> | null;
}

export default function WorkHoursCard({ userSignal }: WorkHoursCardProps) {
    const userId = useSelector((state: RootState) => state.auth.user.id);
    const [addUserSignal] = useAddUserSignalMutation();
    const [removeUserSignal] = useRemoveUserSignalMutation();
    const [isActive, setIsActive] = useState<boolean>(!!userSignal);
    const [optimisticActive, setOptimisticActive] = useState<boolean>(!!userSignal);

    useEffect(() => {
        const newValue = !!userSignal;
        setIsActive(prevValue => prevValue !== newValue ? newValue : prevValue);
        setOptimisticActive(prevValue => prevValue !== newValue ? newValue : prevValue);
    }, [userSignal]);

    const handleAddWorkHours = async () => {
        try {
            const payload: WorkHoursPayload = { startHour: 9, endHour: 17 };
            await addUserSignal({
                userId,
                type: WORK_HOURS_SIGNAL_TYPE,
                payload
            }).unwrap();
        } catch (error) {
            console.error("Error setting work hours:", error);
            alert('Failed to set work hours. Please try again.');
        }
    };

    const handleRemoveWorkHours = async () => {
        try {
            if (userSignal) {
                await removeUserSignal({ userId, signalId: userSignal.id }).unwrap();
            }
        } catch (error) {
            console.error("Error removing work hours:", error);
            alert('Failed to remove work hours. Please try again.');
        }
    };

    const handleToggle = async () => {
        const newValue = !optimisticActive;
        setOptimisticActive(newValue);

        try {
            if (isActive) {
                await handleRemoveWorkHours();
            } else {
                await handleAddWorkHours();
            }
        } catch (error) {
            setOptimisticActive(!newValue);
            throw error;
        }
    };

    return (
        <EventCard backgroundColor={BURGUNDY}>
            <EventCard.Header spacing="between" align="center">
                <EventCard.Title color={CREAM}>
                    Work hours
                </EventCard.Title>
            </EventCard.Header>

            <EventCard.Body>
                <EventCard.Description color={PALE_BLUE}>
                    Don't suggest calls during 9 AM - 5 PM
                </EventCard.Description>

                <View style={styles.toggleRow}>
                    <Text style={styles.toggleLabel}>
                        {optimisticActive ? 'Enabled' : 'Disabled'}
                    </Text>
                    <ToggleSwitch
                        value={optimisticActive}
                        onValueChange={handleToggle}
                        activeColor={PALE_BLUE}
                        inactiveColor={CREAM}
                    />
                </View>
            </EventCard.Body>
        </EventCard>
    );
}

const styles = StyleSheet.create({
    toggleRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginTop: 12,
    },
    toggleLabel: {
        fontSize: 14,
        color: CREAM,
        fontFamily: CustomFonts.ztnaturemedium,
        opacity: 0.8,
    },
});
