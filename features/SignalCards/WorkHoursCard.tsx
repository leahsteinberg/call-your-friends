import ToggleSwitch from "@/components/ToggleSwitch";
import { CustomFonts } from '@/constants/theme';
import { useAddUserSignalMutation, useRemoveUserSignalMutation } from "@/services/userSignalsApi";
import { CHARTREUSE, CREAM, DARK_GREEN } from "@/styles/styles";
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
            // Default work hours: 9 AM to 5 PM
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
        setOptimisticActive(newValue); // Optimistic update

        try {
            if (isActive) {
                await handleRemoveWorkHours();
            } else {
                await handleAddWorkHours();
            }
        } catch (error) {
            // Revert on error
            setOptimisticActive(!newValue);
            throw error;
        }
    };

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.title}>
                    Share work hours (9 AM - 5 PM)
                </Text>
            </View>
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
    }
});
