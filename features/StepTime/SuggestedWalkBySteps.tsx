import ToggleSwitch from "@/components/ToggleSwitch";
import { useAddUserSignalMutation, useRemoveUserSignalMutation } from "@/services/userSignalsApi";
import { BRIGHT_GREEN, CREAM, DARK_GREEN, LIGHT_BEIGE } from "@/styles/styles";
import { RootState } from "@/types/redux";
import { SignalType, UserSignal, WALK_PATTERN_SIGNAL_TYPE, WalkPatternPayload } from "@/types/userSignalsTypes";
import { queryQuantitySamples, useHealthkitAuthorization, type QuantitySample } from '@kingstinct/react-native-healthkit';
import { useEffect, useState } from "react";
import { StyleSheet, Text, View } from "react-native";
import { useSelector } from "react-redux";
import { displayDateTime } from '../Meetings/meetingsUtils';
import { getDayAndTime, processStepsData } from './useHealthKitData';

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
    const [loading, setLoading] = useState<boolean>(true);
    const [isAuthorized, setIsAuthorized] = useState<boolean>(false);
    const [suggestedWalkTime, setSuggestedWalkTime] = useState<string>('');
    const [suggestedWalkDateTime, setSuggestedWalkDateTime] = useState<Date | null>(null);
    const [authorizationStatus, requestAuthorization] = useHealthkitAuthorization([HK_DATA_TYPE]);
    const [stepsData, setStepsData] = useState<QuantitySample[]>([]);
    const userId = useSelector((state: RootState) => state.auth.user.id);
    const [addUserSignal, { isLoading: isAdding }] = useAddUserSignalMutation();
    const [removeUserSignal, { isLoading: isRemoving }] = useRemoveUserSignalMutation();
    const [dayName, setDayName] = useState<string>('');
    const [hourNumber, setHourNumber] = useState<number>(0);
    const [isActive, setIsActive] = useState<boolean>(!!userSignal);
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

        fetchHealthKitDataAndGenerateSuggestion();
    }, [isAuthorized]);

    useEffect(() => {
        setIsActive(!!userSignal);
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
        if (isActive) {
            await handleRemoveWalkSignal();
        } else {
            await handleAddWalkSignal();
        }
    };

    const isDisabled = !suggestedWalkDateTime || loading || isAdding || isRemoving;

    return (
        <View
            style={[
                styles.container,
                isActive && styles.activeContainer,
                //isDisabled && styles.disabledContainer
            ]}
        >
            <View style={styles.header}>
                <Text style={styles.title}>
                    Chat with a friend on your next walk.
                </Text>
                <ToggleSwitch
                    value={isActive}
                    onValueChange={handleToggle}
                    // disabled={isDisabled}
                    activeColor={BRIGHT_GREEN}
                    inactiveColor={CREAM}
                    thumbColor={DARK_GREEN}
                />
            </View>
            <Text style={styles.description}>
                Suggestion informed by your walking habits.
            </Text>
            <Text style={[styles.walkTime, isDisabled && styles.disabledText]}>
                {suggestedWalkTime || 'Loading...'}
            </Text>
            <Text style={styles.actionHint}>
                {isActive
                    ? 'Walk time preference set'
                    : 'Toggle to set walk time preference'
                }
            </Text>
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
    activeContainer: {
        backgroundColor: BRIGHT_GREEN,
        borderWidth: 2,
        borderColor: DARK_GREEN,
    },
    disabledContainer: {
        backgroundColor: '#ccc',
        opacity: 0.6,
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
    },
    description: {
        marginTop: 8,
        color: CREAM,
        fontSize: 14,
    },
    walkTime: {
        marginTop: 4,
        fontWeight: '600',
        color: CREAM,
        fontSize: 18,
    },
    disabledText: {
        color: '#666',
    },
    actionHint: {
        marginTop: 8,
        color: CREAM,
        fontSize: 12,
        fontStyle: 'italic',
        textAlign: 'center',
    },
    confirmationContainer: {
        backgroundColor: LIGHT_BEIGE,
        padding: 20,
        marginVertical: 8,
        marginHorizontal: 15,
        borderRadius: 12,
        borderWidth: 2,
        borderColor: BRIGHT_GREEN,
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.15,
        shadowRadius: 3.84,
        elevation: 5,
    },
    confirmationTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: DARK_GREEN,
        textAlign: 'center',
        marginBottom: 12,
    },
    confirmationTime: {
        fontSize: 20,
        fontWeight: 'bold',
        color: BRIGHT_GREEN,
        textAlign: 'center',
    },
});