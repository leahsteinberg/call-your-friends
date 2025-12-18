import FlowerBlob from '@/assets/images/flower-blob.svg';
import ToggleSwitch from "@/components/ToggleSwitch";

import { CustomFonts } from '@/constants/theme';
import { useAddUserSignalMutation, useRemoveUserSignalMutation } from "@/services/userSignalsApi";
import { CHARTREUSE, CREAM, DARK_GREEN, ORANGE } from "@/styles/styles";
import { RootState } from "@/types/redux";
import { SignalType, UserSignal, WALK_PATTERN_SIGNAL_TYPE, WalkPatternPayload } from "@/types/userSignalsTypes";
import { queryQuantitySamples, useHealthkitAuthorization, type QuantitySample } from '@kingstinct/react-native-healthkit';
import { useEffect, useState } from "react";
import { Platform, StyleSheet, Text, View } from "react-native";
import { useSelector } from "react-redux";
import { displayDateTime } from '../Meetings/meetingsUtils';
import { getDayAndTime, processStepsData } from '../Settings/useHealthKitData';

const HK_DATA_TYPE = 'HKQuantityTypeIdentifierStepCount';
const DAYS_OF_HISTORY = 200;
const MAX_ENTRIES = 2000;

interface GetPastDateParams {
    daysAgo: number;
}

const getPastDate = ({ daysAgo }: GetPastDateParams): Date => {
    const pastDate = new Date();
    pastDate.setHours(0, 0, 0, 0);
    pastDate.setDate(pastDate.getDate() - daysAgo);
    return pastDate;
}

interface SuggestedWalkByStepsProps {
    userSignal?: UserSignal<SignalType> | null;
}

export default function SuggestedWalkBySteps({ userSignal }: SuggestedWalkByStepsProps) {
    console.log("user signal in suggestion walk --", userSignal);
    const userId = useSelector((state: RootState) => state.auth.user.id);
    const [loading, setLoading] = useState<boolean>(true);
    const [isAuthorized, setIsAuthorized] = useState<boolean>(false);
    const [suggestedWalkTime, setSuggestedWalkTime] = useState<string>('');
    const [suggestedWalkDateTime, setSuggestedWalkDateTime] = useState<Date | null>(null);
    const [authorizationStatus, requestAuthorization] = useHealthkitAuthorization([HK_DATA_TYPE]);
    const [stepsData, setStepsData] = useState<QuantitySample[]>([]);
    const [addUserSignal] = useAddUserSignalMutation();
    const [removeUserSignal] = useRemoveUserSignalMutation();
    const [dayName, setDayName] = useState<string>('');
    const [hourNumber, setHourNumber] = useState<number>(0);
    const [isActive, setIsActive] = useState<boolean>(!!userSignal);
    const [optimisticActive, setOptimisticActive] = useState<boolean>(!!userSignal);
    const pastDate = getPastDate({ daysAgo: DAYS_OF_HISTORY });
    const today = new Date();


    useEffect(() => {
        const fetchHealthKitDataAndGenerateSuggestion = async () => {
            try {
                // Request HealthKit authorization
                const authResponse = await requestAuthorization([HK_DATA_TYPE]);
                if (authResponse) {
                    setIsAuthorized(true);
                }
            } catch (error) {
                console.error('Error requesting HealthKit authorization:', error);
            }

            try {
                if (isAuthorized) {
                    // Query step count data from HealthKit
                    const stepsSamples = await queryQuantitySamples(
                        HK_DATA_TYPE,
                        {
                            filter: {
                                startDate: pastDate,
                                endDate: today
                            },
                            limit: MAX_ENTRIES,
                        }
                    );

                    // Process steps data to find the best time for a walk
                    // This analyzes historical step patterns to suggest when the user is most active
                    const suggestedWalkDateTimeStr = processStepsData(stepsSamples);
                    const {dayName, hour} = getDayAndTime(stepsSamples);
                    console.log("{dayName, hour}", {dayName, hour});
                    setDayName(dayName);
                    setHourNumber(hour);

                    const suggestedDateTime = new Date(suggestedWalkDateTimeStr);

                    setSuggestedWalkDateTime(suggestedDateTime);
                    const displayString = await displayDateTime(suggestedDateTime.toISOString());
                    setSuggestedWalkTime(displayString);
                    setStepsData([...stepsSamples]);
                    setLoading(false);
                }
            } catch (error) {
                console.error("Error fetching steps data:", error);
            }
        };
        if (Platform.OS !== 'web') {
            fetchHealthKitDataAndGenerateSuggestion();
        }
    }, [isAuthorized]);

    useEffect(() => {
        const newValue = !!userSignal;
        setIsActive(prevValue => prevValue !== newValue ? newValue : prevValue);
        setOptimisticActive(prevValue => prevValue !== newValue ? newValue : prevValue);
    }, [userSignal]);

    const handleAddWalkSignal = async () => {
        try {
            const payload: WalkPatternPayload = { dayName, hour: hourNumber };
            await addUserSignal({
                userId,
                type: WALK_PATTERN_SIGNAL_TYPE,
                payload
            }).unwrap();
        } catch (error) {
            console.error("Error setting walk pattern:", error);
            alert('Failed to set walk pattern. Please try again.');
        }
        
    };

    const handleRemoveWalkSignal = async () => {
        try {
            if (userSignal) {
                await removeUserSignal({ userId, signalId: userSignal.id }).unwrap();
            }
        } catch (error) {
            console.error("Error removing walk pattern:", error);
            alert('Failed to remove walk pattern. Please try again.');
        }
    };

    const handleToggle = async () => {
        const newValue = !optimisticActive;
        setOptimisticActive(newValue); // Optimistic update
        if (Platform.OS === 'web') {
            return;
        }
        try {
            if (isActive) {
                await handleRemoveWalkSignal();
            } else {
                await handleAddWalkSignal();
            }
        } catch (error) {
            // Revert on error
            setOptimisticActive(!newValue);
            throw error;
        }
    };


    return (
        <View
            style={[
                styles.container,
            ]}
        >
            <View style={styles.header}>
                <Text style={styles.title}>
                    Walking patterns to coordinate walk & talks
                </Text>

            </View>
            <View style={styles.toggleContainer}>
                <View style={styles.toggle}>
                    <ToggleSwitch
                        value={optimisticActive}
                        onValueChange={handleToggle}
                        //disabled={isDisabled}
                        activeColor={CHARTREUSE}
                        inactiveColor={CREAM}
                        thumbColor={CREAM}
                    >
                        <FlowerBlob
                            fill={ORANGE}
                        />
                    </ToggleSwitch>
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
        //backgroundColor: PEACH,
        flexDirection: 'row',

    },
    toggleContainer: {
        justifyContent: 'flex-end',
        alignContent: 'flex-end',
        alignItems: 'flex-end',
        paddingBottom: 20,

        //backgroundColor: CORNFLOWER_BLUE,
    }
});